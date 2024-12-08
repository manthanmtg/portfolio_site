#!/usr/bin/env python3
import json
import os
from datetime import datetime

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(text):
    print("\n" + "=" * 50)
    print(text.center(50))
    print("=" * 50 + "\n")

def get_input(prompt, required=True, default=None):
    while True:
        value = input(prompt + (f" (default: {default})" if default else "") + ": ").strip()
        if not value and default:
            return default
        if value or not required:
            return value
        print("This field is required. Please try again.")

def get_tags():
    print("\nEnter tags (comma-separated, press Enter when done)")
    tags_input = get_input("Tags", required=False)
    return [tag.strip() for tag in tags_input.split(",")] if tags_input else []

def get_date():
    while True:
        date_input = get_input("Date (YYYY-MM-DD)", default=datetime.now().strftime("%Y-%m-%d"))
        try:
            datetime.strptime(date_input, "%Y-%m-%d")
            return date_input
        except ValueError:
            print("Invalid date format. Please use YYYY-MM-DD")

def get_references():
    references = []
    print("\nAdd references (press Enter with empty title to finish)")
    while True:
        title = get_input("Reference Title", required=False)
        if not title:
            break
        url = get_input("Reference URL")
        references.append({"title": title, "url": url})
    return references

def get_difficulty():
    while True:
        print("\nSelect difficulty level:")
        print("1. Easy")
        print("2. Medium")
        print("3. Hard")
        choice = get_input("Choice (1-3)")
        if choice == "1":
            return "easy"
        elif choice == "2":
            return "medium"
        elif choice == "3":
            return "hard"
        print("Invalid choice. Please select 1, 2, or 3.")

def get_notes_path():
    print("\nDo you want to add notes? (y/n)")
    if get_input("Choice", default="n").lower() != 'y':
        return None
    
    print("\nNOTE: Keep your notes files inside the 'data' folder")
    print("Enter the path AFTER 'data/', e.g., 'notes/my_notes.md'")
    while True:
        path = get_input("Notes path (after data/)", required=False)
        if not path:
            return None
        
        full_path = os.path.join("data", path)
        if not os.path.exists(full_path):
            print(f"Warning: File '{full_path}' does not exist!")
            if get_input("Continue anyway? (y/n)", default="n").lower() != 'y':
                continue
        return path

def add_til_entry():
    print_header("Add TIL (Today I Learned) Entry")
    
    entry = {
        "date": get_date(),
        "title": get_input("Title"),
        "content": get_input("Content"),
        "references": get_references(),
        "difficulty": get_difficulty(),
        "tags": get_tags(),
        "notes_md": get_notes_path()
    }
    
    return entry

def main():
    clear_screen()
    print_header("TIL Entry Manager")
    
    # Load existing entries
    til_file = os.path.join("data", "today_learnt.json")
    try:
        with open(til_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {til_file} not found!")
        return
    except json.JSONDecodeError:
        print(f"Error: {til_file} is not valid JSON!")
        return

    # Add the new entry
    new_entry = add_til_entry()
    
    # Add to existing entries
    data["entries"].append(new_entry)
    
    # Sort entries by date in descending order
    data["entries"].sort(key=lambda x: x["date"], reverse=True)
    
    # Save the updated file
    try:
        with open(til_file, 'w') as f:
            json.dump(data, f, indent=2)
        print("\nTIL entry added successfully!")
        
        # Git commands
        print("\nRunning git commands...")
        os.system('git add data/today_learnt.json')
        os.system('git commit -m "Added new TIL entry"')
        os.system('git push origin main')
        print("Git operations completed!")
    except Exception as e:
        print(f"\nError saving file: {e}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
