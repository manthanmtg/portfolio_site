# The Architecture of Canva's Data Platform

---

## Introduction to Canva’s Data Platform
Canva is an online graphic design platform that empowers users to create professional designs, even without advanced visual design skills. It features pre-built templates for social media posts, videos, posters, and more.

Founded in 2013, Canva's rapid growth to hundreds of millions of users worldwide has presented significant engineering challenges, particularly in its data platform. Central to this platform is Snowflake, a cloud-native data warehouse.

### Key Stats:
- Over 25 petabytes of data stored
- 90+ million queries executed monthly
- Two-thirds of Canva employees use Snowflake for SQL queries, dashboards, etc.

## Introduction to Snowflake
Snowflake is a cloud-based data warehouse platform launched in 2014. Unlike traditional on-premises data warehouses like Teradata or Oracle, Snowflake is scalable and eliminates infrastructure management challenges by operating on AWS, Azure, and Google Cloud.

### Core Features:
1. **Separation of Storage and Compute**: Scale compute and storage independently.
2. **Low Management and Security**: Cloud-native design reduces maintenance. Security features like Time Travel aid in data recovery.
3. **Data Integrations**: Supports structured and semi-structured data (e.g., JSON, Parquet) and integrates with tools like Kafka, Spark, and Tableau.

### Challenges:
- **Vendor Lock-In**: Migrating away can be difficult.
- **Cost Management**: Usage costs can escalate if not monitored effectively.

## Canva’s Data Platform Architecture
Canva’s data platform follows these main steps:

### 1. Data Ingestion
- **First-party data**: Ingested via AWS S3.
- **Third-party data**: Ingested through Fivetran (e.g., Facebook ad data).

### 2. Data Transformation
- **Tool**: Canva uses dbt (Data Build Tool) for data transformation. It allows SQL or Python-based logic to clean and structure raw data for analysis.

### 3. Data Views
- **Synchronization**: Enriched datasets are synchronized with third-party systems using Census.
- **Visualization**: Tools like Looker and Mode enable data exploration and visualization.

## Canva’s Snowflake Monitoring System
To manage costs and optimize usage, Canva built a robust monitoring system for Snowflake.

### Implementation Steps:
1. **Usage Data Collection**:
   - Leveraged Snowflake’s `account_usage.query_history` view to gather query data.
   - Stored this data in a dedicated dbt project.
   - Captured additional dbt metadata during transformations and stored it in S3.

2. **Query Tagging**:
   - Developed a custom dbt query tagging macro to append JSON metadata to each query.
   - Enabled tracking and cost allocation at the per-query level.

3. **Real-Time Dashboards**:
   - Built dashboards to:
     - Monitor Snowflake usage.
     - Identify team-specific costs.
     - Highlight optimization opportunities.

---

## Tech Snippets

### The Four Kinds of Optimization
1. **Algorithmic**: Reducing time complexity.
2. **Code**: Writing efficient code.
3. **Resource**: Efficient use of infrastructure.
4. **Operational**: Streamlining workflows and processes.

### Unicode is Harder Than You Think
Challenges include handling multiple encodings, normalization issues, and rendering complexities. Unicode demands meticulous attention to detail in implementation.

### How I Automated My Job Application Process
- **Tools**: Leveraged scripting and APIs for automated resume submission and application tracking.
- **Outcome**: Reduced manual effort and streamlined job search.

### Three Bucket Framework for Engineering Metrics
1. **Health Metrics**: Measure system reliability and performance.
2. **Engagement Metrics**: Track user interaction and engagement.
3. **Business Metrics**: Align engineering efforts with business goals.
