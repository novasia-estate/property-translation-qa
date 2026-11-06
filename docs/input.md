# Input contract

Schema version1, a records array of at most2000 entries, unique nonempty string IDs, and string fields ru/en of at most50000 characters each. The browser import also limits file size to5MB. Optional approval metadata includes reviewer, at and an exact JSON snapshot of id/ru/en. Export preserves all original record fields; avoid including unrelated sensitive information.

Only ru/en/id determine whether a previous review is current. Extra upstream metadata is not included in that comparison. If other facts affect your release decision, review them in your source system as well. The app rejects duplicate IDs rather than silently replacing an earlier record.
