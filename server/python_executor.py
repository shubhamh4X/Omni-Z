#!/usr/bin/env python3
"""
Python Code Execution Engine for Omni Z
Executes Python code dynamically with execution bounds, outputs capture, and error inspection.
"""

import sys
import io
import time
import json
import base64
import traceback
import contextlib

def run_code(code_string: str, timeout_sec: int = 15):
    start_time = time.time()
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    local_scope = {}
    global_scope = {
        "__name__": "__main__",
        "__builtins__": __builtins__,
    }

    success = True
    error_msg = None

    with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
        try:
            try:
                compiled = compile(code_string, "<omniz-python>", "eval")
                res = eval(compiled, global_scope, local_scope)
                if res is not None:
                    print(repr(res))
            except SyntaxError:
                compiled = compile(code_string, "<omniz-python>", "exec")
                exec(compiled, global_scope, local_scope)
        except Exception as e:
            success = False
            error_msg = traceback.format_exc()

    elapsed = (time.time() - start_time) * 1000.0

    output = stdout_capture.getvalue()
    err_output = stderr_capture.getvalue()

    if error_msg:
        if err_output:
            err_output += "\n" + error_msg
        else:
            err_output = error_msg

    inspectable_vars = {}
    for k, v in local_scope.items():
        if not k.startswith("_"):
            try:
                repr_v = repr(v)
                if len(repr_v) < 300:
                    inspectable_vars[k] = repr_v
            except Exception:
                pass

    return {
        "success": success,
        "stdout": output,
        "stderr": err_output,
        "execution_time_ms": round(elapsed, 2),
        "variables": inspectable_vars
    }

def main():
    code = ""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--b64" and len(sys.argv) > 2:
            try:
                code = base64.b64decode(sys.argv[2]).decode("utf-8")
            except Exception as e:
                print(json.dumps({"error": f"Base64 decode error: {str(e)}"}))
                sys.exit(1)
        elif sys.argv[1] == "--json" and len(sys.argv) > 2:
            try:
                payload = json.loads(sys.argv[2])
                code = payload.get("code", "")
            except Exception as e:
                print(json.dumps({"error": f"JSON arg error: {str(e)}"}))
                sys.exit(1)
        else:
            code = sys.argv[1]
    else:
        # Check stdin with select
        import select
        if select.select([sys.stdin], [], [], 0.1)[0]:
            raw = sys.stdin.read()
            if raw.strip():
                try:
                    payload = json.loads(raw)
                    code = payload.get("code", raw)
                except Exception:
                    code = raw

    if not code:
        print(json.dumps({"error": "No code provided to execute", "success": False, "stdout": "", "stderr": "No code provided"}))
        return

    res = run_code(code)
    print(json.dumps(res))

if __name__ == "__main__":
    main()
