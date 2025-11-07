-- Insert Book 4: The Bond
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  4,
  'The Bond',
  'The Sovereign''s True Collateral',
  E'[BOOK 4 CONTENT - You provided this last night]',
  -- Add the actual content you gave me
  16000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Insert Book 5: The Alien Program
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  5,
  'The Alien Program',
  'Language as Weapon, Race as Tool',
  E'[BOOK 5 CONTENT - You provided this last night]',
  -- Add the actual content you gave me
  14000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Insert Book 6: The Armory
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  6,
  'The Armory',
  'Legal Defense Tools for the Sovereign',
  E'[BOOK 6 CONTENT - You provided this last night]',
  -- Add the actual content you gave me
  13000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;

-- Insert Book 7: The Unveiling
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  7,
  'The Unveiling',
  'The Mask Comes Off - Truth Revealed',
  E'[BOOK 7 CONTENT - You provided this last night]',
  -- Add the actual content you gave me
  17000,
  'draft'
) ON CONFLICT (book_number) DO NOTHING;
