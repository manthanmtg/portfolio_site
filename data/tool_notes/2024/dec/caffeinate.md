# Caffeinate Command Quick Reference

## Introduction

The `caffeinate` command is a built-in macOS utility that prevents your system from going to sleep. It's particularly useful for:
- Keeping your system active during long downloads
- Preventing sleep during system maintenance
- Keeping the display on during presentations
- Ensuring background processes complete without interruption

The command can prevent different types of sleep (idle, display, disk) and can be used with timing controls or in combination with other commands. This reference guide provides practical examples for all common use cases.

## Basic Usage

Keep system awake until Ctrl+C:
```bash
caffeinate
```

## Prevention Flags

Prevent idle sleep:
```bash
caffeinate -i
```

Prevent display sleep:
```bash
caffeinate -d
```

Prevent disk sleep:
```bash
caffeinate -m
```

Prevent system sleep (AC power only):
```bash
caffeinate -s
```

Reset idle timer:
```bash
caffeinate -u
```

## Multiple Prevention Flags

Prevent both idle and display sleep:
```bash
caffeinate -id
```

Prevent idle, display, and disk sleep:
```bash
caffeinate -idm
```

All preventions combined:
```bash
caffeinate -idms
```

## Timed Usage

Keep awake for specific duration:
```bash
caffeinate -t 3600          # 1 hour
caffeinate -t 7200          # 2 hours
caffeinate -t 1800 -id      # 30 minutes, prevent idle and display sleep
```

## With Other Commands

Keep system awake during command execution:
```bash
caffeinate -i npm install
caffeinate -i pip install large_package
caffeinate -i brew upgrade
caffeinate -i curl -O large_file.zip
```

## Process-Based

Wait for specific process:
```bash
caffeinate -w 1234          # Wait for process ID 1234
caffeinate -w $!            # Wait for last background process
```

Multiple processes:
```bash
caffeinate -w 1234 -w 5678  # Wait for multiple processes
```

## Background Usage

Run in background:
```bash
caffeinate -d &             # Run in background
kill %1                     # Kill the background process
```

## Common Task Examples

During downloads:
```bash
caffeinate -i wget http://example.com/large_file
```

For presentations:
```bash
caffeinate -d keynote presentation.key
```

System maintenance:
```bash
caffeinate -i softwareupdate -ia
```

Backup operations:
```bash
caffeinate -im rsync -av source/ destination/
```

Remote operations:
```bash
caffeinate -i ssh user@remote command
```

Video processing:
```bash
caffeinate -i ffmpeg -i input.mp4 output.mp4
```

## Development Tasks

Building code:
```bash
caffeinate -i make build
```

Running tests:
```bash
caffeinate -i npm run test
```

Git operations:
```bash
caffeinate -i git clone large-repo-url
```

## Tips

1. Always use the minimum necessary prevention flags
2. Consider using -t for automatic timeout
3. Combine with other commands when possible
4. Use -w for process-dependent wake prevention
5. Remember to terminate background processes when done
