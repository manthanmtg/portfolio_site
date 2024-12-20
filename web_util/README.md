# Web Utility for Portfolio Site

A Flask-based web utility to help manage and add entries to your Today I Learned (TIL) and Tool of the Day (TOTD) sections.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

The web interface will be available at `http://localhost:5000`

## Features

### Adding TIL Entries

The TIL form allows you to:
- Set the date for the entry
- Add a title
- Specify difficulty level
- Add tags (existing tags will be suggested)
- Add references with titles and URLs
- Write content in Markdown format
- Preview the Markdown content before submitting

The entries will be saved in:
- Markdown content: `../data/til_notes/[year]/[month]/[notes_name].md`
- Entry metadata: `../data/til_notes/[year]/[month]/entries.json`

### Adding Tool of the Day Entries

The TOTD form allows you to:
- Set the date for the entry
- Add a tool name
- Select a category (cli, web, desktop, mobile, library, other)
- Add tags (existing tags will be suggested)
- Add a short description
- Write detailed notes in Markdown format
- Preview the Markdown content before submitting

The entries will be saved in:
- Markdown content: `../data/tool_notes/[year]/[month]/[notes_name].md`
- Entry metadata: `../data/tool_notes/[year]/[month]/entries.json`

## Directory Structure

```
web_util/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── static/            # Static files (JS, CSS)
└── templates/         # HTML templates
    └── index.html     # Main form page
```

## File Formats

### TIL Entry JSON Format
```json
{
  "entries": [
    {
      "title": "Entry Title",
      "date": "YYYY-MM-DD",
      "tags": ["tag1", "tag2"],
      "difficulty": "beginner|intermediate|advanced",
      "references": [
        {
          "title": "Reference Title",
          "url": "https://example.com"
        }
      ],
      "content": "Short description",
      "notes_md": "filename.md"
    }
  ]
}
```

### TOTD Entry JSON Format
```json
{
  "entries": [
    {
      "title": "Tool Name",
      "date": "YYYY-MM-DD",
      "category": "cli|web|desktop|mobile|library|other",
      "tags": ["tag1", "tag2"],
      "content": "Short description",
      "notes_path": "filename.md"
    }
  ]
}
```

## Features

- Markdown preview support
- Tag suggestions from existing entries
- Predefined categories for tools
- Automatic file organization by year and month
- Form validation
- Mobile-responsive design
