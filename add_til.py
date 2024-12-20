#!/usr/bin/env python3
import json
import os
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from prompt_toolkit import prompt
from prompt_toolkit.completion import FuzzyWordCompleter, PathCompleter
from rich.markdown import Markdown

console = Console()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(text):
    console.print(Panel(text, style="bold blue", border_style="blue"))

def load_existing_tags():
    tags = set()
    base_dir = os.path.join("data", "til_notes")
    
    # Walk through all year/month directories
    for year in os.listdir(base_dir):
        year_dir = os.path.join(base_dir, year)
        if os.path.isdir(year_dir):
            for month in os.listdir(year_dir):
                month_dir = os.path.join(year_dir, month)
                if os.path.isdir(month_dir):
                    entries_file = os.path.join(month_dir, "entries.json")
                    if os.path.exists(entries_file):
                        try:
                            with open(entries_file, "r") as f:
                                data = json.load(f)
                                for entry in data.get("entries", []):
                                    tags.update(entry.get("tags", []))
                        except (json.JSONDecodeError, FileNotFoundError):
                            continue
    
    return sorted(list(tags))

def get_input(prompt_text, required=True, default=None, completer=None):
    while True:
        if completer:
            value = prompt(f"{prompt_text}: ", default=default or "", completer=completer).strip()
        else:
            value = Prompt.ask(prompt_text, default=default or "").strip()
        
        if not value and default:
            return default
        if value or not required:
            return value
        console.print("This field is required. Please try again.", style="red")

def get_tags():
    console.print("\n[bold]Enter tags[/bold] (comma-separated, press Enter when done)")
    existing_tags = load_existing_tags()
    tag_completer = FuzzyWordCompleter(existing_tags)
    tags_input = get_input("Tags", required=False, completer=tag_completer)
    return [tag.strip() for tag in tags_input.split(",")] if tags_input else []

def get_date():
    while True:
        date_input = get_input("Date (YYYY-MM-DD)", default=datetime.now().strftime("%Y-%m-%d"))
        try:
            datetime.strptime(date_input, "%Y-%m-%d")
            return date_input
        except ValueError:
            console.print("Invalid date format. Please use YYYY-MM-DD", style="red")

def get_references():
    references = []
    console.print("\n[bold]Add references[/bold] (press Enter with empty title to finish)")
    while True:
        title = get_input("Reference Title", required=False)
        if not title:
            break
        url = get_input("Reference URL")
        references.append({"title": title, "url": url})
    return references

def get_difficulty():
    difficulties = {
        "1": ("easy", "🟢"),
        "2": ("medium", "🟡"),
        "3": ("hard", "🔴")
    }
    
    while True:
        console.print("\n[bold]Select difficulty level:[/bold]")
        for key, (diff, emoji) in difficulties.items():
            console.print(f"{key}. {emoji} {diff.title()}")
        
        choice = get_input("Choice (1-3)")
        if choice in difficulties:
            return difficulties[choice][0]
        console.print("Invalid choice. Please select 1, 2, or 3.", style="red")

def get_notes_path():
    if not Confirm.ask("\nDo you want to add notes?", default=False):
        return None
    
    # Get current year and month for notes directory
    now = datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%b").lower()
    
    notes_dir = os.path.join("data", "til_notes", year, month)
    os.makedirs(notes_dir, exist_ok=True)
    
    console.print(f"\n[bold]NOTE:[/bold] Notes will be saved in {notes_dir}")
    
    # Create a markdown file based on the title
    title = get_input("Note filename (without .md)")
    filename = f"{title.lower().replace(' ', '_')}.md"
    
    notes_path = os.path.join(notes_dir, filename)
    
    # Get note content
    console.print("\n[bold]Enter note content[/bold] (press Ctrl+D or Ctrl+Z when done):")
    content = []
    try:
        while True:
            line = input()
            content.append(line)
    except EOFError:
        pass
    
    # Write content to file
    with open(notes_path, "w") as f:
        f.write("\n".join(content))
    
    return filename

def add_til_entry():
    clear_screen()
    print_header("Add New TIL Entry")
    
    title = get_input("Title")
    content = get_input("Content")
    tags = get_tags()
    date = get_date()
    difficulty = get_difficulty()
    notes_md = get_notes_path()
    references = get_references()
    
    return {
        "date": date,
        "title": title,
        "content": content,
        "references": references,
        "difficulty": difficulty,
        "tags": tags,
        "notes_md": notes_md
    }

def main():
    try:
        entry = add_til_entry()
        
        # Get year and month from entry date
        entry_date = datetime.strptime(entry["date"], "%Y-%m-%d")
        year = entry_date.strftime("%Y")
        month = entry_date.strftime("%b").lower()
        
        # Create directory structure
        entry_dir = os.path.join("data", "til_notes", year, month)
        os.makedirs(entry_dir, exist_ok=True)
        
        # Load or create entries.json for this month
        entries_file = os.path.join(entry_dir, "entries.json")
        try:
            with open(entries_file, 'r') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {"entries": []}
        
        # Add new entry
        data["entries"].insert(0, entry)  # Add to beginning of list
        
        # Save updated entries
        with open(entries_file, "w") as f:
            json.dump(data, f, indent=2)
        
        clear_screen()
        console.print("\n✨ [bold green]TIL entry added successfully![/bold green] ✨\n")
        
        # Show summary of added entry
        console.print("[bold]Entry Summary:[/bold]")
        console.print(f"Title: {entry['title']}")
        console.print(f"Tags: {', '.join(entry['tags'])}")
        console.print(f"Date: {entry['date']}")
        console.print(f"Difficulty: {entry['difficulty']}")
        console.print(f"Saved to: {entries_file}")
        
        # Ask before git operations
        if Confirm.ask("\nDo you want to commit and push these changes to git?", default=True):
            console.print("\n[bold]Running git commands...[/bold]")
            
            if entry.get('notes_md'):
                notes_path = os.path.join(entry_dir, entry['notes_md'])
                os.system(f'git add "{notes_path}"')
                console.print(f"Added notes file: {notes_path}", style="green")
            
            os.system(f'git add "{entries_file}"')
            console.print(f"Added {entries_file}", style="green")
            
            commit_msg = f'Added TIL: {entry["title"]}'
            os.system(f'git commit -m "{commit_msg}"')
            console.print("Committed changes", style="green")
            
            os.system('git push')
            console.print("Pushed to remote", style="green")
            
            console.print("\n[bold green]Git operations completed successfully![/bold green]")
        else:
            console.print("\n[yellow]Skipped git operations[/yellow]")
        
    except KeyboardInterrupt:
        clear_screen()
        console.print("\n[yellow]Process cancelled by user.[/yellow]")
        return

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Process cancelled by user.[/yellow]")
    except Exception as e:
        console.print(f"\n[red]An error occurred: {str(e)}[/red]")
