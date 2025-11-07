-- Insert Book 1: The Program
INSERT INTO books (book_number, title, subtitle, content, word_count, status)
VALUES (
  1,
  'The Program',
  'The Origin and Architecture of Disconnection',
  E'The Nine Foundational Principles
The Principle of Sovereign Creation: Each individual is a conscious, free-willed creator, endowed with the inherent power to shape their own reality. The Spark of Divine Creation: Every individual life is a sacred expression of a singular Divine Creation, bestowing it with inherent, inviolable worth. The Anatomy of Programming: External forces actively seek to hijack sovereign will and obscure our divine nature through the programming of fear and ideology. Decolonizing the Mind: The first act of reclaiming is the internal work of identifying and dismantling this foreign programming from one's own consciousness. The Practice of Sovereign Choice: Sovereignty is a muscle strengthened through the conscious, deliberate practice of free will in every choice. The Power of Sovereign Speech: Language must be reclaimed as a tool of creation and affirmation, rejecting any rhetoric that dehumanizes or divides. The Principles of Divine Law: True law exists to protect and uphold the sacredness of the Sovereign Self, reflecting principles of justice, proportionality, and restoration. Forging Sovereign Communities: Resilient societies are built by sovereign individuals who come together in voluntary association based on mutual respect and shared principles. The Sovereign Covenant: The basis for enlightened governance is not a social contract of surrendered rights, but a conscious, voluntary covenant between sovereigns to protect their mutual freedom.

Preface
This book, "The Sovereign Self: Reclaiming Divine Intent in Law and Governance," represents a culmination of insights into how systemic "programming" has profoundly impacted humanity, particularly people of color, and how we can collectively de-program and re-align with our inherent divine nature. It is a call to redefine freedom, not merely as the absence of external constraint, but as an active, conscious, and continuous journey of self-reclamation.

[CONTENT CONTINUES FOR FULL BOOK TEXT...]',
  15000,
  'draft'
)
ON CONFLICT (book_number) DO UPDATE
SET 
  content = EXCLUDED.content,
  updated_at = NOW();
