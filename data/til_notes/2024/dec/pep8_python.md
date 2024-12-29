# PEP 8 – Style Guide for Python Code

## **Introduction**

PEP 8 provides conventions to ensure that Python code is consistent, readable, and maintainable. It emphasizes readability and flexibility while encouraging project-specific adaptations.

---

## **Core Principles**

1. **Readability Counts**: Code is read more often than written.
2. **Consistency Hierarchy**:
   - Consistency with PEP 8.
   - Consistency within a project.
   - Consistency within a module/function.
3. **Exceptions**: Deviate from PEP 8 for readability, backward compatibility, or constraints imposed by older Python versions or existing code.

---

## **Code Layout**

### **Indentation**

- Use **4 spaces** per indentation level.
- Continuation lines should align with the opening delimiter or use hanging indents.

### **Tabs vs Spaces**

- **Spaces** are preferred.
- Use **tabs** only for consistency with existing tab-indented code.
- Mixing tabs and spaces is prohibited.

### **Maximum Line Length**

- Limit lines to **79 characters** (72 for docstrings/comments).
- Wrap lines using Python’s implicit line continuation within parentheses, brackets, or braces.
- Teams can extend this to **99 characters** with team agreement (docstrings/comments still at 72).

### **Blank Lines**

- Use **two blank lines** around top-level function and class definitions.
- Use **one blank line** between methods inside a class.
- Separate related groups of functions with blank lines.

### **Source File Encoding**

- Use **UTF-8** for all source files.
- Non-ASCII characters should only appear in comments, docstrings, or string literals when necessary.

---

## **Imports**

- Place imports at the **top** of the file, grouped in the following order:
  1. Standard library imports.
  2. Third-party library imports.
  3. Local imports.
- Use **absolute imports** where possible. Explicit relative imports are acceptable for complex layouts.
- Avoid **wildcard imports** (`from module import *`).

---

## **Naming Conventions**

### **General Naming Styles**

- **lowercase_with_underscores**: Functions, variables.
- **UPPERCASE_WITH_UNDERSCORES**: Constants.
- **CapitalizedWords (CamelCase)**: Classes and exceptions.
- **\_single_leading_underscore**: Non-public methods/variables.
- **\_\_double_leading_underscore**: Name mangling to prevent conflicts.
- ****double_leading_and_trailing_underscore****: Reserved for special methods (e.g., `__init__`).

### **Function and Variable Names**

- Use **lowercase_with_underscores**.
- Avoid single-character names except for counters (e.g., `i`, `j`).
- Use `self` and `cls` for instance and class methods respectively.

### **Class Names**

- Use **CamelCase** for classes.
- Add an "Error" suffix to exception class names.

---

## **Whitespace Guidelines**

### **Avoid Extraneous Whitespace**

- Inside parentheses, brackets, or braces.

```python
# Correct:
spam(ham[1], {eggs: 2})

# Wrong:
spam( ham[ 1 ], { eggs: 2 } )
```

- Between a trailing comma and closing parenthesis.
- Before a comma, semicolon, or colon.

### **Surround Operators with Spaces**

- Use a single space around assignment (`=`), comparison (`==`), and boolean operators (`and`, `or`).

```python
# Correct:
x = 1
y = x + 1

# Wrong:
x=1
y = x+1
```

---

## **Comments and Docstrings**

### **Comments**

- Keep comments up-to-date and ensure they are meaningful.
- Use block comments for sections of code, indented to the same level as the code they describe.
- Use inline comments sparingly; they should be separated by at least two spaces.
```python
x = x + 1  # Increment x
```

### **Docstrings**

- Write docstrings for all public modules, functions, classes, and methods.
- Use triple double quotes (`"""`) for docstrings.
```python
def example_function():
    """This function demonstrates a docstring."""
    pass
```

---

## **Programming Recommendations**

### **General Best Practices**

- Prefer `is` or `is not` for comparisons to `None`.
```python
# Correct:
if foo is not None:
```
- Use `isinstance()` for type comparisons instead of `type()`.
- Avoid `lambda` for defining functions; use `def` instead for clarity.

```python
# Correct:
def f(x): return 2 * x

# Wrong:
f = lambda x: 2 * x
```

### **Return Statements**

- Be consistent. Either all return statements in a function should return a value, or none should.
```python
# Correct:
def foo(x):
    if x > 0:
        return x
    return None
```

### **Chaining Exceptions**

- Use `raise Exception from original_exception` to preserve traceback.

### **Context Managers**

- Use `with` statements for resource management to ensure proper cleanup.
```python
# Correct:
with open('file.txt') as f:
    data = f.read()
```

---

## **Function and Variable Annotations**

### **PEP 484 Syntax**

- Use annotations to describe types of arguments and return values.
```python
def add_numbers(a: int, b: int) -> int:
    return a + b
```

### **Variable Annotations**

- Use annotations for variables where necessary.
```python
x: int = 42
```

---

## **Designing for Inheritance**

- Decide if attributes should be public or non-public. Public attributes:
  - Have no leading underscores.
  - Use properties to allow future functional changes.
- Use double leading underscores for attributes to avoid name clashes.

---

## **When to Use Trailing Commas**

- Mandatory for singleton tuples.
```python
FILES = ('setup.cfg',)
```
- Optional elsewhere but recommended in multiline structures for version control consistency.

---

## **Exceptions**

- Derive exceptions from `Exception`, not `BaseException`.
- Include the "Error" suffix for error exceptions.
- Use specific exceptions instead of bare `except` clauses.

---

## **Programming Details**

### **Comparisons**

- Avoid comparing `True` or `False` using `==`. Use the value directly:
```python
# Correct:
if greeting:
```

### **Empty Sequences**

- Use implicit falsy checks for sequences:

```python
# Correct:
if not seq:
```

### **Function Naming**

- Use explicit `def` statements for function declarations. Avoid assigning `lambda` expressions to variables.

### **Boolean Values**

- Don’t compare boolean values with `==`. Instead, rely on implicit truthiness.

### **Line Breaks**

- Prefer breaking lines **before** binary operators for readability.
