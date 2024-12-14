# Hadoop DistCp: A Comprehensive Guide

## Table of Contents

- [Introduction](#introduction)
- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Usage and Syntax](#usage-and-syntax)
- [Command Options](#command-options)
- [Use Cases](#use-cases)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Advanced Features](#advanced-features)

## Introduction

Hadoop DistCp (Distributed Copy) is a tool designed for large-scale inter/intra-cluster copying of files. It's built on MapReduce framework to leverage distributed processing capabilities for efficient data transfer.

### Key Features

- Fault tolerance and recovery
- Bandwidth management
- Copy verification
- Preservation of file attributes
- Progress monitoring and reporting

## Architecture Overview

### Internal Working

1. **Source Listing Phase**

   - DistCp first creates a list of all files to be copied
   - Files are grouped into splits based on size and count
   - Each split becomes a map task

2. **MapReduce Job Creation**

   - Creates a MapReduce job with only map tasks (no reduce phase)
   - Number of mappers determined by total data size or user specification
   - Each mapper handles a subset of files

3. **Execution Phase**
   - Mappers read from source and write to destination in parallel
   - Progress tracking through MapReduce framework
   - Built-in retry mechanism for failed operations

## Core Components

### 1. Input Formats

- CopyListingFileStatus: Contains file metadata
- DynamicInputFormat: Handles input split creation
- UniformSizeInputFormat: Creates uniform-sized splits

### 2. Mappers

- CopyMapper: Core component handling actual file copying
- RetriableFileCopyCommand: Handles retry logic
- ChunkCopyMapper: Specialized mapper for large files

### 3. Options Parser

- OptionsParser: Processes command-line arguments
- CopyListing: Manages source file listing
- DistCpOptions: Holds configuration options

## Usage and Syntax

### Basic Syntax

```bash
hadoop distcp [OPTIONS] <source_paths...> <target_path>
```

### Common Usage Patterns

1. **Simple Copy**

```bash
hadoop distcp hdfs://namenode1/source hdfs://namenode2/destination
```

2. **Multiple Sources**

```bash
hadoop distcp /source1 /source2 /source3 hdfs://nn2:8020/dest
```

3. **Cross-Cluster Copy**

```bash
hadoop distcp webhdfs://namenode1:50070/source webhdfs://namenode2:50070/destination
```

## Command Options

### Essential Options

| Option        | Description            | Example      |
| ------------- | ---------------------- | ------------ |
| -p[rbugpcaxt] | Preserve attributes    | `-p`         |
| -update       | Update changed files   | `-update`    |
| -overwrite    | Overwrite destination  | `-overwrite` |
| -async        | Execute asynchronously | `-async`     |
| -m            | Max number of maps     | `-m 20`      |

### Advanced Options

| Option                | Description               | Example                    |
| --------------------- | ------------------------- | -------------------------- |
| -bandwidth            | Bandwidth per map in MB/s | `-bandwidth 10`            |
| -strategy             | Copy strategy             | `-strategy dynamic`        |
| -filters              | Regex patterns to exclude | `-filters ".*\.tmp" `      |
| -numListstatusThreads | Threads for file listing  | `-numListstatusThreads 20` |

## Use Cases

### 1. Disaster Recovery

- Backing up critical datasets
- Maintaining replica clusters
- Point-in-time snapshots

### 2. Data Migration

- Cluster-to-cluster migration
- Storage format conversion
- Version upgrades

### 3. Load Balancing

- Distributing data across clusters
- Rebalancing storage utilization
- Cross-datacenter replication

## Best Practices

### Performance Optimization

1. **Mapper Count**

   - Use `-m` based on cluster resources
   - Consider file sizes and counts
   - Default: 20 maps per node

2. **Bandwidth Control**

   - Use `-bandwidth` to prevent network saturation
   - Monitor network utilization
   - Consider time-of-day scheduling

3. **Memory Management**
   - Adjust mapper memory allocation
   - Monitor GC patterns
   - Use appropriate compression

### Reliability

1. **Verification**

   - Enable checksums
   - Use `-update` for incremental copies
   - Implement post-copy validation

2. **Error Handling**
   - Use `-i` for ignoring failures
   - Implement retry mechanisms
   - Monitor logs for issues

## Troubleshooting

### Common Issues

1. **Connection Failures**

   - Check network connectivity
   - Verify firewall rules
   - Ensure service accounts have proper permissions

2. **Performance Issues**

   - Monitor mapper logs
   - Check disk I/O
   - Verify network bandwidth

3. **Out of Memory Errors**
   - Adjust mapper memory
   - Reduce concurrent mappers
   - Check log for memory leaks

### Log Analysis

```bash
# View DistCp logs
yarn logs -applicationId <application_id>

# Check for errors
grep -i error distcp_job.log

# Monitor progress
yarn application -status <application_id>
```

## Advanced Features

### 1. Atomic Commits

```bash
hadoop distcp -atomic /source /target
```

### 2. Snapshot Copy

```bash
hadoop distcp -update -diff last_snapshot new_snapshot /source /target
```

### 3. Security Features

- Kerberos authentication
- SSL encryption
- Access control lists

### 4. Custom Extensions

- Implementation of custom copy strategies
- Custom input formats
- Specialized verification mechanisms

### Example Implementation Scenarios

1. **Large File Transfer**

```bash
hadoop distcp -strategy dynamic -m 50 -bandwidth 100 \
  -update -p \
  hdfs://source-cluster/path \
  hdfs://target-cluster/path
```

2. **Incremental Backup**

```bash
hadoop distcp -update -append -p \
  -filters ".*\.tmp$" \
  -log /logs/distcp \
  /source /backup
```

3. **Cross-Environment Copy**

```bash
hadoop distcp \
  -D ipc.client.fallback-to-simple-auth-allowed=true \
  -p -update -skipcrccheck \
  webhdfs://prod:50070/data \
  webhdfs://dr:50070/data
```
