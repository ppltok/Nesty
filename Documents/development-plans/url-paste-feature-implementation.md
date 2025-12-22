# Implementation Plan: URL Paste Feature for Web App

## Overview
Add URL paste functionality to the web app's AddItemModal component, allowing users to extract product data from any e-commerce URL (similar to the Chrome extension's feature).

## Git Branch
Create a new branch: `feature/web-url-extraction`

---

## Architecture Decision

**Code Reusability Approach:** Port the extraction logic to TypeScript
- The extension uses vanilla JavaScript (150 lines, browser-specific)
- Web app uses TypeScript with React
- Create a new TypeScript utility file with typed interfaces
- Keep extension code unchanged (already working in production)

---

## Implementation Steps

### Step 1: Create New Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/web-url-extraction
```

### Step 2: Create Product Extraction Utility (NEW FILE)

**File:** `nesty-web/src/lib/productExtraction.ts`

**What to implement:**
1. Define TypeScript interfaces:
   ```typescript
   export interface ExtractedProductData {
     name: string
     price: string
     priceCurrency: string
     brand: string
     category: string
     imageUrls: string[]
   }

   interface ProductSchema {
     '@type': 'Product'
     name?: string
     offers?: { price?: string; priceCurrency?: string } | Array<any>
     image?: string | string[]
     brand?: string | { name: string }
     category?: string
   }

   interface ProductGroupSchema {
     '@type': 'ProductGroup'
     name?: string
     hasVariant?: ProductSchema[]
     brand?: string | { name: string }
     category?: string
   }
   ```

2. Port extraction functions from `extension/final-version/content.js` (lines 266-406):
   - `extractProductDataFromDocument(doc: Document): ExtractedProductData | null`
   - `extractFromProduct(data: ProductSchema): ExtractedProductData`
   - `extractFromProductGroup(data: ProductGroupSchema): ExtractedProductData`

3. Create main extraction function:
   ```typescript
   export async function extractProductFromUrl(
     url: string,
     accessToken: string
   ): Promise<ExtractedProductData> {
     // Call Supabase Edge Function
     const response = await fetch(
       `${SUPABASE_URL}/functions/v1/extract-product`,
       {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ url })
       }
     );

     // Parse HTML with DOMParser
     const data = await response.json();
     const parser = new DOMParser();
     const doc = parser.parseFromString(data.html, 'text/html');

     // Extract product data
     return extractProductDataFromDocument(doc);
   }
   ```

**Reference:** Lines 266-406 in `extension/final-version/content.js`

### Step 3: Update AddItemModal Component

**File:** `nesty-web/src/components/AddItemModal.tsx`

#### 3.1 Add Imports (after line 2)
```typescript
import { Link2 } from 'lucide-react'
import { extractProductFromUrl } from '../lib/productExtraction'
import { useAuth } from '../contexts/AuthContext'
```

#### 3.2 Add State Variables (after line 62)
```typescript
const { session } = useAuth()
const [activeTab, setActiveTab] = useState<'manual' | 'paste'>('manual')
const [extractionStatus, setExtractionStatus] = useState<{
  state: 'idle' | 'loading' | 'success' | 'error'
  message: string | null
}>({ state: 'idle', message: null })
const [urlInput, setUrlInput] = useState('')
const [isExtractedData, setIsExtractedData] = useState(false)
```

#### 3.3 Add URL Extraction Handler (before handleSave)
```typescript
const handleExtractUrl = async () => {
  // Validate URL format
  try {
    new URL(urlInput);
  } catch {
    setExtractionStatus({
      state: 'error',
      message: 'כתובת URL לא תקינה. ודא שהכתובת מתחילה ב-https://'
    });
    return;
  }

  // Check authentication
  if (!session?.access_token) {
    setExtractionStatus({
      state: 'error',
      message: 'נדרשת התחברות לשימוש בתכונה זו'
    });
    return;
  }

  setExtractionStatus({ state: 'loading', message: null });

  try {
    const productData = await extractProductFromUrl(urlInput, session.access_token);

    // Populate form with extracted data
    setFormData({
      ...formData,
      name: productData.name,
      price: productData.price,
      originalUrl: urlInput,
      storeName: new URL(urlInput).hostname,
      notes: productData.brand ? `מותג: ${productData.brand}` : formData.notes
    });

    setIsExtractedData(true);
    setExtractionStatus({
      state: 'success',
      message: '✓ המוצר חולץ בהצלחה'
    });

    // Auto-switch to manual tab after 1 second
    setTimeout(() => {
      setActiveTab('manual');
      setExtractionStatus({ state: 'idle', message: null });
    }, 1000);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'שגיאה בחילוץ המוצר';
    setExtractionStatus({
      state: 'error',
      message: errorMessage.includes('לא נמצא מידע')
        ? errorMessage
        : 'שגיאה בחילוץ המוצר. נסה שוב או מלא ידנית'
    });
  }
};
```

#### 3.4 Update Header (replace lines 200-220)
```typescript
<div className="flex items-center justify-between p-5 border-b border-[#e7e0ec]">
  <div className="flex items-center gap-3">
    {/* Tab Navigation */}
    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab('manual')}
        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
          activeTab === 'manual'
            ? 'bg-[#6750a4] text-white'
            : 'bg-[#f3edff] text-[#6750a4] opacity-70 hover:opacity-100'
        }`}
      >
        מילוי ידני
      </button>
      <button
        onClick={() => setActiveTab('paste')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
          activeTab === 'paste'
            ? 'bg-[#6750a4] text-white'
            : 'bg-[#f3edff] text-[#6750a4] opacity-70 hover:opacity-100'
        }`}
      >
        <Link2 className="w-4 h-4" />
        הדבקת קישור
      </button>
    </div>
  </div>
  <button
    onClick={handleClose}
    className="p-2 text-[#49454f] hover:text-[#1d192b] hover:bg-[#f3edff] rounded-xl transition-colors"
  >
    <X className="w-5 h-5" />
  </button>
