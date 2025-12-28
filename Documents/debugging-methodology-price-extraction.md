# Efficient Debugging Methodology for Price Extraction Issues

**Created:** December 28, 2025
**Problem Solved:** AliExpress bundle deals price extraction
**Time to Solution:** ~45 minutes (with methodology)

---

## The Problem

**Symptom:** Extension extracting wrong prices on AliExpress bundle deals pages
- Showed: ₪2.57, ₪3.30, ₪6.90, ₪43.32 (all wrong)
- Expected: ₪4.10 (actual product sale price)

**Root Cause:** AliExpress bundle deals page contains 100+ products, extension was scanning entire page and picking random prices instead of the clicked product's price.

---

## ❌ What DIDN'T Work (Avoid These)

### Approach 1: Iterative Guessing
- **What we tried:** Adding more DOM selectors, changing sort logic (highest→lowest→specific patterns)
- **Why it failed:** Too many prices on page, no way to distinguish which one is correct
- **Time wasted:** 30+ minutes of trial and error
- **Lesson:** Don't iterate blindly on symptoms without understanding root cause

### Approach 2: Generic Modal Detection
- **What we tried:** Looking for `[class*="modal"]`, `[class*="active"]` etc.
- **Why it failed:** AliExpress bundle deals don't use standard modal patterns
- **Time wasted:** 10 minutes
- **Lesson:** Platform-specific structures need platform-specific solutions

---

## ✅ What WORKED (Use This Methodology)

### Step 1: Add Comprehensive Debug Logging
**Action:** Instead of guessing, add logging to see EXACTLY what's happening

```javascript
// Show which window variables exist
console.log('🔍 DEBUG: Available AliExpress window variables:');
if (window.runParams) console.log('  ✓ window.runParams exists');
if (window._d_c_) console.log('  ✓ window._d_c_ exists');

// Show ALL found prices
console.log(`📊 Found ${foundPrices.length} price candidates total`);
console.log(`   All candidates:`, foundPrices.map(p => `${p.price} ${p.currency}`));
```

**Result:** Immediately revealed:
- No JavaScript variables available (bundle deals page)
- 148 price candidates found (entire page scanned)
- All prices were ILS (no USD)

**Time:** 5 minutes to add, instant insight

---

### Step 2: Analyze the Debug Output (Pattern Recognition)

**Key Insight from Logs:**
```
Line 229: 🔍 Checking price in [class*="price-"]: ₪4.10 54% off₪9.10
Line 230:    ₪ Found ILS price: ₪4.10
```

**What this revealed:**
1. The correct product price appears WITH a discount indicator ("54% off")
2. Random prices on page DON'T have discount indicators
3. Solution: Prioritize prices with discount indicators!

**Time:** 2 minutes to analyze logs

---

### Step 3: Implement Contextual Priority System

**Solution:** Give higher priority to prices with contextual clues

```javascript
// Check if this price has a discount indicator nearby (higher priority)
const hasDiscount = priceText.includes('%') ||
                   priceText.includes('off') ||
                   priceText.includes('הנחה');
const priority = hasDiscount ? 8 : 5; // Prioritize prices with discounts
```

**Priority System:**
1. USD prices = 10 (highest)
2. ILS with discount = 8 ← **₪4.10** ✓
3. ILS without discount = 5 ← ₪2.57, ₪6.90 (ignored)

**Result:** Correctly extracts ₪4.10 every time

**Time:** 5 minutes to implement and test

---

## The Efficient Methodology (Repeat This)

### Phase 1: Instrument & Observe (Don't Guess!)
1. **Add comprehensive logging** to see what's actually happening
2. **Don't make assumptions** about what data is available
3. **Log EVERYTHING:** found elements, extraction attempts, final candidates

**Template:**
```javascript
console.log('🔍 DEBUG: Available data sources:');
// Check what data is available
console.log('📦 Found X candidates:', candidates);
// Log all candidates, not just the selected one
console.log('✅ Selected:', selected, 'from', total, 'candidates');
```

### Phase 2: Analyze Patterns (Look for Signal)
1. **Review the debug output** - what patterns distinguish correct from incorrect?
2. **Look for contextual clues** - what's near the correct price?
3. **Identify the signal** - discount indicators, proximity to product title, specific containers

**Questions to ask:**
- Is the correct data available but not being used?
- What's unique about the correct extraction vs incorrect ones?
- Are there contextual clues (text, attributes, structure)?

### Phase 3: Implement Targeted Solution
1. **Use the pattern you identified** (not generic solutions)
2. **Add priority/weighting systems** instead of trying to filter perfectly
3. **Keep logging** to verify the solution works

---

## When to Use This Methodology

### Symptoms:
- ✅ Extension extracts **wrong** data (not missing data)
- ✅ **Inconsistent** results (different prices each time)
- ✅ **Multiple valid candidates** on page
- ✅ **Platform-specific** behavior (works on some sites, not others)

