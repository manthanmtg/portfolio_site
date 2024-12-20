# NSLOOKUP Command Reference Guide

## Overview

The nslookup (Name Server Lookup) command is a fundamental network administration tool used for querying Domain Name System (DNS) servers. It allows administrators and users to obtain domain name or IP address mapping information, verify DNS records, and troubleshoot DNS-related issues.

## Basic Syntax

```bash
nslookup [options] [hostname/IP] [DNS-server]
```

## Common Usage Examples

### Basic Domain Lookup
To perform a basic domain lookup:
```bash
nslookup example.com
```
This command returns both IPv4 (A record) and IPv6 (AAAA record) addresses if available.

### Reverse DNS Lookup
To find the domain name associated with an IP address:
```bash
nslookup 8.8.8.8
```

### Query Specific DNS Server
To use a specific DNS server for queries:
```bash
nslookup example.com 8.8.8.8
```
This example uses Google's DNS server (8.8.8.8) to resolve example.com.

## Record Types

You can query specific DNS record types using the -type option:

### Address Records
- IPv4 address (A record):
  ```bash
  nslookup -type=A example.com
  ```
- IPv6 address (AAAA record):
  ```bash
  nslookup -type=AAAA example.com
  ```

### Mail and Server Records
- Mail server (MX record):
  ```bash
  nslookup -type=MX example.com
  ```
- Nameserver (NS record):
  ```bash
  nslookup -type=NS example.com
  ```

### Other Common Records
- Start of authority (SOA record):
  ```bash
  nslookup -type=SOA example.com
  ```
- Text records (TXT record):
  ```bash
  nslookup -type=TXT example.com
  ```
- Pointer/reverse lookup (PTR record):
  ```bash
  nslookup -type=PTR IP_ADDRESS
  ```

## Interactive Mode

nslookup provides an interactive mode for multiple queries:

```bash
nslookup
> server 8.8.8.8        # Set DNS server
> set type=MX          # Set record type
> example.com          # Query domain
> exit                 # Exit interactive mode
```

## Common Options

The command supports various options for customized queries:

- `-debug`: Enable detailed debug output
- `-timeout=X`: Set query timeout to X seconds
- `-port=X`: Use port X for queries
- `-querytype=X`: Set query type (same as -type)
- `-recurse`: Enable/disable recursive queries
- `-retry=X`: Set number of retries for failed queries

## Output Interpretation

### Sample Output
```bash
Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:    example.com
Address: 93.184.216.34
```

### Understanding Output Components
1. Server: Indicates which DNS server was used for the query
2. Address: Shows the DNS server's IP address and port
3. Non-authoritative answer: Indicates the response came from cache, not the authoritative DNS server
4. Name: The domain name that was queried
5. Address: The resolved IP address

## Troubleshooting Guide

### Common Issues and Solutions

1. DNS Resolution Issues:
   - Verify DNS server connectivity
   - Check for firewall rules blocking UDP port 53
   - Ensure correct domain name spelling
   - Verify network connectivity

2. Error Messages and Their Meanings:
   - "Server failed": DNS server is not responding
   - "Non-existent domain": The queried domain does not exist
   - "Connection timed out": Network or DNS server issue
   - "Refused": DNS server is refusing queries

3. Best Practices:
   - Always verify critical results with multiple DNS servers
   - Use debug mode for detailed troubleshooting
   - Compare results with other DNS tools (dig, host)
   - Document unusual or unexpected results

## Cross-Platform Considerations

### Windows
- Installed by default
- Command prompt and PowerShell compatible
- Some options may vary from Unix versions

### Linux/Unix
- Usually part of bind-utils package
- May need separate installation
- More consistent with original BIND implementation

### macOS
- Installed by default
- Behaves similarly to Unix version
- Terminal compatible

## Important Notes

1. While nslookup is considered deprecated in favor of dig on Unix-like systems, it remains widely used due to:
   - Windows integration
   - Simpler syntax
   - Widespread familiarity
   - Cross-platform availability

2. Security Considerations:
   - DNS queries are typically unencrypted
   - Results can be cached
   - May reveal internal network information
   - Consider using secure DNS when available

3. Performance Tips:
   - Use specific record types when possible
   - Leverage interactive mode for multiple queries
   - Consider local DNS caching
   - Use appropriate timeout values

## Additional Resources

- RFC 1035: Domain Names - Implementation and Specification
- Local DNS server documentation
- Network administrator guides
- Platform-specific DNS documentation