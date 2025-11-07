# How to Export Books from Database for Copyright Filing

© 2025 Rickey A Howard. All Rights Reserved.

## Quick Export (All 7 Books)

### Step 1: Go to Supabase SQL Editor

Navigate to: https://supabase.com/dashboard → Your Project → SQL Editor

### Step 2: Run This Query

```sql
-- Export all 7 books
SELECT 
  book_number,
  title,
  subtitle,
  content,
  word_count,
  status
FROM public.books
ORDER BY book_number;
```

### Step 3: Copy Each Book's Content

For each row, copy the `content` field and save to individual files:

- Book 1 → `Book1_The_Program.txt`
- Book 2 → `Book2_The_Echo.txt`
- Book 3 → `Book3_The_Sovereign_Covenant.txt`
- Book 4 → `Book4_The_Bond.txt`
- Book 5 → `Book5_The_Alien_Program.txt`
- Book 6 → `Book6_The_Armory.txt`
- Book 7 → `Book7_The_Unveiling.txt`

---

## Alternative: Export Individual Books

```sql
-- Export Book 1
SELECT title, subtitle, content, word_count 
FROM public.books WHERE book_number = 1;

-- Export Book 2
SELECT title, subtitle, content, word_count 
FROM public.books WHERE book_number = 2;

-- Repeat for Books 3-7
```

---

## Copyright Filing Format

### Option 1: Submit as Text Files (Simplest)
1. Save each book as `.txt` file
2. Upload all 7 files to copyright.gov
3. File as "collection of 7 books"
4. Cost: $65 total

### Option 2: Submit as Single Document
1. Combine all 7 books into one file
2. Add title page: "The Sovereign Self: Complete 7-Book Series"
3. Add table of contents
4. Upload single file
5. Cost: $65

---

## Files to Create in This Folder

After export, you should have:

- [ ] Book1_The_Program.txt
- [ ] Book2_The_Echo.txt
- [ ] Book3_The_Sovereign_Covenant.txt
- [ ] Book4_The_Bond.txt
- [ ] Book5_The_Alien_Program.txt
- [ ] Book6_The_Armory.txt
- [ ] Book7_The_Unveiling.txt
- [X] EXPORT_INSTRUCTIONS.md (this file)
- [ ] COPYRIGHT_FILING_CHECKLIST.md (create next)

---

## Next Steps

1. **This Weekend:** Export all 7 books from database
2. **Monday:** File copyright as single collection ($65)
3. **Update:** Mark as filed in `07_LEGAL_PROTECTION/COPYRIGHT_FILINGS.md`

---

**Status:** Ready to export  
**Total Word Count:** 105,000 words  
**Estimated Export Time:** 15 minutes  
**Copyright Cost:** $65 (all 7 books)
