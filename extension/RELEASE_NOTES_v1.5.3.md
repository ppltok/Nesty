# Release Notes — v1.5.3

## Bug Fixes

**Fixed: Nesty logo not showing in inline buttons and floating pill**

The logo was loaded from an external URL (`https://nestyil.com/Nesty_logo.png`)
that most e-commerce sites block via their Content Security Policy (`img-src`
directive). The image silently failed to load with no visible error.

The logo is now bundled inside the extension package and loaded via
`chrome.runtime.getURL()`, which is always allowed by the browser regardless
of the host site's CSP. The full Nesty wordmark (nest icon + "Nesty" text) is
used instead of the icon-only asset.

**Fixed: Text alignment in inline button and floating pill**

Label text in the inline button was nudged 3px upward and in the floating pill
2px upward for better visual alignment with the logo.
