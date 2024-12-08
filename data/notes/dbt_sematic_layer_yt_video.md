# DBT Semantic Layer Announcement

## Introduction
- **Presenters**: 
  - **Nick**: Director of Product, working on the DBT Semantic Layer.
  - **Roxy**: Product Manager for the DBT Semantic Layer.
- **Theme**: *Dune*-inspired presentation with references like:
  - "The metrics must flow as the spice must flow."
- **Purpose**: 
  - Introduce the DBT Semantic Layer.
  - Explain its functionality, vision, and current integrations.
  - Highlight improvements in consistency, governance, and productivity for data analytics.

---

## Problem Statement: Challenges in Current Data Analytics
1. **Reduced Productivity**:
   - Analysts spend excessive time writing and modifying SQL queries.
   - Ad hoc workflows lead to inefficiencies and errors.
2. **Error-Prone Processes**:
   - Minor query mismatches produce conflicting numbers.
   - Results in mistrust among teams and stakeholders.
3. **Poor Governance**:
   - Inconsistent metrics impact critical decision-making.
   - Lack of unified metric definitions across applications.

### Example: Data Challenges Through *Dune* Analogy
- **Characters**:
  - **Baron Harkonnen**: A data-driven leader who asks business questions (e.g., spice production).
  - **Beast Rabban**: An analyst translating questions into SQL queries.
- **Issues Highlighted**:
  - Time-consuming workflows.
  - Errors in metrics due to typos or inconsistencies.
  - Loss of trust in numbers (e.g., dashboards showing conflicting data).

---

## What is the DBT Semantic Layer?
- **Definition**: A system to unify and standardize metric definitions across tools and applications.
- **Key Purpose**:
  - Ensure consistent metrics.
  - Simplify querying workflows.
  - Enhance governance and productivity.

### **Core Functionalities**
1. **Unified Definitions**: 
   - Centralized, reusable metric definitions.
   - Metrics dynamically computed at query time.
2. **Dynamic Joins**:
   - No need for pre-aggregations or cubes.
   - Relationships (e.g., foreign keys) defined once and used across queries.
3. **Integration with DBT Models**:
   - Builds on existing DBT transformations.
   - Seamlessly integrates into workflows.

---

## Key Features
### **1. Semantic Model**
- A new concept introduced to DBT for mapping data to language.
- **Components**:
  - **Entities**: Nouns (e.g., spice harvester).
  - **Measures**: Verbs/metrics (e.g., sandworm attacks).
  - **Dimensions**: Descriptors (e.g., location of the harvester).

### **2. Joins Without Pre-Aggregation**
- Enables joins dynamically at query time by defining relationships in semantic models.
- **Example**:
  - Two tables: `Spice` (harvested spice data) and `NobleHouse` (house details).
  - Define foreign and primary key relationships in semantic models.
  - Queries with these relationships dynamically generate joins.
- **Benefits**:
  - Saves time and resources by avoiding pre-aggregation.
  - Makes code more reusable and "dry" (Do Not Repeat Yourself).
  - Improves discoverability for users exploring data relationships.

### **3. Complex Metric Creation**
- Simplifies the definition of complex metrics like cumulative or derived metrics.
- **Example**:
  - Define "Weekly Active Sandworms" metric with just a few lines of code.
  - Reduces the burden of writing intricate SQL queries.

---

## Integrations and Ecosystem
### **APIs**:
- GraphQL API.
- JDBC API based on Apache Arrow Flight SQL.

### **Supported Data Platforms**:
- Originally launched with Snowflake.
- Now supports:
  - BigQuery
  - Redshift
  - Databricks

### **Tool Integrations**:
1. **Tableau**:
   - **Custom Connector**:
     - Authenticate using DBT Cloud credentials.
     - Drag-and-drop metrics and dimensions.
     - Dynamically queries the Semantic Layer.
   - **Demo**:
     - Displayed a dashboard with time-series data grouped by noble houses (*Dune* reference).
     - Confidently share accurate insights.
   - **Availability**: Downloadable via DBT documentation.

2. **Hex**:
   - Collaborative analytics platform.
   - Features:
     - Custom DBT Semantic Layer widgets for non-technical users.
     - SQL access for technical users.
   - Publish beautiful, interactive web apps for broader team use.

3. **Mode**:
   - JDBC integration for analysts.
   - Encourages exploration and empowers non-technical users to ask questions confidently.

4. **Google Sheets**:
   - New integration available via Google Marketplace.
   - Enables querying the Semantic Layer directly in Sheets.
   - Share spreadsheets with consistent, verified metrics.

5. **Lightdash**:
   - UI built around DBT projects.
   - Provides generated SQL visibility for analysts.

6. **Other Partners**:
   - Delly
   - Klipfolio
   - Push AI

---

## Semantic Layer Vision

### Purpose
- Bridge the gap between **data** (used by computers/analysts) and **language** (used by humans).
- Elevate data workflows to enable meaningful, business-focused outcomes.

### Strategic Goals
1. **Enable Consistent Metrics**:
   - Provide unified definitions of metrics to ensure consistency across all tools and teams.

2. **Push Up the Data Hierarchy of Needs**:
   - Move beyond foundational tasks (e.g., data collection, storage, transformation) to deliver real business value.
   - Help organizations achieve impactful data applications like exploratory analytics, operational reporting, and machine learning.

3. **Optimize Data ROI**:
   - Reduce the cost of querying and accessing data while maximizing the benefit.
   - Empower organizations to make more ROI-positive investments in data.

### Key Pillars
1. **Expressiveness**:
   - Support for all metric and data modeling techniques.
   - Flexibility to define any metric needed for business insights.

2. **Performance**:
   - Deliver data insights at the "speed of thought".
   - Low-latency, high-performance query responses.

3. **Connectivity**:
   - Integrate seamlessly with diverse tools across the data ecosystem.
   - Enable usage in tools where business users and analysts are already working.

4. **Governance and Security**:
   - Ensure compliance with data access policies.
   - Provide granular access controls to secure sensitive data.

5. **Rich Metadata Context**:
   - Surface detailed metadata for better understanding and debugging.
   - Enable annotations to metrics that propagate across tools.

6. **Developer Experience**:
   - Maintain error-free, user-friendly workflows for analytics engineers.
   - Leverage engineering best practices like version control and dry code.

### Long-Term Goal
- Create a semantic mapping that automates the translation from data to human language, unlocking **higher-value applications** and **insights** at scale.

### **Future Developments**:
1. **Caching**:
   - Faster query responses (<1 second latency).
   - Cost savings via reduced ad hoc queries.
   - Simplifies governance by storing results directly on the data platform.
2. **Exports & Saved Queries**:
   - Save and version-control reusable queries.
   - Enable dataset exports back to the data platform.
3. **Advanced Permissions**:
   - Granular access controls (e.g., limiting exposure by granularity).
   - Example: Revenue by store visible, but not revenue by user.
4. **Broader Integrations**:
   - Expand connections to additional tools.
   - Enhance APIs for easier partner integrations.
5. **Expanded Metric Types**:
   - Focus on complex metrics like conversion rates.

---

## Benefits of the DBT Semantic Layer
- **Consistency**: Unified metrics across tools.
- **Trust**: Accurate and verified data for decision-making.
- **Efficiency**: Faster, error-free querying workflows.
- **Empowerment**: Enables self-service analytics for all users.

---

## Closing Remarks
- The Semantic Layer is **generally available**.
- Encouraged attendees to try it out and share feedback.
- Presenters available for Q&A on the Semantic Layer or *Dune* references.
