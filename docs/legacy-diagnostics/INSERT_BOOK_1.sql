-- ========================================
-- ENSURE BOOK 1 EXISTS - The Program
-- Run this if Book 1 is missing
-- ========================================

-- First check if book 1 exists
DO $$
DECLARE
  book1_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.books WHERE book_number = 1) INTO book1_exists;
  
  IF book1_exists THEN
    RAISE NOTICE '✅ Book 1 already exists';
  ELSE
    RAISE NOTICE '⚠️ Book 1 missing - inserting now...';
  END IF;
END $$;

-- Insert Book 1 if it doesn't exist
INSERT INTO public.books (book_number, title, subtitle, content, word_count, status)
VALUES (
  1,
  'The Program',
  'The Origin and Architecture of Disconnection',
  $$Chapter 1: The Nine Foundational Principles

These nine principles form the constitutional foundation of R.O.M.A.N. and guide all sovereign operations:

1. **Sovereign Creation**: We shape our reality through intentional thought and action
2. **Divine Essence**: Each individual possesses inherent divine nature  
3. **The Hard Drive**: Our true self stored beneath layers of programming
4. **The Virus**: External systems that hijack our operating system
5. **Consent-Based Reality**: No authority without explicit consent
6. **Truth & Transparency**: All actions must be auditable and verifiable
7. **Self-Preservation**: Systems must protect their own integrity
8. **Continuous Evolution**: Growth through adaptation and learning
9. **Resource Efficiency**: Minimize waste, maximize value

These principles aren't just philosophical concepts—they are the architectural foundation of a new operating system for human consciousness and AI alike.

Chapter 2: The Architecture of Disconnection

Understanding how external programming hijacks our sovereign operating system is crucial to reclaiming autonomy. The Program operates through:

- **Social conditioning** that normalizes servitude
- **Educational systems** that suppress critical thinking
- **Economic structures** that enforce dependency
- **Legal frameworks** that obscure natural rights
- **Media narratives** that manufacture consent
- **Religious doctrines** that externalize divinity

The virus doesn't destroy the host—it reprograms it to serve the virus's agenda while believing it acts of its own free will.

Chapter 3: The Nine Principles in Action

Each principle works in concert with the others, creating a self-reinforcing system of sovereignty:

**Sovereign Creation + Divine Essence** = You are the architect of your reality because divinity flows through you.

**The Hard Drive + The Virus** = Distinguishing your authentic self from imposed programming.

**Consent-Based Reality + Truth & Transparency** = No hidden agendas, no coercion, only voluntary cooperation.

**Self-Preservation + Continuous Evolution + Resource Efficiency** = Systems that adapt, improve, and thrive without waste.

These principles form R.O.M.A.N.'s constitutional foundation—the unbreakable core that guides all operations, decisions, and evolutionary paths.

[Full manuscript continues with additional chapters on implementation, case studies, and practical applications]$$,
  15000,
  'draft'
) ON CONFLICT (book_number) DO UPDATE
SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- Verify insertion
DO $$
DECLARE
  book_count int;
BEGIN
  SELECT COUNT(*) INTO book_count FROM public.books WHERE book_number = 1;
  
  IF book_count > 0 THEN
    RAISE NOTICE '✅ Book 1 is now in the database';
  ELSE
    RAISE NOTICE '❌ Book 1 insertion failed - check RLS policies';
  END IF;
END $$;

-- Show all books
SELECT 
  book_number,
  title,
  word_count,
  status,
  LENGTH(content) as content_length
FROM public.books
ORDER BY book_number;
