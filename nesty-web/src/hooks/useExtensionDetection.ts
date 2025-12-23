/**
 * Hook to detect if Nesty Chrome Extension is installed
 *
 * The extension sets data attributes on document.documentElement:
 * - data-nesty-extension-installed: 'true'
 * - data-nesty-extension-version: version number
 *
 * This hook checks for these attributes and also listens for the
 * custom event dispatched by the extension.
 */

import { useEffect, useState } from 'react';

interface ExtensionDetection {
  isInstalled: boolean;
  version: string | null;
  isLoading: boolean;
}

export function useExtensionDetection(): ExtensionDetection {
  const [isInstalled, setIsInstalled] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if extension is already installed
    const checkExtension = () => {
      const installed = document.documentElement.getAttribute(
        'data-nesty-extension-installed'
      ) === 'true';

      const ver = document.documentElement.getAttribute(
        'data-nesty-extension-version'
      );

      setIsInstalled(installed);
      setVersion(ver);
      setIsLoading(false);

      if (installed) {
        console.log('✅ Nesty Extension detected, version:', ver);
      }
    };

    // Check immediately
    checkExtension();

    // Listen for custom event (fired by extension on load)
    const handleExtensionDetected = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('📦 Extension detected via event:', customEvent.detail);
      setIsInstalled(true);
      setVersion(customEvent.detail?.version || null);
      setIsLoading(false);
    };

    window.addEventListener('nestyExtensionDetected', handleExtensionDetected);

    // Also observe DOM changes (in case extension loads after page)
    const observer = new MutationObserver(() => {
      const installed = document.documentElement.getAttribute(
        'data-nesty-extension-installed'
      ) === 'true';

      if (installed && !isInstalled) {
        console.log('📦 Extension detected via DOM mutation');
        checkExtension();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-nesty-extension-installed']
    });

    // Cleanup
    return () => {
      window.removeEventListener('nestyExtensionDetected', handleExtensionDetected);
      observer.disconnect();
    };
  }, [isInstalled]);

  return { isInstalled, version, isLoading };
}
