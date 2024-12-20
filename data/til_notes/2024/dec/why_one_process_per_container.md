## Why should a container have only one process?

Before we jump into the actual context of one process per one container, let me first answer this:

'Can you run multiple processes in a container?' oh! Yes.

But, imagine these technical scenarios:

!📌 A container running a MySQL database and a logging service together experiences high memory usage.

!📌 Your Flask application running alongside a cron job in one container leads to overlapping log files.

!📌 A Dockerized application running multiple tightly coupled processes can’t handle a clean shutdown, leaving orphaned child processes.

Running into these kinds of scenarios is not uncommon but should be avoided, for sure.

In this era, from legacy tech to modern solutions, you can containerize any application with ease.

But how you design for things like scaling, staying reliable, and running smoothly makes all the difference.

[Principles of Container-Based Application Design](https://link.mail.beehiiv.com/ls/click?upn=u001.I5dhDmlt7nI3cxy6sds7CxDBYw-2F-2FnQnS15Q4WlnJ-2FCpR3x7GMrl7U5RWmJge-2BnOFOZLtApWVUAShHwxwFCznC09jyCExAyr2kcv8ZcEj696VIdJl8-2FVASJ132gjB7Sq4sRKk3Sbg2ZPobGtWV85ajpmPNnGBifw4L5IBqqyw5JlFGQ-2BlUnenKhJbj4JIuNfpylgRQ7QDk1wHEUDWuCDmSyLKElWieZh-2B4C59n9m4TSQ8aiKD4Yn0PB8qw7ld5UdP4WgSerf2Lv1gwNb9JBemhp6vXJ21eogrlDXl1m-2BOHXm0nDgO0qi2TACCBhtxrRN1IxQC5aLDchMTU88v7U-2FwkrcUGh86waU9RAoIssYHxik-3DRsFI_cLOEennG4OfZSOHw25orTRHBnYNt1no2cuccfwcJ8-2FG0BvtngrTRgloqWS3fhgiQz6c5QrpTFvwlRVYlZecSQ57WS91xOfkitoGfpoRm4wkb4bbZfgvxHreR0-2FKdfhNtbL6KGTQVLeYykoeATbfNjoHdZcEtUmw-2BB7ySfffI-2BmsKu-2Bjtfpk5Kk2HF8NdR0fMuWNc9FJaTSU4YojgShnVLS9hIcxX1edPS2OIuKQJnUQMKfs98D8CKHCYMxw3H29DQnfLdfuKAoJsfF-2BJGwWX61nSwu6lFGDM4EbWtwX8FCjAfAndNRYFl54Gm-2BMdpEE-2BzvtWmkXM012qB3BbhAeGn5Af66rVRQei9tW7mc-2BJDqos-2BjUntVEXVueGfW04D6mbZgsR-2B9iMeKjCep3Gx-2BfQ9D1ZnPfu3Qr3OodjRJ1nltuAs3iMd3AJi-2BIvrUJmrSmd)  whitepaper is a fantastic guide that every cloud-native engineer should read to understand meaningful app design principles for modern infrastructure.

![](https://ci3.googleusercontent.com/meips/ADKq_NZ4a9JOHRrorq0cSjzgOrdsjb47DI7UXk008DIsickXelxn13duDrPE6Vl4kpcyG63C_zW2dIqZhprOsAku_yz7QuLk-3Bs7D4YPJsECeTb1XhcPrU0ndRhHJdNk6LB4Xo8CtRwnrNindIVY_K8C-PPX5uA75bRmuBMjID48S6jCFUbiupNqSzvGNU5zdFUnYXDmQokvnJ-PayzD8Ms2L99ry50vLKSKhPg0fJiuTakdi6SD8tCaMCVzNcPmOagHdv9p4UdvdarvroyNo4Kd0B_oraUJQe5=s0-d-e1-ft#https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/f897cd23-a260-437d-bab1-19dffaec9f25/1_-IbPjEbzTZXxDKkvEroAlg.png?t=1733719118)

Principles of container-based application design

The **Single Concern Principle** addresses today's context of container-based application design to run a **single process per container**.

#### **Why Stick to One Process Per Container?**

##### **1. Isolation Simplifies Debugging**

A single process container means logs, resource usage, and errors are tied to one application.

**Example**: If your web server crashes, the logs clearly indicate the issue without interference from a database or background worker.

##### **2. Scaling Becomes Granular**

You can scale individual components independently.

**Scenario**: A container running an Nginx web server can be scaled up to handle increasing HTTP traffic, without wasting resources scaling a database bundled in the same container.

##### **3. Reduced Blast Radius**

If a container running one process fails, it impacts only that specific functionality.

**Example**: If a Redis container crashes, it doesn’t bring down the web server because they're isolated.

##### **4. Better Resource Management**

Orchestrators like Kubernetes can allocate CPU and memory more accurately when containers focus on one task.

**Scenario**: A Java application with high memory usage won't starve a lightweight monitoring tool running in the same container.

On contrary,

#### **What Goes Wrong with Multiple Processes in a Container?**

-   Docker monitors the main process (`PID 1`). If other processes spawn within the container, they might become orphaned or zombie processes.
    
-   Processes sharing the same container can fight for CPU and memory, causing performance degradation.
    
-   Logs from multiple processes mix together, making it difficult to trace issues.
    

When exceptions arise, when multiple processes are unavoidable, carefully evaluate the trade-offs and proceed with caution:

**Use a Process Manager**: Tools like [supervisord](https://link.mail.beehiiv.com/ls/click?upn=u001.I5O8xwjn2EsC38CD0Ry7Lgf3J-2BWB3qhDTSCpUIVqeaEpOehoZBOJ-2FYAblpASLbHkuD3T8mgS3Wx4BR1745s3E3gtr8iy94uxnyY-2FjyZn-2FxCImzDTT5dw92aELaYc-2BVSEAmFAWD-2FcdIz8fkVRA68XimTQLLtUsBiKHaIBTefz52aohsoAMz2-2FS1Rz7FMGfO8nzYOVFhcpBV17LXfbeZBNEYZlPn6doi2DfhyGK8MZlIbWcman0SrOKOxPkcCZMhzg-2FfyXVx0fGbWZNo8axFa-2BuQ-3D-3DtCvR_cLOEennG4OfZSOHw25orTRHBnYNt1no2cuccfwcJ8-2FG0BvtngrTRgloqWS3fhgiQz6c5QrpTFvwlRVYlZecSQ57WS91xOfkitoGfpoRm4wkb4bbZfgvxHreR0-2FKdfhNtbL6KGTQVLeYykoeATbfNjoHdZcEtUmw-2BB7ySfffI-2BmsKu-2Bjtfpk5Kk2HF8NdR0fMuWNc9FJaTSU4YojgShnVLS9hIcxX1edPS2OIuKQJnUQMKfs98D8CKHCYMxw3H29DQnfLdfuKAoJsfF-2BJGwWX61nSwu6lFGDM4EbWtwX8FCiXb4JdTf50ybAJcijlfDxePRx-2BvtalUb0PuowIwd457eZiJt0Dm57iTuO4BnCYKD-2BhNxU0ByGzmGCb3BvaFR8l-2BI5xDMdC7-2FOba3NBeDvfgRnLRy8-2FnCAPvpu9-2BB0uw-2FKG0WTsCDXAMb7JrGldX-2FCW)  can manage multiple processes within the container.

**Handle Signals Properly**: Write a custom solution to handle SIGTERM and SIGKILL signals and clean up processes.

**Plan for Failures**: Implement health checks for all processes to catch individual failures early

Try to design your containers to run **one process per container** for better isolation, scalability, and resource efficiency.
