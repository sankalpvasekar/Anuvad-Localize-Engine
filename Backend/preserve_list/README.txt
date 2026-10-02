SCHOLARSHIELD PRESERVE-LIST
===========================
Source: your uploaded master_terms.json (4071 raw entries, 4065 after cleaning)
Removed 6 junk/duplicate/numeric entries during cleaning.

STRUCTURE:
- Math.json, Physics.json, Chemistry.json, Biology.json, General_STEM.json
  -> per-domain preserve lists
- all_terms_master.json -> combined list, all domains

EACH ENTRY LOOKS LIKE:
{"term": "eigenvalue", "domain": "General_STEM", "action": "preserve"}

IMPORTANT HONEST NOTE:
Domain labels here were assigned using simple keyword matching (a rough
first pass), NOT a proper classifier. Terms that don't match any keyword
bucket landed in "General_STEM" by default. Before relying on this for
your final report, consider re-running domain classification with SBERT
against real domain centroids (as discussed earlier) for more accurate
splits. This zip is meant to get you unblocked immediately, not to be
the final authoritative version.

HOW SCHOLARSHIELD USES THIS:
Every term in these files has "action": "preserve" - meaning ScholarShield
should NOT let IndicTrans2/Sarvam translate it. It should be masked with a
placeholder BEFORE the text is sent to the translation API, and restored
(as the original English word, or a transliterated form) AFTER translation
comes back - see the masking-order explanation in the main chat response.
