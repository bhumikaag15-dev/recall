from flask import Flask, request, jsonify, send_from_directory
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND = os.path.join(ROOT, "frontend")
SOURCE = os.path.join(ROOT, "src", "main.cpp")
BINARY = os.path.join(ROOT, "recall_engine.exe" if os.name == "nt" else "recall_engine")

app = Flask(__name__, static_folder=FRONTEND)

def compile_cpp():
    command = [
        "g++", "-std=c++17", "-O2",
        SOURCE, "-o", BINARY
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, cwd=ROOT)
    except FileNotFoundError:
        raise RuntimeError(
            "g++ was not found. Install MSYS2/MinGW-w64 and make sure g++ is on PATH."
        )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or "C++ compilation failed.")

def to_hex(value):
    return value.encode("utf-8").hex()

def from_hex(value):
    return bytes.fromhex(value).decode("utf-8") if value else ""

def run_engine(action, current, new_text, undo, redo):
    lines = [
        action,
        to_hex(current),
        to_hex(new_text),
        str(len(undo))
    ]
    lines.extend(to_hex(item) for item in undo)
    lines.append(str(len(redo)))
    lines.extend(to_hex(item) for item in redo)
    payload = "\n".join(lines) + "\n"

    result = subprocess.run(
        [BINARY],
        input=payload,
        capture_output=True,
        text=True,
        cwd=ROOT
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "C++ engine error.")

    output = result.stdout.splitlines()
    index = 0
    current_out = from_hex(output[index]); index += 1

    undo_count = int(output[index]); index += 1
    undo_out = [from_hex(output[index + i]) for i in range(undo_count)]
    index += undo_count

    redo_count = int(output[index]); index += 1
    redo_out = [from_hex(output[index + i]) for i in range(redo_count)]

    return {
        "current": current_out,
        "undo": undo_out,
        "redo": redo_out
    }

@app.route("/")
def home():
    return send_from_directory(FRONTEND, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(FRONTEND, path)

@app.route("/api/action", methods=["POST"])
def action():
    data = request.get_json(silent=True) or {}
    try:
        result = run_engine(
            data.get("action", "view"),
            data.get("current", ""),
            data.get("newText", ""),
            data.get("undo", []),
            data.get("redo", [])
        )
        return jsonify(result)
    except Exception as error:
        return jsonify({"error": str(error)}), 500

if __name__ == "__main__":
    try:
        compile_cpp()
        print("Recall C++ engine compiled successfully.")
        print("Open http://127.0.0.1:5000 in your browser.")
        app.run(host="127.0.0.1", port=5001, debug=False)
    except Exception as error:
        print("ERROR:", error)
        sys.exit(1)
