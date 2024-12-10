# Spark Application Lifecycle

## Overview

The journey from job submission to completion involves multiple phases. Let's explore each phase in detail.

## Phase 1: Job Submission

-   User initiates the process by running the **spark-submit** command in terminal
-   Command creates a process that communicates with cluster manager
-   For YARN-managed clusters:
    -   Client process connects to Resource Manager (RM) daemon
    -   Upon acceptance, RM creates Spark driver process on a cluster machine

## Phase 2: Driver Process Initialization

-   Driver process begins executing user code
-   Establishes **SparkSession** - crucial for cluster setup
-   Key aspects of SparkSession:
    -   Unified entry point for Spark functionality
    -   Enables DataFrame and Dataset API programming
    -   Communicates with RM to launch executor processes
    -   Driver + executor processes = Spark cluster

## Phase 3: Executor Process Setup

-   Resource Manager (RM) takes charge:
    -   Launches Spark executor processes across cluster nodes
    -   Reports executor locations back to driver process
    -   Completes Spark cluster configuration
-   Direct communication channel established between driver and executors

## Phase 4: Job Execution

-   Driver process takes control:
    -   Assigns specific tasks to executor processes
    -   Manages data movement between processes
-   Executors maintain continuous status reporting to driver
-   Active job processing begins

## Phase 5: Completion

-   Driver process terminates upon job completion
-   Cluster manager (RM) handles cleanup:
    -   Shuts down all executor processes
    -   Available for job status queries (success/failure)

## Key Components

-   **Driver Process**: Controls application execution
-   **SparkSession**: Primary interface for Spark operations
-   **Resource Manager**: Orchestrates cluster resources
-   **Executor Processes**: Perform actual task execution
