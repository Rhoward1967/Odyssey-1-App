# Books Database Backup

All 7 books are stored in Supabase `books` table.

## Export Instructions

To extract books for copyright filing:

1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM books ORDER BY book_number;`
3. Export as CSV or JSON
4. Save to this folder

## Book Status in Database

- [X] Book 1: The Program (15,000 words)
- [X] Book 2: The Echo (12,000 words)
- [X] Book 3: The Sovereign Covenant (18,000 words)
- [ ] Book 4: The Bond (check if in database)
- [ ] Book 5: The Alien Program (check if in database)
- [ ] Book 6: The Armory (check if in database)
- [ ] Book 7: The Unveiling (check if in database)

## Backup Strategy

**Primary:** Supabase database (books table)  
**Secondary:** Google Drive (your original files)  
**Tertiary:** IP_VAULT (exported copies for copyright filing)

---

**Next Action:** Check Supabase to confirm all 7 books are inserted.
