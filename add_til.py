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
    try:
        with open("data/today_learnt.json", "r") as f:
            data = json.load(f)
            tags = set()
            for entry in data["entries"]:
                tags.update(entry.get("tags", []))
            return sorted(list(tags))
    except (FileNotFoundError, json.JSONDecodeError):
        return []

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
    
    console.print("\n[bold]NOTE:[/bold] Select a note from the notes directory")
    
    def path_filter(path):
        return path.endswith('.md')

    # Change to notes directory temporarily to get proper path completion
    original_dir = os.getcwd()
    notes_dir = os.path.join('data', 'notes')
    os.chdir(notes_dir)
    
    try:
        path_completer = PathCompleter(
            only_directories=False,
            file_filter=path_filter
        )
        
        while True:
            path = get_input("Select note (press Tab for suggestions)", required=False, completer=path_completer)
            if not path:
                return None
            
            # Check if file exists in notes directory
            if os.path.exists(path):
                # Return path relative to data directory with ../data prefix
                return os.path.join("..", "data", "notes", path)
            else:
                console.print(f"Warning: File '{path}' does not exist in notes directory!", style="yellow")
                if not Confirm.ask("Continue anyway?", default=False):
                    continue
                return os.path.join("..", "data", "notes", path)
    finally:
        # Always restore the original directory
        os.chdir(original_dir)

def add_til_entry():
    clear_screen()
    print_header("Add New TIL Entry")
    
    title = get_input("Title")
    content = get_input("Content")
    tags = get_tags()
    date = get_date()
    difficulty = get_difficulty()
    notes_path = get_notes_path()
    references = get_references()
    
    return {
        "date": date,
        "title": title,
        "content": content,
        "references": references,
        "difficulty": difficulty,
        "tags": tags,
        "notes_md": notes_path
    }

def main():
    try:
        entry = add_til_entry()
        
        # Load existing entries
        til_file = os.path.join("data", "today_learnt.json")
        try:
            with open(til_file, 'r') as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {"entries": []}
        
        # Add new entry
        data["entries"].append(entry)
        
        # Sort entries by date (newest first)
        data["entries"].sort(key=lambda x: x["date"], reverse=True)
        
        # Save updated entries
        with open(til_file, "w") as f:
            json.dump(data, f, indent=2)
        
        clear_screen()
        console.print("\n✨ [bold green]TIL entry added successfully![/bold green] ✨\n")
        
        # Show summary of added entry
        console.print("[bold]Entry Summary:[/bold]")
        console.print(f"Title: {entry['title']}")
        console.print(f"Tags: {', '.join(entry['tags'])}")
        console.print(f"Date: {entry['date']}")
        console.print(f"Difficulty: {entry['difficulty']}")
        
        # Ask before git operations
        if Confirm.ask("\nDo you want to commit and push these changes to git?", default=True):
            console.print("\n[bold]Running git commands...[/bold]")
            
            if entry.get('notes_md'):
                notes_path = os.path.join("data", entry['notes_md'])
                os.system(f'git add {notes_path}')
                console.print(f"Added notes file: {notes_path}", style="green")
            
            os.system('git add data/today_learnt.json')
            console.print("Added today_learnt.json", style="green")
            
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
