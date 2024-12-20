# What is Latency and How to Reduce it?
By Ashish Pratap Singh
Dec 20, 2024
[Article](https://blog.algomaster.io/p/latency-and-how-to-reduce-it)

Latency is the time between a user taking an action—like clicking a button or loading a webpage—and receiving a response from the system.

In simple terms, latency is the time delay between:
- When a user makes a request
- When they receive the response

Lower latency means faster responses and a better user experience.

In this article, we'll explore the causes of high latency and how to reduce latency at different layers of your system.

---

## What Causes High Latency?

### Geographical Distance
The farther a user is from your server, the longer data takes to travel. Even though data moves close to the speed of light, crossing thousands of miles takes more time than traveling a few hundred.

### Overloaded Servers
When a server receives more requests than it can handle, it slows down. This overload can happen due to sudden traffic spikes, inefficient resource usage, or inadequate server capacity. As servers struggle to keep up, each request takes longer to process, and latency spikes.

### Slow Database
If your database queries take too long—due to large tables, missing indexes, or poorly written queries—responses take longer.

### Inefficient Code Paths
Sometimes latency hides in the application's code. Overly complex code, unnecessary calculations, and complicated logic can introduce small delays that add up.

### Network Congestion
Heavy network traffic, limited bandwidth, and busy intermediaries between the user and your server can slow requests. Employing techniques like load balancing across different network paths, using faster protocols (like HTTP/2 or HTTP/3), and minimizing payload sizes can help reduce the impact of congestion.

---

## How to Reduce Latency

### 1. Caching
Caching helps you serve common results fast. Instead of fetching data from a slower backend (like a database or remote server) every time, the system can quickly return results from a cache.

This reduces trips to the backend services and lowers user wait times.

#### 1.1 Client-side Caching
Client-side caching stores data on the user's device, like in their browser. This cuts down on server requests and speeds up response times.

You can cache static assets like images, JavaScript, CSS, or even API responses that rarely change.

**Browser Cache:** When you specify proper HTTP caching headers (e.g., Cache-Control, ETag, Expires), the browser stores assets locally. On subsequent requests, it can quickly load these from the local cache rather than fetching them again from the server.

**Local Storage / IndexedDB:** Modern browsers offer persistent storage options. For example, you could store user preferences, profile data or application settings in localStorage or IndexedDB so that the next time the user visits, the application can load instantly without waiting for the server.

#### 1.2 Server-side Caching
Server-side caching stores frequently requested data on the server, reducing the load on your database and speeding up responses. By doing so, you can reduce the expensive back-and-forth communication with databases or other services.

For example, you can save often-used data in Redis instead of asking the database each time.

**In-memory Caches:** In-memory caches keep data in a server's main memory (RAM) for extremely fast access. Tools like Redis or Memcached store frequently requested data in RAM. An application server can check the cache first before hitting the database. This avoids heavy database queries and speeds up responses.

**Application-level Caches:** Application level caches run directly in your application's memory, storing frequently used data—like computed values, or common database query results—right where requests are processed. Most modern frameworks and languages provide built-in support or libraries for caching at the application level (e.g., caffeine in java).

#### 1.3 Content Delivery Networks (CDNs)
A CDN is a geographically distributed network of servers that deliver static content (like images, scripts, and stylesheets) from the closest possible location to the user.

By providing these files from the server closest to each user, CDNs help pages load faster and improve the overall experience.

Benefits:
- Reduced Latency by Proximity: Users access content from a nearby server, cutting down travel time.
- Offloading Traffic: With the CDN handling most static content, your main server stays less congested.
- Automatic Failover: If one CDN server fails, others seamlessly take over, ensuring high availability.

Example: If your users are split between the U.S. and India, a CDN like Cloudflare or Akamai serves an image to a user in Mumbai from a local server, rather than from one in the U.S. This shorter distance means quicker load times.

### 2. Database Optimization
The database often represents a major bottleneck. By optimizing it, you can serve data faster and reduce latency across the system.

#### 2.1 Optimize Queries
Inefficient SQL queries can significantly impact performance.

Optimizing your queries by reducing their complexity and ensuring they perform only the necessary operations is crucial.

Best practices:
- Avoid SELECT *: Fetch only the columns you need. This reduces the amount of data retrieved and improves query efficiency.
- Limit Joins: Excessive joins can slow down query execution. Consider precomputing or restructuring data to reduce join complexity.
- Batching Queries: Instead of running many small queries, batch them into a single, well-structured query.

#### 2.2 Use Indexing
Indexes act like a book's index, allowing the database to find rows faster without scanning entire tables.

Proper use of indexing can dramatically boost query performance.

- Use Appropriate Indexes: Ensure that primary keys are always indexed. Additionally, create indexes on columns frequently used in WHERE clauses, JOIN conditions, or sorting operations to enhance query speed.
- Avoid Over-Indexing: While indexes improve read performance, excessive indexing can degrade write operations due to the overhead of maintaining them.

#### 2.3 Sharding and Partitioning
As your data grows, a single database server may struggle to handle the increasing load.

Sharding and partitioning are powerful techniques to distribute data, enhancing scalability and performance.

**Sharding:** This involves splitting data horizontally across multiple database servers (e.g., by user ID ranges). Each shard contains only a subset of the data, reducing the load on individual servers and improving query response times.

**Partitioning:** Partitioning involves dividing large database tables into smaller, more manageable segments. These partitions exist within the same database server but are logically separated. This simplifies query execution and enhances performance.

Example: If you manage a billion records, you could shard user data such that users A-M reside on one shard, and N-Z on another. This setup ensures that queries only search a fraction of the total data, significantly improving efficiency.

#### 2.4 Denormalization
While normalization reduces data duplication, it can lead to complex queries and joins. Denormalization stores duplicate data in ways that optimize read performance.

While denormalization increases storage usage, it significantly reduces the need for time-consuming joins.

This approach is particularly beneficial for read-intensive systems, such as analytics dashboards or recommendation engines, where quick data retrieval is critical.

Example: Instead of joining the user and user_profile tables for every query, you can store frequently accessed profile data (e.g., user name, email, or profile picture URL) directly in the user table. This eliminates the join operation, speeding up lookups and improving overall query performance.

### 3. Asynchronous Processing
Not every task needs to complete before responding to the user.

Asynchronous processing moves time-consuming operations out of the critical path, allowing the system to respond to users faster.

**Message Queues:** Leverage tools like RabbitMQ or Kafka to handle background tasks. For example, when a user uploads a photo, the system can instantly return a success message and offload image processing to a background worker. This ensures a quick response time without delaying the user.

**Event-Driven Architecture:** Use events to trigger background services for tasks like report generation or video encoding. These services process the events independently, preventing slow operations from impacting the user experience.

### 4. Network Optimization
Optimizing the network path reduces the time data travels between user and server. This includes balancing loads, keeping connections alive, and shrinking payload sizes.

#### 4.1 Load Balancing
Load balancers distribute incoming traffic across multiple servers to prevent any single server from becoming a bottleneck.

With balanced loads, each server responds faster, cutting overall latency.

**Load Balancing Algorithms:** Common algorithms include:
- Round Robin: Distributes requests sequentially across servers.
- Least Connections: Routes traffic to the server with the fewest active connections.
- IP Hash: Directs requests based on the client's IP address, ensuring session consistency.

**Health Checks:** Load balancers continuously monitor server health. Unhealthy servers are automatically removed from the pool, ensuring uninterrupted performance for users.

#### 4.2 Persistent Connections
Establishing a new TCP or TLS connection for every request adds significant overhead.

Persistent connections enable multiple requests to share the same connection, improving efficiency and reducing latency.

**HTTP Keep-Alive:** Allows connections to remain open for subsequent requests instead of closing them after a single use. This eliminates the round-trip time required to establish new connections, improving response times.

**HTTP/2 and HTTP/3:** These advanced protocols further optimize performance by multiplexing multiple requests over a single connection, allowing data to flow more efficiently and reducing latency.

Example: By enabling Connection: keep-alive in your server's responses, clients can reuse the same connection for multiple requests, avoiding the repeated overhead of connection setup and cutting down latency caused by repeated handshakes.

#### 4.3 Prefetching
Prefetching involves anticipating what data the user might need next and fetching it ahead of time. When the user navigates, the data is already waiting.

**Link Rel Prefetch:** Use the rel="prefetch" attribute in HTML to signal to the browser which resources should be loaded in advance. This is particularly useful for preloading scripts, styles, or images that the user is likely to need next.

**Predictive APIs:** Leverage user behavior patterns to prefetch data. For example, if users typically request a related resource (e.g., a recommendations page) after viewing a product, prefetch the necessary data silently in the background.

#### 4.4 Data Compression
Large payloads take longer to travel. Compressing data before sending it reduces transfer time and bandwidth usage.

**GZIP or Brotli:** Compress server responses using GZIP or Brotli. Modern browsers automatically decompress the data.

**Minification:** For frontend resources like JavaScript and CSS, remove unnecessary elements such as whitespace, comments, and unused code.

## Conclusion
Reducing latency isn't about one single technique; it's about combining multiple strategies for a compound effect.

Each optimization plays a critical role:
- Caching delivers faster responses by storing frequently accessed data.
- Database optimizations ensure quick and efficient data retrieval.
- Asynchronous processing minimizes perceived wait times by handling long-running tasks in the background.
- Network optimizations streamline data transfer between the server and the user.

By refining each layer—from the user's browser to your database—you can build systems that deliver consistently low-latency experiences.
