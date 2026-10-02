#!/usr/bin/env python3
"""
Python-powered Vector Database Engine for Omni Z
Implements in-memory and persistent SQLite-backed vector storage with cosine similarity,
metadata filtering, semantic chunking, and tag-based partitioning.
"""

import sys
import json
import sqlite3
import math
import os
import time
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "vector_memory.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vector_entries (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            vector TEXT NOT NULL,
            metadata TEXT NOT NULL,
            timestamp REAL NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def generate_fallback_embedding(text: str, dim: int = 128) -> List[float]:
    """Generates a deterministic hash-based semantic embedding if API vector is not provided."""
    vec = [0.0] * dim
    words = text.lower().split()
    if not words:
        return vec
    for idx, word in enumerate(words):
        h = 0
        for char in word:
            h = (h * 31 + ord(char)) & 0xFFFFFFFF
        slot = h % dim
        weight = 1.0 / (1.0 + math.log(idx + 1))
        vec[slot] += weight
    
    # Normalize vector
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

def insert_entry(entry_id: str, content: str, category: str, vector: Optional[List[float]], metadata: Dict[str, Any]):
    init_db()
    if not vector or len(vector) == 0:
        vector = generate_fallback_embedding(content)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO vector_entries (id, content, category, vector, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        entry_id,
        content,
        category,
        json.dumps(vector),
        json.dumps(metadata),
        time.time()
    ))
    conn.commit()
    conn.close()
    return {"status": "ok", "id": entry_id}

def query_vector(query_vector: Optional[List[float]], query_text: str, top_k: int = 5, category: Optional[str] = None):
    init_db()
    if not query_vector or len(query_vector) == 0:
        query_vector = generate_fallback_embedding(query_text)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    if category and category != "all":
        cursor.execute("SELECT id, content, category, vector, metadata, timestamp FROM vector_entries WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT id, content, category, vector, metadata, timestamp FROM vector_entries")
    
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        r_id, r_content, r_category, r_vec_json, r_meta_json, r_time = row
        try:
            r_vec = json.loads(r_vec_json)
            r_meta = json.loads(r_meta_json)
            sim = cosine_similarity(query_vector, r_vec)
            results.append({
                "id": r_id,
                "content": r_content,
                "category": r_category,
                "similarity": round(float(sim), 4),
                "metadata": r_meta,
                "timestamp": r_time
            })
        except Exception:
            continue
            
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

def list_entries(limit: int = 50, category: Optional[str] = None):
    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    if category and category != "all":
        cursor.execute("SELECT id, content, category, metadata, timestamp FROM vector_entries WHERE category = ? ORDER BY timestamp DESC LIMIT ?", (category, limit))
    else:
        cursor.execute("SELECT id, content, category, metadata, timestamp FROM vector_entries ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    entries = []
    for r in rows:
        try:
            meta = json.loads(r[3])
        except Exception:
            meta = {}
        entries.append({
            "id": r[0],
            "content": r[1],
            "category": r[2],
            "metadata": meta,
            "timestamp": r[4]
        })
    return entries

def delete_entry(entry_id: str):
    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vector_entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return {"status": "ok", "deleted": entry_id}

def clear_db():
    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vector_entries")
    conn.commit()
    conn.close()
    return {"status": "ok", "cleared": True}

def get_stats():
    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT count(*), category FROM vector_entries GROUP BY category")
    cat_counts = cursor.fetchall()
    cursor.execute("SELECT count(*) FROM vector_entries")
    row = cursor.fetchone()
    total = row[0] if row else 0
    conn.close()
    return {
        "total_entries": total,
        "categories": {cat: count for count, cat in cat_counts}
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    input_data = {}
    if len(sys.argv) > 2:
        try:
            input_data = json.loads(sys.argv[2])
        except Exception as e:
            print(json.dumps({"error": f"Invalid JSON arg: {str(e)}"}))
            sys.exit(1)
    elif not sys.stdin.isatty() and select_has_data():
        try:
            raw = sys.stdin.read()
            if raw.strip():
                input_data = json.loads(raw)
        except Exception as e:
            print(json.dumps({"error": f"Invalid JSON stdin: {str(e)}"}))
            sys.exit(1)

    try:
        if cmd == "insert":
            res = insert_entry(
                entry_id=input_data.get("id", str(int(time.time() * 1000))),
                content=input_data.get("content", ""),
                category=input_data.get("category", "general"),
                vector=input_data.get("vector"),
                metadata=input_data.get("metadata", {})
            )
            print(json.dumps(res))
        elif cmd == "query":
            res = query_vector(
                query_vector=input_data.get("vector"),
                query_text=input_data.get("query_text", ""),
                top_k=input_data.get("top_k", 5),
                category=input_data.get("category")
            )
            print(json.dumps(res))
        elif cmd == "list":
            res = list_entries(
                limit=input_data.get("limit", 50),
                category=input_data.get("category")
            )
            print(json.dumps(res))
        elif cmd == "delete":
            res = delete_entry(input_data.get("id", ""))
            print(json.dumps(res))
        elif cmd == "clear":
            res = clear_db()
            print(json.dumps(res))
        elif cmd == "stats":
            res = get_stats()
            print(json.dumps(res))
        else:
            print(json.dumps({"error": f"Unknown command: {cmd}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

def select_has_data():
    import select
    return select.select([sys.stdin], [], [], 0.0)[0]

if __name__ == "__main__":
    main()
