# Release Notes — v1.5.2

**Release date:** 2026-04-30

## What's new

תיקון קריטי: כפתורי "הוסף לנסטי" (הצף והאינליין) לא עבדו בגרסה שהותקנה מה-Chrome Web Store — הלחיצה גרמה ללולאה אינסופית ומוצרים לא נוספו לרשימה. הבעיה: הגרסה נארזה עם תצורת סביבה שגויה (`ENV=development`) שגרמה לתוסף לחפש לשונית localhost שאינה קיימת אצל משתמשים אמיתיים. בגרסה זו זה מתוקן.

**Root cause (English):** v1.5.1 was packaged with `ENV = 'development'` in `config.js` instead of `'production'`. The extension tried to read the auth session from a `localhost:5173` tab that doesn't exist for real users, so session was always null → every button click sent users to a login loop without adding the product.

## Changes

- `config.js`: `ENV` set to `'production'` (was `'development'`)
- `manifest.json`: removed `http://localhost:5173/*` from `host_permissions` (was accidentally included in store build)
