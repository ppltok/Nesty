## Nesqa v1.0.3

**Bug fix:** Logo now appears correctly in the inline button and floating
pill on all whitelisted sites.

### What was wrong
The logo was embedded as a `data:image/png;base64,...` URL. Many e-commerce
sites have a strict Content-Security-Policy `img-src` directive that blocks
`data:` URLs, causing the logo to silently fail to render.

### The fix
Switched to bundled extension assets via `chrome.runtime.getURL('icon48.png')`
and added the icon files to `web_accessible_resources` in the manifest.
`chrome-extension://` URLs bypass the host page's CSP, so the logo renders
reliably across all sites regardless of their CSP rules.
