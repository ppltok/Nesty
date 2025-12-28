# Nesty QA Testing Checklist

**For QA Team** | Non-Technical Testing Guide
**Last Updated:** December 28, 2025

---

## Overview

This checklist will guide you through testing the Nesty baby registry platform. Follow each section carefully and mark items as you complete them. Report any issues you find with screenshots and detailed descriptions.

**What you're testing:**
- **Web Application** - The main Nesty website where users create and manage registries
- **Chrome Extension** - The browser tool that lets users add products from any website

---

## Pre-Testing Setup

### Required Items
- [ ] Chrome browser installed
- [ ] Access to the Nesty website: https://ppltok.github.io/Nesty
- [ ] Nesty Chrome Extension installed
- [ ] Test account credentials (get from development team)
- [ ] Screenshot tool ready (Windows Snipping Tool or similar)

### Before You Start
1. Clear your browser cache and cookies
2. Open Chrome in a new window
3. Have a notepad ready to document issues
4. Set aside 2-3 hours for complete testing

---

## Section 1: Account & Authentication

### 1.1 Sign Up Process
**Goal:** Verify new users can create accounts successfully

- [ ] Go to https://ppltok.github.io/Nesty
- [ ] Click "Sign Up" or "Get Started"
- [ ] Fill in email and password
- [ ] **Expected:** Receive confirmation email
- [ ] Click confirmation link in email
- [ ] **Expected:** Successfully signed in and redirected to dashboard

**Test Variations:**
- [ ] Try signing up with an existing email
  - **Expected:** See error message "Email already registered"
- [ ] Try weak password (less than 6 characters)
  - **Expected:** See password requirements message
- [ ] Try invalid email format (missing @)
  - **Expected:** See "Invalid email" error

**Record:** Take screenshots of any errors or unexpected behavior

---

### 1.2 Sign In Process
**Goal:** Verify existing users can log in

- [ ] Go to https://ppltok.github.io/Nesty
- [ ] Click "Sign In"
- [ ] Enter valid email and password
- [ ] **Expected:** Successfully logged in and see dashboard

**Test Variations:**
- [ ] Try wrong password
  - **Expected:** See "Invalid credentials" error
- [ ] Try non-existent email
  - **Expected:** See "Invalid credentials" error
- [ ] Use "Forgot Password" link
  - **Expected:** Receive password reset email

---

### 1.3 Sign Out
**Goal:** Verify users can log out properly

- [ ] While logged in, find and click "Sign Out" button
- [ ] **Expected:** Redirected to home page
- [ ] Try accessing dashboard directly
- [ ] **Expected:** Redirected to sign-in page

---

## Section 2: Registry Creation & Management

### 2.1 Create First Registry
**Goal:** Verify new users can create their baby registry

- [ ] After signing in, look for "Create Registry" or similar button
- [ ] Fill in required information:
  - [ ] Registry title (e.g., "Sarah's Baby Registry")
  - [ ] Due date
  - [ ] Baby's name (optional)
  - [ ] Delivery address
- [ ] Click "Create" or "Save"
- [ ] **Expected:** Registry created successfully
- [ ] **Expected:** Redirected to registry dashboard

**Test Variations:**
- [ ] Leave required fields empty
  - **Expected:** See validation errors
- [ ] Use special characters in registry name
  - **Expected:** Accepts normal characters, may limit special ones
- [ ] Try creating second registry
  - **Expected:** Should be allowed or clearly indicate limit

---

### 2.2 Edit Registry Settings
**Goal:** Verify users can update registry information

- [ ] Navigate to registry settings/edit page
- [ ] Change registry title
- [ ] Update due date
- [ ] Modify delivery address
- [ ] Click "Save"
- [ ] **Expected:** Changes saved successfully
- [ ] Refresh page
- [ ] **Expected:** Changes still visible

---

### 2.3 Privacy Settings
**Goal:** Test registry visibility controls

- [ ] Find privacy/sharing settings
- [ ] Toggle between "Public" and "Private"
- [ ] **Expected:** Setting saves correctly
- [ ] Test public link (copy and open in incognito window)
  - If public: **Expected:** Registry visible without login
  - If private: **Expected:** Login required or access denied

---

## Section 3: Adding Items to Registry

### 3.1 Manual Item Addition
**Goal:** Verify users can add items manually through the website

- [ ] Find "Add Item" button on dashboard
- [ ] Fill in item details:
  - [ ] Item name
  - [ ] Price
  - [ ] Quantity needed
  - [ ] Category (select from dropdown)
  - [ ] Image URL (optional)
  - [ ] Product link (optional)
- [ ] Click "Add to Registry"
- [ ] **Expected:** Item appears in your registry list

**Test Variations:**
- [ ] Add item without price
- [ ] Add item with quantity = 0
- [ ] Add item with very long name (100+ characters)
- [ ] Use Hebrew/special characters in name
- [ ] Add item without category

---

### 3.2 Chrome Extension - Adding Items
**Goal:** Test the extension can extract and add products from websites

