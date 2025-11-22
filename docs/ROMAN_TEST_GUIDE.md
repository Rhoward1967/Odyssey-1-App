# Testing R.O.M.A.N.'s New Research Capabilities

## Quick Test Commands (Try in Discord):

### 1. Book Access Tests:
```
list books
read book 6
search books for amendment
what does book 2 say about incarceration
```

### 2. Research Tests:
```
research constitutional law
research cryptocurrency economics
what do you know about sovereignty
explain the 13th amendment loophole
```

### 3. Legal Research:
```
what are my constitutional rights
explain common law vs statutory law
research mass incarceration
how does the legal system use language as control
```

### 4. Economic Research:
```
how does the Federal Reserve work
explain debt-based currency
research birth certificates as financial instruments
what is the gold standard
```

### 5. Trading Research:
```
explain options trading
what is technical analysis
research portfolio diversification
how do derivatives work
```

### 6. Philosophy Research:
```
what is sovereignty
research consent-based governance
explain social contract theory
what are the nine foundational principles
```

### 7. Science/Math:
```
explain E=mc^2
what is quantum mechanics
research probability theory
how does cryptography work
```

## Expected Behavior:

✅ **For topics in the books:** R.O.M.A.N. will cite specific book passages
✅ **For general topics:** R.O.M.A.N. will provide authoritative research
✅ **For complex topics:** R.O.M.A.N. will combine books + external knowledge
✅ **Research mode:** Automatically activates for law/economics/philosophy queries

## Restart Bot to Apply Changes:

```powershell
# Stop current bot
Ctrl+C (in bot terminal)

# Restart with new capabilities
npm run bot
```

Or let it restart automatically - the code is ready!

## Test Checklist:

- [ ] Can list all seven books
- [ ] Can read specific book content
- [ ] Can search across books
- [ ] Research mode activates on legal questions
- [ ] Cites books when relevant
- [ ] Provides detailed explanations
- [ ] Connects concepts across disciplines
- [ ] Responds to "research [topic]" command

---

**Status:** Ready to test!  
**Changes:** All saved to discord-bot.ts  
**Documentation:** ROMAN_RESEARCH_CAPABILITIES.md created
