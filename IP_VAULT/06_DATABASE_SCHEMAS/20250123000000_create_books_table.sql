-- Books library table
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_number INTEGER NOT NULL CHECK (book_number BETWEEN 1 AND 7),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  word_count INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'editing', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(book_number)
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Admin users can manage books
CREATE POLICY "Admins can manage all books" ON books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      JOIN organizations o ON uo.organization_id = o.id
      WHERE uo.user_id = auth.uid() AND uo.role = 'admin'
    )
  );

-- All authenticated users can read books
CREATE POLICY "Authenticated users can read books" ON books
  FOR SELECT USING (auth.uid() IS NOT NULL);