#### Setup:
- [ ] Open a new Chrome tab
- [ ] Keep Nesty website open in another tab (must be logged in)
- [ ] Navigate to a product page on a shopping site

**Recommended Test Sites:**
- shilav.co.il (any baby product)
- amazon.com (any product)
- Any Israeli e-commerce site

#### Testing Steps:
- [ ] On the product page, click the Nesty extension icon
- [ ] **Expected:** Extension popup opens
- [ ] **Expected:** Product details automatically filled:
  - [ ] Product name extracted correctly
  - [ ] Price shown correctly (in correct currency)
  - [ ] Product image displayed
  - [ ] Product link captured
- [ ] Select registry from dropdown (if you have multiple)
- [ ] Select category
- [ ] Adjust quantity if needed
- [ ] Click "Add to Registry" button
- [ ] **Expected:** Success message appears
- [ ] Go back to Nesty website and refresh
- [ ] **Expected:** New item visible in registry

**Test Different Product Pages:**
- [ ] Simple product (single price, one image)
- [ ] Product with variants (different sizes/colors)
- [ ] Product on sale (discounted price)
- [ ] Hebrew language product page
- [ ] English language product page

**Extension Error Cases:**
- [ ] Click extension on non-product page (e.g., Google.com)
  - **Expected:** Error or message "No product detected"
- [ ] Click extension when not logged in to Nesty
  - **Expected:** Message asking to log in
- [ ] Click extension when Nesty tab is closed
  - **Expected:** Instruction to open Nesty website

---

## Section 4: Managing Registry Items

### 4.1 View Items
**Goal:** Verify items display correctly

- [ ] Navigate to registry/dashboard
- [ ] **Expected:** All added items visible
- [ ] Check each item shows:
  - [ ] Product name
  - [ ] Price
  - [ ] Image (if added)
  - [ ] Quantity needed
  - [ ] Quantity received (if any)
  - [ ] Category

---

### 4.2 Edit Items
**Goal:** Test item modification

- [ ] Click "Edit" on an item
- [ ] Change item name
- [ ] Update price
- [ ] Modify quantity
- [ ] Click "Save"
- [ ] **Expected:** Changes saved and visible immediately

---

### 4.3 Delete Items
**Goal:** Verify item removal works

- [ ] Click "Delete" or trash icon on an item
- [ ] **Expected:** Confirmation dialog appears
- [ ] Click "Cancel"
- [ ] **Expected:** Item NOT deleted
- [ ] Click "Delete" again
- [ ] Click "Confirm"
- [ ] **Expected:** Item removed from list

---

### 4.4 Mark Items as Purchased
**Goal:** Test purchase tracking

- [ ] Find "Mark as Purchased" or similar option
- [ ] Mark item as fully purchased
- [ ] **Expected:** Item shows as fulfilled or received
- [ ] Mark item as partially purchased (if quantity > 1)
- [ ] **Expected:** Shows X of Y received

---

### 4.5 Priority/Most Wanted Items
**Goal:** Test item prioritization

- [ ] Mark an item as "Most Wanted" or high priority
- [ ] **Expected:** Visual indicator (star, highlight, etc.)
- [ ] **Expected:** Item appears at top of list or in special section
- [ ] Unmark the item
- [ ] **Expected:** Returns to normal display

---

## Section 5: Sharing & Public View

### 5.1 Share Registry
**Goal:** Test sharing functionality

- [ ] Find "Share" button on registry
- [ ] **Expected:** Share options appear (link, email, social media)
- [ ] Copy share link
- [ ] Open link in incognito/private window
- [ ] **Expected:** Registry visible without login
- [ ] **Expected:** All public items displayed correctly

---

### 5.2 Public View Features
**Goal:** Verify what visitors can see and do

In the incognito window (as a visitor):
- [ ] **Expected:** Can view all items
- [ ] **Expected:** Can see prices and images
- [ ] **Expected:** Cannot edit or delete items
- [ ] Find "Purchase" or "Reserve" button
- [ ] Click to reserve/purchase an item
- [ ] **Expected:** Confirmation or gift tracking modal appears
- [ ] Fill in your name and email
- [ ] Submit
- [ ] **Expected:** Success message

Back in logged-in view:
- [ ] Refresh registry
- [ ] **Expected:** Item shows as purchased/reserved
- [ ] **Expected:** Can see purchaser info (if enabled)

---

## Section 6: Notifications & Emails

### 6.1 Email Notifications
**Goal:** Verify email communications work

- [ ] Check for welcome email after signup
- [ ] Add item via extension
- [ ] Check for confirmation email (if enabled)
- [ ] Have someone purchase an item
- [ ] Check for purchase notification email
- [ ] Request password reset
- [ ] Check for password reset email

**For Each Email:**
- [ ] Arrives within 5 minutes
- [ ] From address is correct
- [ ] Subject line clear and relevant
- [ ] Content readable and formatted properly
- [ ] Links work when clicked
- [ ] Mobile-friendly (check on phone)

---

## Section 7: Mobile Testing

### 7.1 Mobile Web (Smartphone)
**Goal:** Test website on mobile devices

