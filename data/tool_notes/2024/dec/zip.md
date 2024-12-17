# Linux zip Command Guide

## Basic Syntax
```bash
zip [options] zipfile files/directories
```

## Common Options
- `-r`: Recursively include files in directories
- `-q`: Quiet mode (suppress normal output)
- `-v`: Verbose mode (show detailed progress)
- `-u`: Update existing entries if newer on disk
- `-m`: Move files into zip archive (delete originals)
- `-e`: Encrypt zip file with password
- `-j`: Junk (don't record) directory names
- `-9`: Maximum compression
- `-0`: Store files only, no compression
- `-d`: Delete entries from zip file

## Common Usage Examples

### Creating Archives
```bash
# Create basic zip archive
zip archive.zip file1 file2

# Create zip with directory
zip -r archive.zip directory/

# Create encrypted zip
zip -e secure.zip confidential.txt

# Create zip with maximum compression
zip -9 compressed.zip largefile.dat
```

### Updating Archives
```bash
# Add files to existing archive
zip -u archive.zip newfile.txt

# Update newer files only
zip -u archive.zip *.txt

# Add files and remove originals
zip -m archive.zip file1 file2
```

### Viewing Archive Contents
```bash
# List contents
unzip -l archive.zip

# View detailed contents
unzip -v archive.zip
```

## Working with Directories

### Directory Structure Preservation
```bash
# Preserve full directory structure
zip -r backup.zip /path/to/directory/

# Flatten directory structure
zip -j flat.zip /path/to/directory/*
```

### Selective Archiving
```bash
# Include specific file types
zip -r archive.zip directory/ -i "*.txt" "*.doc"

# Exclude specific patterns
zip -r archive.zip directory/ -x "*.tmp" "*.log"
```

## Advanced Features

### Split Archives
```bash
# Split into 2GB chunks
zip -s 2g large.zip directory/
```

### Compression Levels
```bash
# Store only (no compression)
zip -0 store.zip rawfile.dat

# Maximum compression
zip -9 compressed.zip data.txt
```

### System Operations
```bash
# Zip files while preserving permissions
zip -rX archive.zip directory/

# Create self-extracting archive
zip -A self.exe
```

## Troubleshooting

### Common Issues
- "zip warning: name not matched" - File doesn't exist or wrong path
- "zip error: Nothing to do!" - No files match the specified pattern
- "zip error: Permission denied" - Insufficient permissions

### Best Practices
1. Always verify archive contents after creation
2. Use `-v` for detailed operation logging
3. Regularly test encrypted archives
4. Keep backups of important files before zipping with `-m`
5. Use quotes around filenames with spaces

## Environment Variables
- `ZIPOPT`: Default zip options
- `ZIP`: Path to zip program
- `ZIPINFO`: Path to zipinfo program

## Related Commands
- `unzip`: Extract zip archives
- `zipinfo`: Detailed zip archive information
- `zipcloak`: Encrypt existing zip archives
- `zipnote`: Add comments to zip archives
- `zipsplit`: Split zip archives

## Security Considerations
1. Use `-e` for sensitive data encryption
2. Avoid storing passwords in scripts
3. Check file permissions before archiving
4. Verify archive integrity after creation
5. Use strong passwords for encrypted archives