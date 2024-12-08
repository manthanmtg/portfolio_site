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

def add_single_post():
    print_header("Add Single Blog Post")
    
    post = {
        "type": "single",
        "title": get_input("Title"),
        "description": get_input("Description"),
        "date": get_date(),
        "link": get_input("Link URL"),
        "tags": get_tags()
    }
    
    return post

def add_series_post():
    print_header("Add Blog Series")
    
    series = {
        "type": "series",
        "title": get_input("Series Title"),
        "description": get_input("Series Description"),
        "series_items": []
    }
    
    while True:
        print_header("Add Series Item")
        item = {
            "title": get_input("Item Title"),
            "description": get_input("Item Description"),
            "date": get_date(),
            "link": get_input("Link URL"),
            "tags": get_tags()
        }
        series["series_items"].append(item)
        
        if get_input("\nAdd another item to the series? (y/n)", default="n").lower() != 'y':
            break
    
    return series

def main():
    clear_screen()
    print_header("Blog Post Manager")
    
    # Load existing blogs
    blogs_file = os.path.join("data", "blogs.json")
    try:
        with open(blogs_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {blogs_file} not found!")
        return
    except json.JSONDecodeError:
        print(f"Error: {blogs_file} is not valid JSON!")
        return

    # Get post type
    print("\nWhat type of post would you like to add?")
    print("1. Single Post")
    print("2. Blog Series")
    
    while True:
        choice = get_input("Enter your choice (1 or 2)")
        if choice in ['1', '2']:
            break
        print("Invalid choice. Please enter 1 or 2.")

    # Add the new post
    new_post = add_single_post() if choice == '1' else add_series_post()
    
    # Add to existing blogs
    data["blogs"].append(new_post)
    
    # Sort blogs by date (using the first item's date for series)
    def get_post_date(post):
        if post["type"] == "single":
            return post["date"]
        return post["series_items"][0]["date"] if post["series_items"] else "0000-00-00"
    
    data["blogs"].sort(key=get_post_date, reverse=True)
    
    # Save the updated file
    try:
        with open(blogs_file, 'w') as f:
            json.dump(data, f, indent=4)
        print("\nBlog post added successfully!")
        
        # Git commands
        print("\nRunning git commands...")
        os.system('git add data/blogs.json')
        os.system('git commit -m "Added new blog post"')
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
