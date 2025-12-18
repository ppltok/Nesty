import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In-memory storage for scraped products
const scrapedProducts: any[] = [];

// Mock API plugin
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      // Parse URL and query params
      const url = new URL(req.url, `http://${req.headers.host}`);

      // GET /api/scrape
      if (req.method === 'GET' && url.pathname === '/api/scrape') {
        const productUrl = url.searchParams.get('url');
        if (!productUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing url parameter' }));
          return;
        }
        console.log(`[Mock API] Scraping URL: ${productUrl}`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          message: 'Mock scraping endpoint - implement real scraping logic',
          url: productUrl
        }));
        return;
      }

      // POST /api/products
      if (req.method === 'POST' && url.pathname === '/api/products') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const scrapedProduct = {
              ...data,
              scrapedAt: new Date().toISOString()
            };
            scrapedProducts.push(scrapedProduct);
            console.log(`[Mock API] Product saved:`, scrapedProduct);
            console.log(`[Mock API] Total products: ${scrapedProducts.length}`);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              success: true,
              message: 'Product saved successfully',
              product: scrapedProduct,
              totalProducts: scrapedProducts.length
            }));
          } catch (error: any) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }

      // GET /api/products
      if (req.method === 'GET' && url.pathname === '/api/products') {
        console.log(`[Mock API] Fetching all products. Total: ${scrapedProducts.length}`);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          products: scrapedProducts,
          count: scrapedProducts.length
        }));
        return;
      }

      // OPTIONS for CORS preflight
      if (req.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.statusCode = 204;
        res.end();
        return;
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment (https://ppltok.github.io/Nesty/)
  // Use '/' for local dev, '/Nesty/' for production
  base: process.env.NODE_ENV === 'production' ? '/Nesty/' : '/',
  plugins: [react(), mockApiPlugin()],
  server: {
    // Allow CORS for extension
    cors: true,
  },
  build: {
    // Include content hash in filenames for cache busting
    rollupOptions: {
      output: {
        // Use content hash for all assets
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for debugging
    sourcemap: true,
  },
})