Using your phone:
- [ ] Open https://ppltok.github.io/Nesty
- [ ] Sign in
- [ ] **Expected:** Layout adjusts to screen size
- [ ] **Expected:** All buttons tappable
- [ ] Add item manually
- [ ] Edit registry settings
- [ ] View public registry link
- [ ] Test all main features from mobile

**Check For:**
- [ ] Text readable (not too small)
- [ ] Images scale properly
- [ ] No horizontal scrolling required
- [ ] Buttons large enough to tap easily
- [ ] Forms work with mobile keyboard

---

### 7.2 Tablet Testing
**Goal:** Verify tablet experience

If available, test on iPad or Android tablet:
- [ ] Landscape mode works
- [ ] Portrait mode works
- [ ] Layout appropriate for medium screens

---

## Section 8: Performance & Usability

### 8.1 Page Load Times
**Goal:** Ensure pages load quickly

- [ ] Homepage loads in under 3 seconds
- [ ] Dashboard loads in under 3 seconds
- [ ] Registry page loads in under 3 seconds
- [ ] Extension popup opens instantly

**Record:** Note any pages that feel slow

---

### 8.2 General Usability
**Goal:** Check for user experience issues

- [ ] Navigation clear and intuitive
- [ ] Buttons clearly labeled
- [ ] Error messages helpful and clear
- [ ] Success messages visible
- [ ] No broken images
- [ ] No missing text/translations
- [ ] Colors/contrast easy to read
- [ ] Hebrew text displays correctly (if applicable)
- [ ] English text displays correctly

---

## Section 9: Edge Cases & Stress Testing

### 9.1 Long Content
**Goal:** Test with unusual data

- [ ] Add item with 200+ character name
- [ ] Add item with very high price (₪99,999)
- [ ] Add item with quantity of 100+
- [ ] Add 50+ items to registry

**Expected:** Application handles gracefully, no crashes

---

### 9.2 Special Characters & Languages
**Goal:** Test internationalization

- [ ] Add item with emoji in name 🍼👶
- [ ] Add item with Hebrew text
- [ ] Add item with English text
- [ ] Mix Hebrew and English in same item
- [ ] Test with numbers and symbols

---

### 9.3 Network Issues
**Goal:** Test offline/slow connection handling

- [ ] Disconnect internet while using site
- [ ] **Expected:** Appropriate error message
- [ ] Reconnect internet
- [ ] **Expected:** Application recovers
- [ ] Use slow 3G connection (Chrome DevTools can simulate)
- [ ] **Expected:** Loading indicators appear

---

## Section 10: Browser Compatibility

### 10.1 Chrome (Primary)
**Goal:** Full testing in Chrome

- [ ] Complete all sections above in latest Chrome
- [ ] Test extension in Chrome

---

### 10.2 Other Browsers (Web Only)
**Goal:** Verify web app works across browsers

**Note:** Extension is Chrome-only, but test website in:

- [ ] **Firefox:** Sign in, add item manually, view registry
- [ ] **Safari:** Sign in, add item manually, view registry
- [ ] **Edge:** Sign in, add item manually, view registry

**For Each Browser:**
- [ ] Layout looks correct
- [ ] All features functional
- [ ] No console errors (right-click > Inspect > Console)

---

## Issue Reporting Template

When you find a bug or issue, report it with these details:

```
**Issue Title:** Short description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
Attach images showing the issue

**Environment:**
- Browser: Chrome 120.0
- Device: Windows 11 / iPhone 14 / etc.
- Account: test@example.com
- Date/Time: 2025-12-28 14:30

**Additional Notes:**
Any other relevant information
```

---

## Priority Definitions

**Critical:** Prevents core functionality, blocks users completely
Examples: Cannot sign in, cannot add items, data loss

**High:** Major feature broken, significant impact on users
Examples: Extension not extracting prices, emails not sending

**Medium:** Feature partially broken, workaround available
Examples: Image not uploading, minor display issues

**Low:** Cosmetic issues, minor inconveniences
Examples: Text alignment, color inconsistency

---

## Testing Tips

1. **Take Your Time:** Don't rush through tests
2. **Be Thorough:** Try to break things
3. **Document Everything:** Screenshot issues immediately
4. **Think Like a User:** Would this confuse someone?
5. **Test the Happy Path First:** Then try to break it
6. **Clear Cache Between Tests:** For accurate results
7. **Use Real Data:** Test with realistic product names and prices
8. **Ask Questions:** If anything is unclear, ask the dev team

---

## Sign-Off

Once you've completed all sections:

- [ ] All critical tests passed
- [ ] All issues documented and reported
- [ ] Screenshots collected and organized
- [ ] Summary report written

**QA Tester Name:** _______________
**Date Completed:** _______________
**Total Issues Found:** _______________
**Critical Issues:** _______________

---

## Quick Reference

**Main Website:** https://ppltok.github.io/Nesty
**Test Account:** (get from dev team)
**Test Sites for Extension:**
- shilav.co.il
- amazon.com
- buybuy.co.il

**Need Help?**
Contact development team with questions.

---

**End of QA Checklist**