</div>
```

#### 3.5 Add Paste Tab Content (insert after line 228, before the form grid)
```typescript
{/* Paste Tab Content */}
{activeTab === 'paste' && (
  <div className="py-8 px-4 flex flex-col items-center max-w-md mx-auto">
    <Link2 className="w-12 h-12 text-[#6750a4] mb-4" />
    <h3 className="text-lg font-bold text-[#1d192b] mb-2">הדבק קישור למוצר</h3>
    <p className="text-sm text-[#49454f] text-center mb-6">
      הדבק כתובת URL של מוצר מכל אתר מסחר אלקטרוני
    </p>

    <input
      type="url"
      value={urlInput}
      onChange={(e) => setUrlInput(e.target.value)}
      placeholder="https://example.com/product"
      dir="ltr"
      className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all mb-4"
    />

    <button
      onClick={handleExtractUrl}
      disabled={!urlInput.trim() || extractionStatus.state === 'loading'}
      className="w-full px-6 py-3 rounded-full bg-[#6750a4] text-white font-bold text-sm hover:bg-[#503e85] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {extractionStatus.state === 'loading' ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          מחלץ...
        </>
      ) : (
        'חלץ מוצר'
      )}
    </button>

    {extractionStatus.message && (
      <div className={`mt-4 text-center text-sm font-medium ${
        extractionStatus.state === 'error' ? 'text-[#b3261e]' : 'text-green-600'
      }`}>
        {extractionStatus.message}
      </div>
    )}
  </div>
)}
```

#### 3.6 Wrap Existing Form (wrap lines 231-405 in conditional)
```typescript
{/* Manual Tab Content */}
{activeTab === 'manual' && (
  <div className="grid grid-cols-2 gap-4">
    {/* All existing form fields stay the same */}
  </div>
)}
```

#### 3.7 Update URL Field Indicator (modify lines 333-345)
```typescript
<div className="col-span-2">
  <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
    <LinkIcon className="w-3 h-3 inline ml-1" />
    קישור למוצר
    {isExtractedData && (
      <span className="text-xs text-[#6750a4] mr-2 font-normal">
        (חולץ אוטומטית)
      </span>
    )}
  </label>
  <input
    type="text"
    value={formData.originalUrl}
    onChange={(e) => {
      setFormData({ ...formData, originalUrl: e.target.value })
      setIsExtractedData(false) // Clear indicator on manual edit
    }}
    placeholder="https://..."
    className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
  />
