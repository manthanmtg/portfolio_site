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

def validate_entry(entry):
    """Validate a single entry"""
    required_fields = ['title', 'date', 'tags', 'difficulty', 'references', 'content', 'notes_md']
    
    # Check all required fields exist
    for field in required_fields:
        if field not in entry:
            return False, f"Missing required field: {field}"
    
    # Validate types
    if not isinstance(entry['title'], str) or not entry['title'].strip():
        return False, "Title must be a non-empty string"
    if not isinstance(entry['date'], str) or not entry['date'].strip():
        return False, "Date must be a non-empty string"
    if not isinstance(entry['tags'], list):
        return False, "Tags must be a list"
    if not isinstance(entry['difficulty'], str) or entry['difficulty'] not in ['easy', 'medium', 'hard']:
        return False, "Difficulty must be one of: easy, medium, hard"
    if not isinstance(entry['references'], list):
        return False, "References must be a list"
    if not isinstance(entry['content'], str) or not entry['content'].strip():
        return False, "Content must be a non-empty string"
    if not isinstance(entry['notes_md'], str) or not entry['notes_md'].strip():
        return False, "notes_md must be a non-empty string"
    
    # Validate references structure if any exist
    for ref in entry['references']:
        if not isinstance(ref, dict):
            return False, "Each reference must be an object"
        if 'title' not in ref or 'url' not in ref:
            return False, "Each reference must have title and url"
        if not isinstance(ref['title'], str) or not isinstance(ref['url'], str):
            return False, "Reference title and url must be strings"
    
    return True, None

def validate_entries_data(data):
    """Validate the entire entries data structure"""
    if not isinstance(data, dict):
        return False, "Root must be an object"
    if 'entries' not in data:
        return False, "Missing 'entries' key"
    if not isinstance(data['entries'], list):
        return False, "Entries must be a list"
    
    # Validate each entry
    for entry in data['entries']:
        is_valid, error = validate_entry(entry)
        if not is_valid:
            return False, f"Invalid entry: {error}"
    
    return True, None

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
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No JSON data received"}), 400
        
        required_fields = ['title', 'date', 'tags', 'difficulty', 'references', 'content', 'notes']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing required field: {field}"}), 400
        
        try:
            date = datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError as e:
            return jsonify({"status": "error", "message": f"Invalid date format: {str(e)}"}), 400
            
        year = str(date.year)
        month = date.strftime("%b").lower()
        
        # Strip .md extension if present
        notes_name = strip_md_extension(data['notes_name'])
        
        # Create directories if they don't exist
        base_path = Path(f"../data/til_notes/{year}/{month}")
        try:
            base_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            return jsonify({"status": "error", "message": f"Failed to create directory: {str(e)}"}), 500
        
        # Save markdown content
        notes_file = base_path / f"{notes_name}.md"
        try:
            with open(notes_file, 'w', encoding='utf-8') as f:
                f.write(data['notes'])
        except Exception as e:
            return jsonify({"status": "error", "message": f"Failed to write markdown file: {str(e)}"}), 500
        
        # Update entries.json
        entries_file = base_path / "entries.json"
        entries_data = {"entries": []}
        
        # Read and validate existing entries
        if entries_file.exists():
            try:
                with open(entries_file, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        try:
                            temp_data = json.loads(content)
                            # Validate existing entries
                            is_valid, error = validate_entries_data(temp_data)
                            if is_valid:
                                entries_data = temp_data
                            else:
                                print(f"Invalid entries data: {error}")
                        except json.JSONDecodeError as e:
                            print(f"Invalid JSON in {entries_file}: {str(e)}")
            except Exception as e:
                print(f"Error reading {entries_file}: {str(e)}")
        
        # Create and validate new entry
        entry = {
            "title": data['title'].strip(),
            "date": data['date'].strip(),
            "tags": data['tags'],
            "difficulty": data['difficulty'].strip(),
            "references": data['references'],
            "content": data['content'].strip(),
            "notes_md": f"{notes_name}.md"
        }
        
        # Validate new entry before adding
        is_valid, error = validate_entry(entry)
        if not is_valid:
            return jsonify({"status": "error", "message": f"Invalid entry: {error}"}), 400
        
        # Add new entry at the beginning of the list
        entries_data["entries"].insert(0, entry)
        
        # Final validation of entire structure
        is_valid, error = validate_entries_data(entries_data)
        if not is_valid:
            return jsonify({"status": "error", "message": f"Invalid entries data: {error}"}), 400
        
        # Write back the JSON with proper formatting
        try:
            # First write to a temporary file
            temp_file = entries_file.with_suffix('.tmp')
            json_str = json.dumps(entries_data, indent=2, ensure_ascii=False)
            
            with open(temp_file, 'w', encoding='utf-8') as f:
                f.write(json_str)
                f.flush()
                os.fsync(f.fileno())  # Ensure data is written to disk
            
            # Verify the temp file
            with open(temp_file, 'r', encoding='utf-8') as f:
                verify_content = f.read()
                verify_data = json.loads(verify_content)
                is_valid, error = validate_entries_data(verify_data)
                if not is_valid:
                    raise ValueError(f"Verification failed: {error}")
            
            # If verification successful, replace the original file
            temp_file.replace(entries_file)
        except Exception as e:
            if temp_file.exists():
                temp_file.unlink()
            return jsonify({"status": "error", "message": f"Failed to write entries file: {str(e)}"}), 500
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        import traceback
        error_msg = f"Unexpected error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)  # This will show in the Flask server logs
        return jsonify({"status": "error", "message": str(e)}), 500

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
