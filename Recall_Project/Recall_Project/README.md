# Recall — Smart Workspace Recovery System

A DSA mini-project demonstrating how two **C++ stacks** can power Undo, Redo, and document recovery in a small web-based text editor.

## Features
- Edit a document in the browser.
- Undo and redo changes using two C++ stacks.
- View a version history.
- Restore an earlier version.
- See the live contents of both stacks.
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo).

## Technology
- C++17: Stack implementation and state operations.
- Python + Flask: connects the website to the C++ program.
- HTML, CSS, JavaScript: user interface.

## Requirements
1. Windows 10/11.
2. Python 3 installed.
3. A C++ compiler (`g++`) installed and available in PATH.
   - If using MSYS2, install the UCRT64 toolchain and run the project from the UCRT64 terminal.
   - Make sure `g++ --version` works in the same terminal where you start Flask.

## Run on Windows (MSYS2 UCRT64)
Open the UCRT64 terminal and go to the project folder. Example:

```bash
cd /c/Users/YOUR_WINDOWS_USERNAME/Recall_Project
g++ --version
python --version
```

If `python` is not found in MSYS2, use your Windows Python executable directly, for example:

```bash
"/c/Users/YOUR_WINDOWS_USERNAME/AppData/Local/Programs/Python/Python312/python.exe" --version
```

Install Flask (use the same Python executable you will use to run the server):

```bash
python -m pip install -r requirements.txt
```

Start the project:

```bash
python server.py
```

The server compiles the C++ program automatically. When you see the local address, open:

`http://127.0.0.1:5000`

## How to demonstrate it
1. The page opens with a sample assignment.
2. Add a sentence. The previous document state is pushed onto the Undo Stack.
3. Add another sentence, then delete something.
4. Click Undo. The latest previous state is popped from Undo and the current state is pushed to Redo.
5. Click Redo. The reverse transfer happens.
6. Restore an older version from Version History.

## Stack logic
- **Push:** save the previous document state before applying a new edit.
- **Pop:** retrieve the most recent saved state during Undo or Redo.
- **LIFO:** the most recently saved state is recovered first.
- **Two stacks:** Undo and Redo maintain separate histories.
- **New edit after Undo:** clears Redo, because the old redo sequence no longer describes the new editing path.

## Important implementation note
The browser keeps the version-history list for the current page session. The C++ stacks power the actual Undo/Redo operations. This starter version does not save documents permanently to disk or a database; refreshing the page resets the demo.
