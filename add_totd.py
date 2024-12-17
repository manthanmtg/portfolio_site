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
    os.system("cls" if os.name == "nt" else "clear")


def print_header(text):
    console.print(Panel(text, style="bold blue", border_style="blue"))


def load_existing_tags():
    try:
        # Scan through all months in the current year's directory
        year = datetime.now().year
        tags = set()
        base_path = os.path.join("data", "tool_notes", str(year))
        if os.path.exists(base_path):
            for month in os.listdir(base_path):
                entries_file = os.path.join(base_path, month, "entries.json")
                if os.path.exists(entries_file):
                    with open(entries_file, "r") as f:
                        data = json.load(f)
                        for entry in data["entries"]:
                            tags.update(entry.get("tags", []))
        return sorted(list(tags))
    except (FileNotFoundError, json.JSONDecodeError, Exception):
        return []


def get_input(prompt_text, required=True, default=None, completer=None):
    while True:
        try:
            if completer:
                value = prompt(
                    f"{prompt_text}: ", default=default or "", completer=completer
                ).strip()
            else:
                value = Prompt.ask(prompt_text, default=default or "").strip()

            if not value and default:
                return default
            if value or not required:
                return value
            console.print("This field is required. Please try again.", style="red")
        except KeyboardInterrupt:
            raise
        except Exception as e:
            console.print(f"Error: {str(e)}", style="red")


def get_tags():
    console.print("\n[bold]Enter tags[/bold] (comma-separated, press Enter when done)")
    existing_tags = load_existing_tags()
    tag_completer = FuzzyWordCompleter(existing_tags)
    tags_input = get_input("Tags", required=False, completer=tag_completer)
    return (
        [tag.strip() for tag in tags_input.split(",") if tag.strip()]
        if tags_input
        else []
    )


def get_date():
    while True:
        date_input = get_input(
            "Date (YYYY-MM-DD)", default=datetime.now().strftime("%Y-%m-%d")
        )
        try:
            datetime.strptime(date_input, "%Y-%m-%d")
            return date_input
        except ValueError:
            console.print("Invalid date format. Please use YYYY-MM-DD", style="red")


def get_references():
    references = []
    console.print(
        "\n[bold]Add references[/bold] (press Enter with empty title to finish)"
    )
    while True:
        title = get_input("Reference Title", required=False)
        if not title:
            break
        url = get_input("Reference URL")
        references.append({"title": title, "url": url})
    return references


def get_category():
    categories = ["cli", "web", "desktop", "mobile", "library", "other"]
    console.print("\n[bold]Select category:[/bold]")
    for i, category in enumerate(categories, 1):
        console.print(f"{i}. {category}")

    while True:
        choice = get_input(f"Choice (1-{len(categories)})")
        try:
            index = int(choice) - 1
            if 0 <= index < len(categories):
                return categories[index]
        except ValueError:
            pass
        console.print(
            f"Invalid choice. Please select 1-{len(categories)}.", style="red"
        )


def get_existing_filenames(date):
    # Get the directory for the current month
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%b").lower()

    notes_dir = os.path.join("data", "tool_notes", year, month)

    if not os.path.exists(notes_dir):
        return []

    # Get all markdown files in the directory
    filenames = [f for f in os.listdir(notes_dir) if f.endswith(".md")]
    # Remove .md extension for completion
    return [os.path.splitext(f)[0] for f in filenames]


def create_notes_file(title, date, filename):
    # Create directory structure based on date
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%b").lower()

    notes_dir = os.path.join("data", "tool_notes", year, month)
    os.makedirs(notes_dir, exist_ok=True)

    # Ensure filename ends with .md
    if not filename.endswith(".md"):
        filename += ".md"

    notes_file = os.path.join(notes_dir, filename)

    if os.path.exists(notes_file):
        if not Confirm.ask(
            f"\nFile {filename} already exists. Overwrite?", default=False
        ):
            raise ValueError("File already exists and user chose not to overwrite")

    with open(notes_file, "w") as f:
        f.write(f"# {title}\n\n")
        f.write("Description of the tool and its features goes here.\n\n")
        f.write("## Installation\n\n")
        f.write("```bash\n# Installation commands go here\n```\n\n")
        f.write("## Usage\n\n")
        f.write("```bash\n# Usage examples go here\n```\n\n")
        f.write("## Tips & Tricks\n\n")
        f.write("- Add useful tips here\n")

    return filename


