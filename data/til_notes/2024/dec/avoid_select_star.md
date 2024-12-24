# Notes on Avoiding SELECT *

### Key Takeaway: 💡🌍🍏
Avoid using SELECT * in database queries, even on single-column tables, to prevent performance issues and inefficiencies. Instead, explicitly specify the columns you need.

---

### Real-World Example: 🔄🔢🌐
- **Incident Description (2012):**
  - A backend API previously running in single-digit milliseconds experienced severe slowdowns (500ms to 2 seconds).
  - Root cause: A SELECT * query on a table with added blob fields caused database, network, and deserialization overhead.
  - Resolution: The issue arose because SELECT * inadvertently retrieved large, unused blob fields.

---

### Reasons to Avoid SELECT * 🕳️📊🔌
1. **Performance Issues Due to Added Columns:**
   - Example: A table initially had two integer columns.
   - Later, three large blob fields were added, causing the backend to unnecessarily process these fields.

2. **Database Reads and Page Access:**
   - Data in row-store databases is organized in pages, with rows and columns stored together.
   - SELECT * fetches all columns into memory, even unused ones, causing unnecessary overhead.

3. **Incompatibility with Index-Only Scans:**
   - SELECT * forces the database to fetch heap data, even if an index-only scan suffices.
   - Example:
     - Query: Fetch IDs of students scoring >90.
     - If SELECT * is used, the optimizer must access the heap to fetch unnecessary fields, increasing I/O operations.
     - Without SELECT *, the database can scan the index directly, improving performance.

4. **Deserialization Overhead:**
   - SELECT * requires all columns to be deserialized, even those not needed by the client.
   - This increases computational cost and slows down queries.

5. **Handling Large Columns:**
   - Large fields like text, JSON, XML, or blob data are often stored externally (e.g., TOAST tables in PostgreSQL).
   - SELECT * forces the database to:
     - Fetch these external fields.
     - Decompress and return them, even if not needed by the client.

6. **Network Cost:**
   - Query results must be serialized before transmission.
   - More data means higher serialization and transmission costs, increasing network latency.

7. **Client-Side Overhead:**
   - The client must deserialize all received data.
   - More data slows this process, particularly when dealing with large or complex fields.

8. **Unpredictability:**
   - SELECT * can introduce future performance issues:
     - Example: An admin adds large fields to a table; existing SELECT * queries start fetching these fields unnecessarily.
     - The code does not change, but performance degrades.

9. **Code Maintainability:**
   - Explicit column selection aids in codebase searches (e.g., using grep) for columns in use.
   - Simplifies database schema changes (e.g., renaming or dropping columns).

---

### Benefits of Avoiding SELECT * 🌿🌱🍀
1. **Improved Query Performance:**
   - Only fetch the data you need, reducing computational and I/O costs.
2. **Optimized Resource Usage:**
   - Minimize database, network, and client-side overhead.
3. **Predictability:**
   - Prevent unforeseen performance issues due to schema changes.
4. **Ease of Maintenance:**
   - Clear and explicit queries make debugging and schema evolution more manageable.

---

### Summary: 📊🔍🌟
- While SELECT * might seem convenient, it often leads to inefficiencies and future performance issues.
- Best Practice:
  - Always specify the required columns explicitly.
  - Only use SELECT * in ad-hoc queries for debugging or exploration, not in production code.
- Considerations:
  - The impact of SELECT * is negligible for tables with few columns and simple data types.
  - However, it’s a good habit to avoid it to future-proof your queries.

---

### Additional Insights: 🔦🔢🌍
- **Index-Only Scan:**
  - SELECT * forces access to heap data, negating the performance benefits of index-only scans.
- **TOAST Tables (PostgreSQL):**
  - Avoid fetching large, externally stored fields unnecessarily.
- **Serialization/Deserialization:**
  - Limit the data volume to optimize client and network performance.

---

### Final Note: 📜🔧🌏
Avoiding SELECT * is a fundamental practice for writing efficient, maintainable, and scalable database queries. Always aim for precision and clarity in your SQL statements.

For more advanced tips, explore Hussein Nasser’s Backend and Database courses.

