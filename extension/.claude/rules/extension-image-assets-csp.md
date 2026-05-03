# Rule: Extension Images Must Use chrome.runtime.getURL(), Not External URLs

## The Bug
The inline button and floating pill loaded the Nesty logo from
`https://nestyil.com/Nesty_logo.png`. Most e-commerce sites block external
image URLs via their Content Security Policy (`img-src` directive), so the
logo silently failed to load.

## What Broke
Logo was invisible in both the floating pill and the inline button on all
whitelisted sites. No console error visible to the user — the `<img>` just
rendered broken/empty.

## The Fix
Use bundled extension assets and reference them via `chrome.runtime.getURL()`:

```js
logoImg.src = chrome.runtime.getURL('icon48.png');
```

And declare the asset in `manifest.json` → `web_accessible_resources`:

```json
"web_accessible_resources": [
  {
    "resources": ["icon16.png", "icon48.png", "icon128.png", ...],
    "matches": ["<all_urls>"]
  }
]
```

`chrome-extension://` URLs are always allowed by the browser regardless of
the host site's CSP — but only when the resource is listed in
`web_accessible_resources`.

## Rule
Never load extension UI assets (logos, icons, images) from external URLs.
Always:
1. Bundle the asset in the extension folder
2. Declare it in `web_accessible_resources`
3. Reference it with `chrome.runtime.getURL('filename.png')`
