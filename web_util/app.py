from flask import Flask, render_template, request, jsonify
import json
import os
import markdown
from markdown.extensions import fenced_code, codehilite, tables
from datetime import datetime
from pathlib import Path
import subprocess

app = Flask(__name__)

def strip_md_extension(filename):
    if filename.lower().endswith('.md'):
        return filename[:-3]
    return filename

def load_existing_tags():
    tags = set()
    base_dir = Path("../data/til_notes")
    
    for year_dir in base_dir.glob("*"):
        if year_dir.is_dir():
            for month_dir in year_dir.glob("*"):
                if month_dir.is_dir():
                    entries_file = month_dir / "entries.json"
                    if entries_file.exists():
                        try:
                            data = json.loads(entries_file.read_text())
                            for entry in data.get("entries", []):
                                tags.update(entry.get("tags", []))
                        except (json.JSONDecodeError, FileNotFoundError):
                            continue
    return sorted(list(tags))

def load_existing_tool_tags():
    tags = set()
    base_dir = Path("../data/tool_notes")
    
    for year_dir in base_dir.glob("*"):
        if year_dir.is_dir():
            for month_dir in year_dir.glob("*"):
                if month_dir.is_dir():
                    entries_file = month_dir / "entries.json"
                    if entries_file.exists():
                        try:
                            data = json.loads(entries_file.read_text())
                            for entry in data.get("entries", []):
                                tags.update(entry.get("tags", []))
                        except (json.JSONDecodeError, FileNotFoundError):
                            continue
    return sorted(list(tags))

def git_commit_and_push(files, commit_message):
    try:
        # Add files
        subprocess.run(['git', 'add'] + files, check=True)
        
        # Commit changes
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        
        # Push changes
        subprocess.run(['git', 'push'], check=True)
        
        return True, "Changes committed and pushed successfully"
    except subprocess.CalledProcessError as e:
        return False, f"Git operation failed: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview', methods=['POST'])
def preview_markdown():
    content = request.json.get('content', '')
    html = markdown.markdown(content, extensions=['fenced_code', 'codehilite', 'tables'])
    return jsonify({'html': html})

@app.route('/submit_til', methods=['POST'])
def submit_til():
    data = request.json
    date = datetime.strptime(data['date'], '%Y-%m-%d')
    year = str(date.year)
    month = date.strftime("%b").lower()
    
    # Strip .md extension if present
    notes_name = strip_md_extension(data['notes_name'])
    
    # Create directories if they don't exist
    base_path = Path(f"../data/til_notes/{year}/{month}")
    base_path.mkdir(parents=True, exist_ok=True)
    
    # Save markdown content
    notes_file = base_path / f"{notes_name}.md"
    notes_file.write_text(data['notes'])
    
    # Update entries.json
    entries_file = base_path / "entries.json"
    entries_data = {"entries": []}
    
    if entries_file.exists():
        try:
            entries_data = json.loads(entries_file.read_text())
        except json.JSONDecodeError:
            pass
    
    entry = {
        "title": data['title'],
        "date": data['date'],
        "tags": data['tags'],
        "difficulty": data['difficulty'],
        "references": data['references'],
        "content": data['content'],
        "notes_md": f"{notes_name}.md"
    }
    
    entries_data["entries"].append(entry)
    entries_file.write_text(json.dumps(entries_data, indent=2))
    
    return jsonify({"status": "success"})

@app.route('/submit_totd', methods=['POST'])
def submit_totd():
    data = request.json
    date = datetime.strptime(data['date'], '%Y-%m-%d')
    year = str(date.year)
    month = date.strftime("%b").lower()
    
    # Strip .md extension if present
    notes_name = strip_md_extension(data['notes_name'])
    
    # Create directories if they don't exist
    base_path = Path(f"../data/tool_notes/{year}/{month}")
    base_path.mkdir(parents=True, exist_ok=True)
    
    # Save markdown content
    notes_file = base_path / f"{notes_name}.md"
    notes_file.write_text(data['notes'])  # Using notes field for markdown content
    
    # Update entries.json
    entries_file = base_path / "entries.json"
    entries_data = {"entries": []}
    
    if entries_file.exists():
        try:
            entries_data = json.loads(entries_file.read_text())
        except json.JSONDecodeError:
            pass
    
    entry = {
        "title": data['name'],
        "date": data['date'],
        "category": data['category'],
        "tags": data['tags'],
        "content": data['description'],  # Using description field for content
        "notes_path": f"{notes_name}.md"
    }
    
    entries_data["entries"].append(entry)
    entries_file.write_text(json.dumps(entries_data, indent=2))
    
    return jsonify({"status": "success"})

@app.route('/get_tags')
def get_tags():
    return jsonify(load_existing_tags())

@app.route('/get_tool_tags')
def get_tool_tags():
    return jsonify(load_existing_tool_tags())

@app.route('/get_categories')
def get_categories():
    categories = ["cli", "web", "desktop", "mobile", "library", "other"]
    return jsonify(categories)

@app.route('/git_commit', methods=['POST'])
def handle_git_commit():
    data = request.json
    entry_type = data.get('type')  # 'til' or 'totd'
    date = datetime.strptime(data['date'], '%Y-%m-%d')
    year = str(date.year)
    month = date.strftime("%b").lower()
    
    if entry_type == 'til':
        base_path = Path(f"../data/til_notes/{year}/{month}")
        commit_message = f"Add TIL: {data.get('title')}"
    else:
        base_path = Path(f"../data/tool_notes/{year}/{month}")
        commit_message = f"Add Tool: {data.get('title')}"
    
    files_to_commit = [
        str(base_path / "entries.json"),
        str(base_path / f"{data['notes_name']}.md")
    ]
    
    success, message = git_commit_and_push(files_to_commit, commit_message)
    return jsonify({"success": success, "message": message})

if __name__ == '__main__':
    app.run(debug=True)
