# SQLGlot - Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Core Features](#core-features)
4. [Basic Usage](#basic-usage)
5. [SQL Parsing](#sql-parsing)
6. [SQL Transpilation](#sql-transpilation)
7. [Query Optimization](#query-optimization)
8. [Advanced Features](#advanced-features)
9. [Working with Dialects](#working-with-dialects)
10. [Error Handling](#error-handling)
11. [Performance Optimization](#performance-optimization)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

## Introduction

SQLGlot is a powerful SQL parser, transpiler, and formatter written in Python. It enables:
- Converting SQL between different dialects
- Parsing SQL into Abstract Syntax Trees (ASTs)
- Optimizing SQL queries
- Executing SQL queries on Python dictionaries
- Custom dialect creation and extension

## Installation

```bash
pip install sqlglot
```

## Core Features

### 1. Basic SQL Operations

```python
import sqlglot

# Parse SQL
sql = "SELECT * FROM users WHERE age > 21"
parsed = sqlglot.parse_one(sql)

# Format SQL
formatted = sqlglot.format(sql, pretty=True)

# Transpile SQL
mysql_to_postgres = sqlglot.transpile(sql, read='mysql', write='postgres')[0]
```

### 2. Expression Building

```python
from sqlglot import exp

# Build a query programmatically
query = exp.Select(
    expressions=[exp.Column("id"), exp.Column("name")],
    from_=exp.Table("users"),
    where=exp.GT(exp.Column("age"), exp.Literal(21))
)

print(query.sql())
```

Output:
```sql
SELECT id, name FROM users WHERE age > 21
```

## SQL Parsing

### 1. Basic Parsing

```python
import sqlglot

# Parse a simple query
sql = """
SELECT 
    id,
    name,
    age
FROM users
WHERE age > 21
"""

parsed = sqlglot.parse_one(sql)
print(parsed.pretty())
```

Output:
```sql
SELECT
  id,
  name,
  age
FROM users
WHERE
  age > 21
```

### 2. AST Inspection

```python
# Examine the AST structure
sql = "SELECT a + 1 AS sum_value FROM table_name"
ast = sqlglot.parse_one(sql)
print(repr(ast))
```

Output:
```python
Select(
  expressions=[
    Alias(
      this=Add(
        this=Column(this=Identifier(this=a, quoted=False)),
        expression=Literal(this=1, is_string=False)
      ),
      alias=Identifier(this=sum_value, quoted=False)
    )
  ],
  from_=Table(this=Identifier(this=table_name, quoted=False))
)
```

## SQL Transpilation

### 1. Basic Dialect Conversion

```python
import sqlglot

# Convert between dialects
postgres_query = """
SELECT 
    date_trunc('month', created_at) as month,
    count(*) as total
FROM orders
GROUP BY 1
"""

snowflake_query = sqlglot.transpile(
    postgres_query,
    read='postgres',
    write='snowflake'
)[0]

print(snowflake_query)
```

Output:
```sql
SELECT 
    DATE_TRUNC('MONTH', created_at) as month,
    COUNT(*) as total
FROM orders
GROUP BY 1
```

### 2. Complex Transformations

```python
# Handle dialect-specific functions
bigquery_query = """
SELECT 
    GENERATE_UUID() as id,
    CURRENT_TIMESTAMP() as created_at,
    ARRAY_AGG(DISTINCT user_id) as unique_users
FROM events
"""

postgres_query = sqlglot.transpile(
    bigquery_query,
    read='bigquery',
    write='postgres',
    pretty=True
)[0]

print(postgres_query)
```

Output:
```sql
SELECT 
    GEN_RANDOM_UUID() as id,
    CURRENT_TIMESTAMP as created_at,
    ARRAY_AGG(DISTINCT user_id) as unique_users
FROM events
```

## Query Optimization

### 1. Basic Optimization

```python
from sqlglot.optimizer import optimize

# Optimize a complex query
query = """
SELECT 
    DISTINCT a.id,
    a.name 
FROM (
    SELECT * 
    FROM users 
    WHERE age > 21
) a 
WHERE a.status = 'active'
"""

optimized = optimize(query)
print(optimized.sql(pretty=True))
```

Output:
```sql
SELECT DISTINCT
    id,
    name
FROM users
WHERE 
    age > 21 
    AND status = 'active'
```

### 2. Schema-Aware Optimization

```python
from sqlglot.optimizer import optimize

# Define schema
schema = {
    "users": {
        "id": "INT",
        "name": "VARCHAR",
        "age": "INT",
        "status": "VARCHAR"
    }
}

# Optimize with schema awareness
query = """
SELECT 
    u.name,
    CAST(u.age AS STRING) as age_str
FROM users u
WHERE u.age > CAST('21' AS INT)
"""

optimized = optimize(
    query,
    schema=schema
)
print(optimized.sql(pretty=True))
```

Output:
```sql
SELECT
    "users"."name",
    CAST("users"."age" AS VARCHAR) AS "age_str"
FROM "users" AS "users"
WHERE "users"."age" > 21
```

## Advanced Features

### 1. Custom Expression Building

```python
from sqlglot import exp, select

# Build complex expressions
def build_analytical_query(table_name, metric_col, partition_cols, order_cols):
    return (
        select(
            exp.Column(metric_col),
            exp.Window(
                this=exp.Function("LAG", args=[exp.Column(metric_col)]),
                partition_by=[exp.Column(col) for col in partition_cols],
                order=[exp.Order(this=exp.Column(col)) for col in order_cols]
            ).as_("prev_value")
        )
        .from_(table_name)
        .sql(pretty=True)
    )

query = build_analytical_query(
    "sales",
    "amount",
    ["region", "product"],
    ["date"]
)
print(query)
```

Output:
```sql
SELECT
  amount,
  LAG(amount) OVER (
    PARTITION BY region, product
    ORDER BY date
  ) AS prev_value
FROM sales
```

### 2. SQL Execution Engine

```python
from sqlglot.executor import execute

# Define test data
tables = {
    "products": [
        {"id": 1, "name": "Product A", "price": 100},
        {"id": 2, "name": "Product B", "price": 200},
        {"id": 3, "name": "Product C", "price": 300}
    ],
    "sales": [
        {"product_id": 1, "quantity": 5},
        {"product_id": 1, "quantity": 3},
        {"product_id": 2, "quantity": 2},
        {"product_id": 3, "quantity": 1}
    ]
}

# Execute complex query
query = """
SELECT 
    p.name as product_name,
    SUM(p.price * s.quantity) as total_revenue
FROM products p
JOIN sales s ON p.id = s.product_id
GROUP BY p.name
HAVING SUM(p.price * s.quantity) > 500
ORDER BY total_revenue DESC
"""

result = execute(query, tables=tables)
print("Query Results:")
for row in result:
    print(row)
```

Output:
```
Query Results:
{'product_name': 'Product A', 'total_revenue': 800}
```

## Working with Dialects

### 1. Custom Dialect Creation

```python
from sqlglot import exp
from sqlglot.dialects.dialect import Dialect
from sqlglot.generator import Generator
from sqlglot.tokens import Tokenizer, TokenType

class CustomDialect(Dialect):
    class Tokenizer(Tokenizer):
        QUOTES = ["'", '"']
        IDENTIFIERS = ["`"]
        
        KEYWORDS = {
            **Tokenizer.KEYWORDS,
            "CUSTOM_TYPE": TokenType.BIGINT
        }
    
    class Generator(Generator):
        TYPE_MAPPING = {
            exp.DataType.Type.BIGINT: "CUSTOM_TYPE"
        }

# Register the dialect
Dialect.register("custom", CustomDialect)

# Use the custom dialect
sql = "SELECT CAST(value AS BIGINT) FROM table"
custom_sql = sqlglot.transpile(
    sql,
    write="custom"
)[0]
print(custom_sql)
```

Output:
```sql
SELECT CAST(value AS CUSTOM_TYPE) FROM table
```

## Error Handling

### 1. Parse Errors

```python
import sqlglot

def safe_parse(query):
    try:
        return sqlglot.parse_one(query)
    except sqlglot.errors.ParseError as e:
        print(f"Parse Error: {e}")
        print(f"Error Details: {e.errors}")
    except Exception as e:
        print(f"Unexpected Error: {e}")
    return None

# Test with invalid SQL
invalid_queries = [
    "SELECT * FROM",  # Incomplete
    "SELECT * FROM users WHERE;",  # Invalid WHERE clause
    "SELECT * FROM users GROUP BY",  # Incomplete GROUP BY
]

for query in invalid_queries:
    print(f"\nParsing: {query}")
    result = safe_parse(query)
```

### 2. Transpilation Errors

```python
def safe_transpile(query, source_dialect, target_dialect):
    try:
        return {
            "status": "success",
            "result": sqlglot.transpile(
                query,
                read=source_dialect,
                write=target_dialect,
                unsupported_level=sqlglot.ErrorLevel.RAISE
            )[0]
        }
    except sqlglot.errors.UnsupportedError as e:
        return {"status": "unsupported", "error": str(e)}
    except sqlglot.errors.ParseError as e:
        return {"status": "parse_error", "error": str(e)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# Test cases
test_cases = [
    {
        "query": "SELECT GENERATE_UUID() as id",
        "from": "bigquery",
        "to": "postgres"
    },
    {
        "query": "SELECT JSON_EXTRACT_PATH_TEXT(data, 'key')",
        "from": "postgres",
        "to": "mysql"
    }
]

for case in test_cases:
    print(f"\nTranspiling from {case['from']} to {case['to']}:")
    print(f"Query: {case['query']}")
    result = safe_transpile(case['query'], case['from'], case['to'])
    print(f"Result: {result}")
```

## Performance Optimization

### 1. Query Caching

```python
from functools import lru_cache
import time

@lru_cache(maxsize=1000)
def cached_parse(query: str):
    return sqlglot.parse_one(query)

# Performance comparison
query = """
SELECT 
    id,
    name,
    age,
    created_at
FROM users
WHERE status = 'active'
GROUP BY id, name, age, created_at
HAVING COUNT(*) > 1
"""

# Without cache
start = time.time()
for _ in range(1000):
    sqlglot.parse_one(query)
no_cache_time = time.time() - start

# With cache
start = time.time()
for _ in range(1000):
    cached_parse(query)
cache_time = time.time() - start

print(f"Time without cache: {no_cache_time:.3f} seconds")
print(f"Time with cache: {cache_time:.3f} seconds")
print(f"Speed improvement: {(no_cache_time/cache_time):.1f}x")
```

### 2. Batch Processing

```python
def batch_transpile(queries, source_dialect, target_dialect):
    results = []
    for query in queries:
        try:
            result = sqlglot.transpile(
                query,
                read=source_dialect,
                write=target_dialect,
                pretty=True
            )[0]
            results.append({
                "original": query,
                "transformed": result,
                "status": "success"
            })
        except Exception as e:
            results.append({
                "original": query,
                "error": str(e),
                "status": "error"
            })
    return results

# Test batch processing
test_queries = [
    "SELECT * FROM users WHERE id = 1",
    "SELECT COUNT(*) FROM orders GROUP BY status",
    "SELECT * FROM products ORDER BY price DESC LIMIT 10"
]

results = batch_transpile(test_queries, 'mysql', 'postgres')
for result in results:
    print(f"\nOriginal: {result['original']}")
    print(f"Status: {result['status']}")
    if result['status'] == 'success':
        print(f"Transformed: {result['transformed']}")
    else:
        print(f"Error: {result['error']}")
```

## Best Practices

### 1. Query Building

```python
from sqlglot import exp, select

def build_safe_query(table_name, columns, conditions=None):
    """Build a SQL query safely with proper error handling"""
    try:
        # Start with basic SELECT
        query = select(*[exp.Column(col) for col in columns])
        
        # Add FROM clause
        query = query.from_(table_name)
        
        # Add WHERE clause if conditions exist
        if conditions:
            where_clause = exp.and_(*[
                exp.EQ(exp.Column(k), exp.Literal(v))
                for k, v in conditions.items()
            ])
            query = query.where(where_clause)
        
        return query.sql(pretty=True)
    except Exception as e:
        raise ValueError(f"Error building query: {e}")

# Example usage
try:
    query = build_safe_query(
        "users",
        ["id", "name", "email"],
        {"status": "active", "age": 21}
    )
    print(query)
except ValueError as e:
    print(f"Failed to build query: {e}")
```

### 2. Dialect Handling

```python
def get_dialect_features(dialect_name):
    """Get supported features for a specific dialect"""
    try:
        dialect = sqlglot.Dialect.get(dialect_name)
        return {
            "name": dialect_name,
            "tokenizer": {
                "quotes": dialect.Tokenizer.QUOTES,
                "identifiers": dialect.Tokenizer.IDENTIFIERS
            },
            "generator": {
                "type_mapping": dialect.Generator.TYPE_MAPPING
            }
        }
    except Exception as e:
        return f"Error getting dialect features: {e}"

# Example usage
dialects = ["postgres", "mysql", "snowflake"]
for dialect in dialects:
    features = get_dialect_features(dialect)
    print(f"\n{dialect} features:")
    print(features)
```
