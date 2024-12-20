# Spark Application, Anatomy and Execution

## 1. Running Spark Applications

### SparkSession and SparkContext

-   **SparkSession**: Introduced in Spark 2.0
    -   Single unified entry point for data manipulation
    -   One-to-one correspondence with Spark applications
    -   Each application has exactly one SparkSession
-   **SparkContext**
    -   Represents connection to Spark Cluster
    -   Can create:
        -   RDDs
        -   Accumulators
        -   Broadcast variables
        -   Run code on cluster

### Execution Methods

1.  **YARN Cluster Mode**
```bash
spark-submit --master yarn --deploy-mode client --class [ClassName]  [JarFile]
```

-   Driver program runs as part of yarn-client
-   Results visible on console in client mode

2.  **Local Mode**

-   Special case of standalone cluster
-   Driver and executor run in same JVM

### Spark History Server (SHS)

-   Runs on port 18080
-   Configuration: `spark.eventLog.enabled = true`
-   Features:
    -   Tracks completed Spark jobs
    -   Shows scheduler stages and tasks
    -   RDD sizes and memory usage
    -   Environmental information
    -   Executor information

## 2. Anatomy of a Spark Application

### Hierarchical Structure

1.  **Application**
    -   Contains one or more jobs
    -   Can run jobs serially or parallel
    -   Cached RDDs available between jobs
2.  **Jobs**
    -   Created by action operations
    -   Consists of stages
3.  **Stages**
    -   Equivalent to map/reduce phases
    -   Split into tasks
4.  **Tasks**
    -   Run in parallel on RDD partitions
    -   Basic unit of work

### Transformations and Actions

## Transformations

1.  **Narrow Transformations**
    -   One input partition → one output partition
    -   Examples: map, union, filter
    -   No data shuffling required
2.  **Wide Transformations**
    -   Input partitions → multiple output partitions
    -   Examples: groupByKey, distinct, join
    -   Requires data shuffling

## Actions

-   Trigger actual computation
-   Each action corresponds to one Spark job
-   Immediately evaluated

### Task Types

1.  **Shuffle Map Tasks**
    -   Similar to MapReduce map-side
    -   Writes output to disk
    -   Runs in all stages except final
2.  **Result Tasks**
    -   Runs in final stage
    -   Returns results to driver program

### Key Features

1.  **Pipelining**
    -   Multiple steps before disk write
    -   Operations without data movement combined
    -   Faster than writing intermediate results
2.  **Shuffle Persistence**
    -   Shuffle files persisted on disk
    -   Reusable across jobs
    -   Useful for fault tolerance

## 3. Execution Process

### Schedulers

1.  **DAG Scheduler**
    -   Breaks job into DAG of stages
    -   Creates tasks
    -   Considers data locality
    -   Can skip cached stages
2.  **Task Scheduler**
    -   Matches tasks with executors
    -   Task placement preferences:
        1.  Process-local tasks
        2.  Node-local tasks
        3.  Rack-local tasks
        4.  Arbitrary nonlocal tasks

### Execution Flow

1.  **Task Assignment**
    -   Scheduler backend launches tasks
    -   Status updates reported to driver
2.  **Executor Process**
    -   Verifies dependencies
    -   Caches from previous runs
    -   Deserializes task code
    -   Executes in executor JVM
3.  **Result Handling**
    -   Results serialized
    -   Sent back to executor backend
    -   Forwarded to driver

### Web Interfaces

1.  **SparkContext UI**
    -   Port 4040 by default
    -   Multiple contexts use successive ports
    -   Available during application lifetime
2.  **History Server**
    -   Permanent storage of job information
    -   Accessible after application completion