def add_tool_entry():
    clear_screen()
    print_header("Add New Tool of the Day")

    # Get tool details
    title = get_input("Tool Name")
    description = get_input("Short Description")
    content = get_input("Detailed Content")
    date = get_date()
    category = get_category()
    tags = get_tags()
    references = get_references()

    # Ask for notes filename with completion
    console.print(
        "\n[bold]Enter filename for notes[/bold] (will add .md if not provided)"
    )
    existing_files = get_existing_filenames(date)
    filename_completer = FuzzyWordCompleter(existing_files)
    filename = get_input("Filename", completer=filename_completer)

    # Create notes file
    notes_path = create_notes_file(title, date, filename)

    # Create entry
    entry = {
        "date": date,
        "title": title,
        "description": description,
        "content": content,
        "category": category,
        "tags": tags,
        "references": references,
        "notes_path": notes_path,
    }

    return entry


def save_entry(entry):
    date_obj = datetime.strptime(entry["date"], "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%b").lower()

    # Create directory structure
    month_dir = os.path.join("data", "tool_notes", year, month)
    os.makedirs(month_dir, exist_ok=True)

    # Load or create entries file
    entries_file = os.path.join(month_dir, "entries.json")
    if os.path.exists(entries_file):
        with open(entries_file, "r") as f:
            data = json.load(f)
    else:
        data = {"entries": []}

    # Add new entry
    data["entries"].append(entry)

    # Sort entries by date
    data["entries"].sort(key=lambda x: x["date"], reverse=True)

    # Save updated entries
    with open(entries_file, "w") as f:
        json.dump(data, f, indent=2)


def main():
    try:
        entry = add_tool_entry()

        # Preview the entry
        clear_screen()
        print_header("Preview Entry")
        console.print(json.dumps(entry, indent=2))

        if Confirm.ask("\nSave this entry?"):
            save_entry(entry)
            console.print("\n✅ Entry saved successfully!", style="bold green")

            # Get paths for git operations
            date_obj = datetime.strptime(entry["date"], "%Y-%m-%d")
            year = date_obj.strftime("%Y")
            month = date_obj.strftime("%b").lower()
            entries_path = os.path.join(
                "data", "tool_notes", year, month, "entries.json"
            )
            notes_path = os.path.join(
                "data", "tool_notes", year, month, entry["notes_path"]
            )

            # Show summary of added entry
            console.print("\n[bold]Entry Summary:[/bold]")
            console.print(f"Title: {entry['title']}")
            console.print(f"Category: {entry['category']}")
            console.print(f"Tags: {', '.join(entry['tags'])}")
            console.print(f"Date: {entry['date']}")

            # Ask before git operations
            if Confirm.ask(
                "\nDo you want to commit and push these changes to git?", default=True
            ):
                console.print("\n[bold]Running git commands...[/bold]")

                # Add the notes file
                os.system(f'git add "{notes_path}"')
                console.print(f"Added notes file: {notes_path}", style="green")

                # Add the entries.json file
                os.system(f'git add "{entries_path}"')
                console.print(f"Added entries file: {entries_path}", style="green")

                # Commit with descriptive message
                commit_msg = f'Added Tool of the Day: {entry["title"]}'
                os.system(f'git commit -m "{commit_msg}"')
                console.print("Committed changes", style="green")

                # Push changes
                os.system("git push")
                console.print("Pushed to remote", style="green")

                console.print(
                    "\n[bold green]Git operations completed successfully![/bold green]"
                )
            else:
                console.print("\n[yellow]Skipped git operations[/yellow]")

            # Remind about editing the notes file
            console.print(f"\n[bold]Don't forget to edit the notes file:[/bold]")
            console.print(f"{notes_path}", style="blue")
        else:
            console.print("\nEntry discarded.", style="yellow")

    except Exception as e:
        console.print(f"\n❌ Error: {str(e)}", style="bold red")
        raise


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n\nOperation cancelled by user.", style="yellow")
    except Exception as e:
        console.print(f"\n❌ An error occurred: {str(e)}", style="bold red")
