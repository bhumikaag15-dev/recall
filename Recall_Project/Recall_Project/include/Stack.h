#ifndef STACK_H
#define STACK_H

#include <vector>
#include <stdexcept>

template <typename T>
class Stack {
private:
    std::vector<T> items;

public:
    void push(const T& value) {
        items.push_back(value);
    }

    T pop() {
        if (isEmpty()) {
            throw std::runtime_error("Stack is empty");
        }
        T value = items.back();
        items.pop_back();
        return value;
    }

    T top() const {
        if (isEmpty()) {
            throw std::runtime_error("Stack is empty");
        }
        return items.back();
    }

    bool isEmpty() const {
        return items.empty();
    }

    int size() const {
        return static_cast<int>(items.size());
    }

    const std::vector<T>& getItems() const {
        return items;
    }
};

#endif
