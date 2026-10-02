#!/usr/bin/env python3
"""
Seed initial knowledge base into Omni Z Vector Database
"""

import json
import time
import os
import sys

# Ensure server module importable
sys.path.append(os.path.dirname(__file__))
from vector_db import insert_entry, get_stats

INITIAL_MEMORIES = [
    {
        "id": "mem_agent_identity",
        "category": "system",
        "content": "Omni Z is an all-in-one universal cloud AI agent engineered with deep cognitive reasoning, native Python execution sandbox, vector database long-term memory, real-time Google search grounding, and KaTeX mathematical typesetting.",
        "metadata": {"source": "system_core", "importance": 1.0, "type": "agent_profile"}
    },
    {
        "id": "mem_python_capabilities",
        "category": "code",
        "content": "Omni Z backend features a high-performance native Python 3 execution sandbox capable of mathematical computation, algorithm benchmarks, data transformation, string parsing, statistical analysis, and simulation execution.",
        "metadata": {"source": "python_executor", "language": "python", "type": "capability"}
    },
    {
        "id": "mem_vector_db_specs",
        "category": "knowledge",
        "content": "The vector database utilizes semantic dense embeddings combined with cosine similarity matching to provide persistent long-term memory, context-aware memory recall, and document chunk retrieval across chat sessions.",
        "metadata": {"source": "vector_engine", "algorithm": "cosine_similarity", "type": "architecture"}
    },
    {
        "id": "mem_web_grounding",
        "category": "knowledge",
        "content": "Real-time Web Search Grounding connects Omni Z directly to the live internet, retrieving breaking news, current events, academic publications, technical documentation, and real-time market data with verifiable URL citations.",
        "metadata": {"source": "search_grounding", "freshness": "realtime", "type": "capability"}
    },
    {
        "id": "mem_math_latex_standard",
        "category": "knowledge",
        "content": "Mathematical rigor standard: All formulas, proofs, physics relations, and variables are expressed in LaTeX syntax ($$...$$ for display math and $...$ for inline math) rendered natively via KaTeX for immaculate publication-grade readability.",
        "metadata": {"source": "math_engine", "typesetting": "katex", "type": "standards"}
    },
    {
        "id": "mem_algorithms_dp",
        "category": "code",
        "content": "Dynamic programming and algorithm design principles: Optimal substructure and overlapping subproblems. Formulate recurrence relations clearly, analyze asymptotic time/space complexities O(V+E), and write verified, runnable Python solutions.",
        "metadata": {"source": "comp_sci", "domain": "algorithms", "type": "theory"}
    },
    {
        "id": "mem_quantum_formalism",
        "category": "knowledge",
        "content": "Quantum mechanics mathematical formalism: States exist as vectors in complex Hilbert space $\\mathcal{H}$. Superposition is expressed as $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ with normalization $|\\alpha|^2 + |\\beta|^2 = 1$. Operators are Hermitian observables.",
        "metadata": {"source": "physics", "domain": "quantum_mechanics", "type": "theory"}
    },
    {
        "id": "mem_distributed_systems",
        "category": "knowledge",
        "content": "Distributed systems core theorems: CAP theorem (Consistency, Availability, Partition tolerance), PACELC theorem, Raft and Paxos consensus state machines, vectorized logical clocks, event-driven idempotent messaging, and gossip protocols.",
        "metadata": {"source": "architecture", "domain": "distributed_systems", "type": "principles"}
    },
    {
        "id": "mem_document_intelligence",
        "category": "documents",
        "content": "Document intelligence engine: Extracts structured insights, statistical anomalies, schemas, and actionable summaries from multi-page PDFs, CSV spreadsheets, JSON payloads, Markdown files, and source codebases.",
        "metadata": {"source": "doc_engine", "supported_formats": ["pdf", "csv", "json", "md", "txt", "code"]}
    }
]

def seed():
    for mem in INITIAL_MEMORIES:
        insert_entry(
            entry_id=mem["id"],
            content=mem["content"],
            category=mem["category"],
            vector=None,
            metadata=mem["metadata"]
        )
    stats = get_stats()
    print(f"Vector DB knowledge base ready with {stats['total_entries']} entries.")

if __name__ == "__main__":
    seed()
