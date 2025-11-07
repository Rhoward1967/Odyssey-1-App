"""
Script to prepare the books migration SQL file from text files.
Properly escapes single quotes and formats for PostgreSQL.
"""

def escape_sql_string(text):
    """Escape single quotes for SQL by doubling them."""
    return text.replace("'", "''")

def create_books_migration(books_data):
    """Generate the complete SQL migration file."""
    
    sql_parts = [
        "-- filepath: c:\\Users\\gener\\Odyssey-1-App\\supabase\\migrations\\20250123000003_insert_all_seven_books.sql\n\n"
    ]
    
    for book in books_data:
        book_num = book['book_number']
        title = escape_sql_string(book['title'])
        subtitle = escape_sql_string(book['subtitle'])
        content = escape_sql_string(book['content'])
        word_count = book['word_count']
        
        sql = f"""-- Insert Book {book_num}: {title}
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  {book_num},
  '{title}',
  '{subtitle}',
  E'{content}',
  {word_count},
  'draft'
)
ON CONFLICT (book_number) DO UPDATE
SET content = EXCLUDED.content, updated_at = NOW();

"""
        sql_parts.append(sql)
    
    return ''.join(sql_parts)

# Your seven books data
books = [
    {
        'book_number': 1,
        'title': 'The Program',
        'subtitle': 'The Origin and Architecture of Disconnection',
        'content': '''[PASTE FULL BOOK 1 TEXT HERE]''',
        'word_count': 15000
    },
    # ...repeat for books 2-7
]

if __name__ == "__main__":
    migration_sql = create_books_migration(books)
    
    with open('../supabase/migrations/20250123000003_insert_all_seven_books.sql', 'w', encoding='utf-8') as f:
        f.write(migration_sql)
    
    print("✅ Migration file created successfully!")
    print("📍 Location: supabase/migrations/20250123000003_insert_all_seven_books.sql")
