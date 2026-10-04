#include <iostream>
#include <string>
#include <vector>
#include "../include/Stack.h"

using namespace std;

// The Python server sends text as hexadecimal so even multi-line documents
// can safely travel through this simple command-line interface.
string decodeHex(const string& hex) {
    string result;
    for (size_t i = 0; i + 1 < hex.size(); i += 2) {
        try {
            int value = stoi(hex.substr(i, 2), nullptr, 16);
            result.push_back(static_cast<char>(value));
        } catch (...) {
            return "";
        }
    }
    return result;
}

string encodeHex(const string& text) {
    const char* digits = "0123456789abcdef";
    string result;
    for (unsigned char c : text) {
        result.push_back(digits[c >> 4]);
        result.push_back(digits[c & 15]);
    }
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string action, currentHex, newTextHex;
    int undoCount = 0, redoCount = 0;

    if (!getline(cin, action)) return 1;
    if (!getline(cin, currentHex)) return 1;
    if (!getline(cin, newTextHex)) return 1;
    if (!(cin >> undoCount)) return 1;
    cin.ignore();

    Stack<string> undoStack;
    Stack<string> redoStack;

    for (int i = 0; i < undoCount; ++i) {
        string item;
        getline(cin, item);
        undoStack.push(decodeHex(item));
    }

    if (!(cin >> redoCount)) return 1;
    cin.ignore();

    for (int i = 0; i < redoCount; ++i) {
        string item;
        getline(cin, item);
        redoStack.push(decodeHex(item));
    }

    string current = decodeHex(currentHex);
    string newText = decodeHex(newTextHex);

    if (action == "edit") {
        if (newText != current) {
            undoStack.push(current);
            current = newText;
            // A new edit makes the old redo path invalid.
            redoStack = Stack<string>();
        }
    } else if (action == "undo") {
        if (!undoStack.isEmpty()) {
            redoStack.push(current);
            current = undoStack.pop();
        }
    } else if (action == "redo") {
        if (!redoStack.isEmpty()) {
            undoStack.push(current);
            current = redoStack.pop();
        }
    } else if (action == "restore") {
        if (newText != current) {
            undoStack.push(current);
            current = newText;
            redoStack = Stack<string>();
        }
    } else if (action != "view") {
        cerr << "Unknown action";
        return 1;
    }

    cout << encodeHex(current) << '\n';

    cout << undoStack.size() << '\n';
    for (const auto& item : undoStack.getItems()) {
        cout << encodeHex(item) << '\n';
    }

    cout << redoStack.size() << '\n';
    for (const auto& item : redoStack.getItems()) {
        cout << encodeHex(item) << '\n';
    }

    return 0;
}
