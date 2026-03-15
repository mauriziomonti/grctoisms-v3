# ISO Structured Data Module

This directory is a stub. It will be populated in a later phase with structured data
extracted from the ISO source documents.

## Structure (when populated)

```
data/
├── iso-27001/
│   ├── controls.json     ← All 93 Annex A controls (id, title, status)
│   └── clauses.json      ← Clauses 4–10
├── iso-27002/
│   └── guidance.json     ← Implementation guidance per control
└── iso-42001/
    ├── controls.json     ← Annex A/B controls
    └── clauses.json      ← Clauses 4–10
```

## Legal note

The ISO source PDFs are licensed documents and must NOT be committed to this repo.
Only structured data authored in your own words (referencing control numbers and titles)
should be stored here. Raw ISO text is served at runtime via Cloudflare Vectorize (RAG).