### Don't Use For:
- ❌ No data extracted at all (different problem - missing selectors)
- ❌ Consistent wrong result (might be correct selector, wrong parsing)
- ❌ Network/authentication issues

---

## Key Principles

### 1. Observe Before Acting
**Bad:** "Let me try changing the sort from highest to lowest"
**Good:** "Let me see what prices are being found and why"

### 2. Data > Assumptions
**Bad:** "The modal probably has class 'active'"
**Good:** "Let me log what classes the modal actually has"

### 3. Context is Signal
**Bad:** "Just grab the first price"
**Good:** "Prices with discount indicators are more likely correct"

### 4. Iterate on Understanding, Not Solutions
**Bad:** Try solution 1 → doesn't work → try solution 2 → doesn't work...
**Good:** Add logging → understand problem → implement targeted solution

---

## Reusable Code Patterns

### Pattern 1: Comprehensive Logging
```javascript
// Always log what's available
console.log('🔍 DEBUG: Available data sources:');
if (window.someVar) console.log('  ✓ window.someVar exists');

// Log ALL candidates, not just the winner
console.log(`📊 Found ${candidates.length} candidates total`);
foundPrices.forEach((p, i) => {
  console.log(`  [${i}] ${p.price} ${p.currency} - ${p.source}`);
});

// Log selection reasoning
console.log(`✅ Selected: ${best.price} because: ${best.reason}`);
```

### Pattern 2: Priority-Based Selection
```javascript
// Instead of filtering (all-or-nothing), use priorities
const candidates = [];

// Add with priorities based on confidence
candidates.push({
  value: extractedValue,
  priority: hasStrongSignal ? 10 : hasWeakSignal ? 5 : 1,
  source: 'where it came from',
  reason: 'why this priority'
});

// Sort by priority, then by other criteria
candidates.sort((a, b) => {
  if (b.priority !== a.priority) return b.priority - a.priority;
  return someOtherCriteria(b) - someOtherCriteria(a);
});
```

### Pattern 3: Contextual Clues
```javascript
// Look at surrounding text/elements for clues
const elementText = element.textContent;
const hasDiscount = elementText.includes('%') || elementText.includes('off');
const nearProductTitle = element.closest('[data-product]') !== null;
const isVisible = element.offsetParent !== null;

// Higher confidence = higher priority
const confidence =
  (hasDiscount ? 3 : 0) +
  (nearProductTitle ? 2 : 0) +
  (isVisible ? 1 : 0);
```

---

## Checklist for Future Issues

When facing extraction issues:

- [ ] **Add debug logging** - see what's actually being found
- [ ] **Review logs** - identify patterns and contextual clues
- [ ] **Identify the signal** - what distinguishes correct from incorrect?
- [ ] **Implement priority system** - use contextual clues
- [ ] **Test and verify** - check logs show correct selection
- [ ] **Document the pattern** - update this file with new learnings

---

## Time Comparison

### Without This Methodology:
- Trial and error: 30+ minutes
- Multiple failed iterations
- Frustration and uncertainty
- Final solution might still be fragile

### With This Methodology:
1. Add logging: 5 minutes
2. Analyze patterns: 2 minutes
3. Implement solution: 5 minutes
4. **Total: ~12 minutes** ✓

**Time saved:** 60-70%
**Solution quality:** Much better (data-driven, not guessed)

---

## AliExpress-Specific Learnings

### Bundle Deals Pages:
- **No** `window.runParams` or other JS variables
- **No** standard modal containers
- **100+ prices** on page from different products
- **Signal:** Discount indicators ("54% off") identify active product
- **Solution:** Priority 8 for prices with discount text

### Regular Product Pages:
- **Has** `window.runParams.data.priceModule`
- **Has** JSON-LD structured data (sometimes)
- **Fewer** prices on page
- **Signal:** JavaScript variables are most reliable

### Platform Detection:
```javascript
if (window.location.hostname.includes('aliexpress.com')) {
  // Try JS variables first
  // Fall back to DOM with priority system
  // Use discount indicators as signal
}
```

---

## Future Enhancements

Based on this experience, consider:

1. **Preemptive Logging Mode**
   - Add a "debug mode" flag that outputs comprehensive logs
   - Helps diagnose issues without code changes

2. **Confidence Scores**
   - Each extraction method returns confidence (0-10)
   - Choose highest confidence, not first match

3. **Pattern Library**
   - Document platform-specific patterns
   - Reuse successful detection strategies

4. **User Feedback Loop**
   - Let users mark incorrect extractions
   - Log what was found vs what should have been found
   - Improve patterns over time

---

## Summary

**The Old Way:**
Problem → Guess solution → Test → Wrong → Repeat

**The New Way:**
Problem → **Observe with logging** → **Identify pattern** → **Implement** → Success

**Key Insight:** In extraction problems with multiple candidates, the answer is rarely "find the right selector" - it's "identify the contextual signal that distinguishes correct from incorrect."

---

**Next time you face a similar issue, open this file first! 📖**
