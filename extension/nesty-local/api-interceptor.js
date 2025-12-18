/**
 * API Interceptor for Nesty Local Extension
 * Intercepts Babylist API calls and redirects them to localhost:5173
 */

console.log('🎯 Nesty API Interceptor loaded');

// Override fetch to intercept Babylist API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  let [url, options] = args;

  // Convert URL to string if it's a Request object
  const urlString = url instanceof Request ? url.url : url;

  console.log('📡 Fetch intercepted:', urlString);

  // Intercept Babylist API calls
  if (urlString.includes('babylist.com/api')) {
    console.log('🔀 Redirecting Babylist API call to local server');

    // Extract the data being sent
    if (options && options.body) {
      try {
        const data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        console.log('📦 Data being sent:', data);

        // Send to local Nesty API instead
        const nestyUrl = 'http://localhost:5173/api/products';

        return originalFetch(nestyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            productData: data
          })
        }).then(response => {
          console.log('✅ Successfully sent to Nesty API');
          return response;
        }).catch(error => {
          console.error('❌ Failed to send to Nesty API:', error);
          // Fall back to original request
          return originalFetch(...args);
        });
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }
  }

  // For all other requests, use original fetch
  return originalFetch(...args);
};

console.log('✅ API Interceptor ready');