</div>
```

#### 3.8 Update handleClose (modify lines 170-185)
```typescript
const handleClose = () => {
  setFormData({
    name: '',
    price: '',
    category: '',
    quantity: 1,
    color: '',
    originalUrl: '',
    storeName: '',
    notes: '',
    isMostWanted: false,
    isPrivate: false,
  })
  setError(null)
  setActiveTab('manual')
  setExtractionStatus({ state: 'idle', message: null })
  setUrlInput('')
  setIsExtractedData(false)
  onClose()
}
```

### Step 4: Testing Checklist

**Local Development Setup:**
1. Start dev server: `cd nesty-web && npm run dev`
2. Ensure running on `http://localhost:5173`
3. Log in to create a session

**Test Cases:**
- [ ] Tab switching works smoothly
- [ ] Paste tab shows URL input and extract button
- [ ] Valid URL extracts product data correctly
- [ ] Invalid URL shows validation error
- [ ] Network errors show appropriate message
- [ ] Loading state shows spinner during extraction
- [ ] Success auto-switches to manual tab after 1 second
- [ ] Extracted data populates form fields
- [ ] Manual edits clear the "auto-extracted" indicator
- [ ] Modal close resets all state
- [ ] Submit works with extracted data

**Test URLs:**
- Shopify product: `https://shilav.co.il/products/...`
- Any e-commerce site with JSON-LD data
- Invalid URL: `not-a-url`
- Page without product data

---

## Critical Files Summary

### New Files
1. **`nesty-web/src/lib/productExtraction.ts`** (CREATE)
   - TypeScript port of extraction logic from extension
   - Main function: `extractProductFromUrl(url, accessToken)`

### Modified Files
1. **`nesty-web/src/components/AddItemModal.tsx`** (MODIFY)
   - Add tab interface with URL paste functionality
   - Add state management for extraction
   - Add handler for URL extraction
   - Update UI with conditional rendering

### Reference Files (NO CHANGES)
1. **`extension/final-version/content.js`** (lines 266-406)
   - Reference for extraction logic patterns
2. **`nesty-web/supabase/functions/extract-product/index.ts`**
   - Edge Function works as-is (no changes needed)

---

## Error Handling Strategy

**Error Messages (Hebrew):**
- Invalid URL: `'כתובת URL לא תקינה. ודא שהכתובת מתחילה ב-https://'`
- No session: `'נדרשת התחברות לשימוש בתכונה זו'`
- No product found: `'לא נמצא מידע על מוצר בדף זה. נסה קישור אחר או מלא ידנית'`
- Generic error: `'שגיאה בחילוץ המוצר. נסה שוב או מלא ידנית'`

---

## Success Criteria

**Functional:**
- Users can paste any product URL and extract data
- Extraction works with both Product and ProductGroup schemas
- Clear error messages guide users when extraction fails

**UX:**
- Tab switching feels instant
- Loading states provide clear feedback
- Auto-switch to manual tab after success feels natural
- Extracted data indicator shows when fields are auto-filled

**Code Quality:**
- TypeScript types ensure safety
- Consistent with existing codebase patterns
- Reusable extraction utility for future features

---

## Estimated Timeline
- **Phase 1** (Extraction Utility): 60-90 minutes
- **Phase 2** (Component Updates): 90-120 minutes
- **Phase 3** (Testing): 30-60 minutes
- **Total:** 3-4 hours
