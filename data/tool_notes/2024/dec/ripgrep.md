# ripgrep (rg)

ripgrep is a line-oriented search tool that recursively searches directories for a regex pattern while respecting your gitignore rules.

## Installation

```bash
# On macOS using Homebrew
brew install ripgrep

# On Ubuntu/Debian
apt-get install ripgrep
```

## Key Features

1. **Incredibly Fast**: Written in Rust, optimized for speed
2. **Smart Searching**: Respects .gitignore rules
3. **Unicode Support**: Full Unicode support by default
4. **Colored Output**: Search results are colorized by default

## Common Use Cases

1. Search for a pattern in all files:
   ```bash
   rg "pattern"
   ```

2. Search with file type filtering:
   ```bash
   rg -t py "import"  # Search only Python files
   ```

3. Case insensitive search:
   ```bash
   rg -i "pattern"
   ```

4. Show context lines:
   ```bash
   rg -C 3 "pattern"  # Show 3 lines before and after
   ```

## Pro Tips

- Use `-l` to only show filenames of matching files
- Use `-w` for whole word matching
- Use `-v` to invert the match (show non-matching lines)
- Combine with other tools like `xargs` for powerful workflows

## Why Use ripgrep?

- Faster than alternatives like grep, ag, or ack
- Better default options (gitignore, binary files)
- Regular expression support with reasonable syntax
- Available on all major platforms
