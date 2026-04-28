---
name: cws-release
description: Package and prepare the Nesty Chrome extension for Chrome Web Store submission. Triggers when the user says "release", "ship a new version", "cws release", "chrome store release", or "/cws-release". Bumps the version, switches config to production, strips localhost from manifest, zips the package, runs verification, then restores localhost for continued dev. Reports the zip path and remaining manual steps.
---

# CWS Release

Mechanical end-to-end packaging of `extension/chrome-store/` for Chrome Web
Store upload. The full source-of-truth checklist is
`extension/CHROME_STORE_RELEASE_CHECKLIST.md`; this skill executes it.

The active extension folder is **`extension/chrome-store/`** (not the
deprecated `final-version/`). Edit there. Zip its contents.

---

## Inputs to confirm before starting

Ask the user (briefly) if not already known:
1. **Version bump:** patch / minor / major, or explicit version string
2. **What's new:** one-paragraph release notes (for `RELEASE_NOTES_vX.X.X.md`
   and the CWS "what's new" field)

If we just finished a bugfix in this conversation, propose a patch bump and
draft notes from what was changed — let the user confirm.

---

## Steps

### 1. Pre-flight checks

```bash
git status --short
```

If there are uncommitted changes outside `extension/chrome-store/`, stop and
ask the user — release shouldn't sweep up unrelated work.

Read current state:
- `extension/chrome-store/manifest.json` → current version
- `extension/chrome-store/config.js` → current `ENV`
- `extension/chrome-store/content.js` → look for `data-nesty-extension-version`

### 2. Bump version

Edit `extension/chrome-store/manifest.json`:
```
"version": "X.Y.Z"   →   "X.Y.(Z+1)"
```

Edit `extension/chrome-store/content.js`:
- Find `data-nesty-extension-version` and update to the new version

### 3. Switch config to production

Edit `extension/chrome-store/config.js`:
```
const ENV = 'development'   →   const ENV = 'production'
```

Verify by reading the file back. Line 6 must be exactly:
```
const ENV = 'production'
```

### 4. Strip localhost from manifest

Edit `extension/chrome-store/manifest.json`:
- Remove the line `"http://localhost:5173/*"` from `host_permissions`
- Remove any `http://localhost:5173/*` entries from `content_scripts.matches`
  (currently there are none — but check)

Re-read the file and grep for `localhost`. Must return zero matches:
```bash
grep -n localhost extension/chrome-store/manifest.json
```

### 5. Run the verification script

```bash
node extension/verify-chrome-store-package.js extension/chrome-store
```

If the script complains, **stop** and surface the errors. Do not zip a
failing package.

### 6. Create the zip

The zip must contain the **contents** of `chrome-store/`, not the folder
itself. Output path: `extension/nesty-extension-vX.Y.Z.zip`.

From the `extension/chrome-store/` directory:
```bash
cd extension/chrome-store && zip -r ../nesty-extension-vX.Y.Z.zip . -x "*.DS_Store" "*.md"
```

(Use the actual version. Exclude `.md` files and OS junk.)

### 7. Verify the zip

Extract to a temp dir and re-check the two critical things:
```bash
mkdir -p /tmp/nesty-zip-check && cd /tmp/nesty-zip-check && unzip -o ../../extension/nesty-extension-vX.Y.Z.zip
grep -n "ENV = " config.js               # must show 'production'
grep -n localhost manifest.json          # must return nothing
```

If either check fails, stop and report.

### 8. Write release notes

Create `extension/RELEASE_NOTES_vX.Y.Z.md` from the user's "what's new"
input. Match the style of the most recent existing `RELEASE_NOTES_*.md`.

### 9. Restore localhost for continued development

Now the package is built — put dev mode back so the user can keep working:

Edit `extension/chrome-store/manifest.json`:
- Re-add `"http://localhost:5173/*"` to the end of `host_permissions`

Edit `extension/chrome-store/config.js`:
- Set `const ENV = 'development'`

Verify `localhost` is back in manifest, `ENV` is back to development.

### 10. Report

Hand back to the user:

```
## Release packaged

**Version:** vX.Y.Z
**Zip:** extension/nesty-extension-vX.Y.Z.zip
**Release notes:** extension/RELEASE_NOTES_vX.Y.Z.md

**Verified:**
- ✅ ENV = production in zipped config.js
- ✅ No localhost in zipped manifest.json
- ✅ Version bumped in manifest.json + content.js
- ✅ verify-chrome-store-package.js passed
- ✅ Dev config restored locally (ENV=development, localhost back in manifest)

**Manual steps remaining (you must do):**
1. Test the unzipped package locally:
   - Load unpacked from a fresh extract of the zip
   - Log into nestyil.com, keep tab open
   - Test on a product page (e.g., mommyshop.co.il)
   - Confirm no console errors
2. Commit + push: the version bump, content.js update, RELEASE_NOTES file
3. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
4. Upload zip to Chrome Web Store, paste release notes into "What's new"
5. Submit for review
```

---

## Rules

- **Never skip the verification step (6 + 7).** January 4, 2026 incident
  shipped `ENV=development` to all users → 401 errors. The grep checks exist
  to make that impossible.
- **Always restore localhost + dev mode at the end.** Otherwise the user's
  next dev session breaks silently.
- **Do not commit or push.** Hand the commit step to the user — they may
  want to review the diff and write the commit message themselves.
- **Do not upload to the Chrome Web Store.** That's a manual browser step.
- **If `verify-chrome-store-package.js` fails or doesn't exist**, do not
  improvise — stop and ask the user.
- **Zip contents, not the folder.** `cd chrome-store && zip -r ../foo.zip .`
  is correct; `zip -r foo.zip chrome-store` is wrong (CWS rejects it).
