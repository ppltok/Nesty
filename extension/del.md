content.js:11 🚀 Babylist API Tester - Starting...
content.js:16 📍 Current Page URL: https://www.baby-star.co.il/products/65013
content.js:19 📡 Calling Babylist API...
content.js:118 🔗 Requesting API fetch from background script
content.js:23 ✅ SUCCESS! Directives received from Babylist API
content.js:24 📦 Full Response: {directives: Array(12)}
content.js:27 📋 DIRECTIVES BREAKDOWN:
content.js:28 ========================
content.js:30 
Directive 1: (10) [{…}, {…}, {…}, Array(2), Array(1), {…}, Array(3), Array(1), Array(2), {…}]
content.js:30 
Directive 2: (3) [Array(2), Array(1), {…}]
content.js:30 
Directive 3: {type: 'Chain', when: {…}, directives: Array(2)}
content.js:30 
Directive 4: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 5: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 6: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 7: [Array(1)]
content.js:30 
Directive 8: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 9: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 10: {type: 'Chain', when: {…}, directives: Array(2)}
content.js:30 
Directive 11: {type: 'Chain', when: {…}, directives: Array(1)}
content.js:30 
Directive 12: {type: 'RemoveEmptyResults', exceptedKeys: Array(4)}
content.js:32 ========================

content.js:35 📄 Full Response as JSON:
content.js:36 {
  "directives": [
    [
      {
        "type": "Chain",
        "when": {
          "a": {
            "ref": "jsonLdProduct"
          },
          "operator": "falsy"
        },
        "directives": [
          {
            "type": "JsonLdProduct",
            "assign": {
              "ref": "jsonLdProduct"
            }
          }
        ]
      },
      {
        "type": "Chain",
        "when": {
          "a": {
            "ref": "jsonLdProduct"
          },
          "operator": "truthy"
        },
        "directives": [
          {
            "type": "Dig",
            "pathString": "offers",
            "object": {
              "ref": "jsonLdProduct"
            },
            "assign": {
              "ref": "offers"
            }
          },
          {
            "type": "Chain",
            "when": {
              "a": {
                "ref": "offers"
              },
              "operator": "truthy"
            },
            "directives": [
              {
                "type": "Chain",
                "when": {
                  "a": {
                    "ref": "variantId"
                  },
                  "operator": "truthy"
                },
                "directives": [
                  {
                    "type": "Find",
                    "array": {
                      "ref": "offers"
                    },
                    "operator": "includes",
                    "a": [
                      {
                        "type": "Dig",
                        "pathString": "url",
                        "object": {
                          "ref": "_value"
                        }
                      }
                    ],
                    "b": [
                      {
                        "type": "Define",
                        "value": {
                          "ref": "variantId"
                        }
                      }
                    ]
                  },
                  {
                    "type": "Define",
                    "when": {
                      "a": {
                        "ref": "_prev"
                      },
                      "operator": "present"
                    },
                    "value": {
                      "ref": "_prev"
                    },
                    "assign": {
                      "ref": "offer"
                    }
                  }
                ]
              },
              {
                "type": "Chain",
                "when": {
                  "a": {
                    "ref": "variantId"
                  },
                  "operator": "falsy"
                },
                "directives": [
                  {
                    "type": "Dig",
                    "pathString": "1",
                    "object": {
                      "ref": "offers"
                    }
                  },
                  {
                    "type": "Dig",
                    "when": {
                      "a": {
                        "ref": "_prev"
                      },
                      "operator": "falsy"
                    },
                    "pathString": "0",
                    "object": {
                      "ref": "offers"
                    }
                  },
                  {
                    "type": "Define",
                    "when": {
                      "a": {
                        "ref": "_prev"
                      },
                      "operator": "present"
                    },
                    "value": {
                      "ref": "_prev"
                    },
                    "assign": {
                      "ref": "offer"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "Chain",
        "when": {
          "a": {
            "ref": "jsonLdProduct"
          },
          "operator": "truthy"
        },
        "directives": [
          {
            "type": "Chain",
            "when": {
              "a": {
                "result": "title"
              },
              "operator": "falsy"
            },
            "directives": [
              {
                "type": "Dig",
                "pathString": "title",
                "object": {
                  "ref": "jsonLdProduct"
                }
              },
              {
                "type": "Define",
                "value": {
                  "ref": "_prev"
                },
                "assign": {
                  "result": "title"
                },
                "when": {
                  "a": {
                    "ref": "_prev"
                  },
                  "operator": "truthy"
                }
              }
            ]
          }
        ]
      },
      [
        [
          {
            "type": "Chain",
            "when": {
              "a": {
                "result": "pric
content.js:40 📊 Directive Analysis: {platform: 'Shopify', fields: Array(7), chainCount: 12, hasJsonLd: true, hasShopify: true, …}
content.js:186 🔍 Searching for product data on page...
content.js:191 Found 3 JSON-LD script(s)
content.js:196 JSON-LD 1: {@context: 'https://schema.org', @type: 'BreadcrumbList', itemListElement: Array(5)}
content.js:196 JSON-LD 2: {@context: 'http://schema.org', @type: 'Organization', name: 'בייביסטאר', logo: 'https://www.baby-star.co.il/cdn/shop/files/logo_1.png?v=1738574092&width=1144', sameAs: Array(9), …}
content.js:196 JSON-LD 3: {@context: 'http://schema.org/', @id: '/products/65013#product', @type: 'ProductGroup', brand: {…}, category: 'עריסה', …}
content.js:297 Found ProductGroup, extracting data...
content.js:333 ========== SIMPLIFIED PRODUCT DATA ==========
content.js:334 {
  "name": "עריסה נצמדת למיטה נועה NOA",
  "category": "עריסה",
  "price": "1100.00",
  "priceCurrency": "ILS",
  "brand": "Sport line",
  "imageUrls": [
    "https://www.baby-star.co.il/cdn/shop/files/8_7ea834f3-5064-4bcf-89d5-88243d9b6be5.webp?v=1763544616&width=1920",
    "https://www.baby-star.co.il/cdn/shop/files/Screenshot_3_bdf7c787-9b95-4f49-9149-c104571b373d.webp?v=1763544616&width=1920",
    "https://www.baby-star.co.il/cdn/shop/files/ANP_4234_web.webp?v=1763544616&width=1920",
    "https://www.baby-star.co.il/cdn/shop/files/ANP_4185_web.webp?v=1763544616&width=1920",
    "https://www.baby-star.co.il/cdn/shop/files/ANP_4214_web.webp?v=1763544616&width=1920"
  ]
}
content.js:335 ========== END SIMPLIFIED DATA ==========

content.js:418 ========== EXTRACTED PRODUCT DATA ==========
content.js:419 {
  "@type": "Product",
  "name": "עריסה נצמדת למיטה נועה NOA",
  "brand": {
    "@type": "Brand",
    "name": "Sport line"
  },
  "category": "עריסה",
  "description": "עריסה מעוצבת במגוון עיצובים חדשים נצמדת למיטת הורים.\nשלד מעוצב דמוי עץ / אפור/ שחור/בז מוברש עם מגוון ריפודים חדשים\nנצמדת למיטת הורים בעזרת רצועות קשירה לבטיחות מרבית.\nלעריסה 6 מצבי גובה הניתנים לשינוי ע\"פ צורך שימוש והתאמה לגובה מיטת ההורים.\nלעריסה גלגלים עם נעילה, מזרן עבה במיוחד, כילה מפוארת ומשטח אחסנה גדול במיוחד.",
  "image": "https://www.baby-star.co.il/cdn/shop/files/8_7ea834f3-5064-4bcf-89d5-88243d9b6be5.webp?v=1763544616&width=1920",
  "sku": "65013",
  "url": "https://www.baby-star.co.il/products/65013",
  "productGroupID": "7895672455215",
  "offers": {
    "price": "1100.00",
    "priceCurrency": "ILS",
    "availability": "http://schema.org/OutOfStock",
    "url": "https://www.baby-star.co.il/products/65013?variant=43964906700847"
  },
  "variants": [
    {
      "@id": "/products/65013?variant=43964906700847#variant",
      "@type": "Product",
      "gtin": "7290113215139",
      "image": "https://www.baby-star.co.il/cdn/shop/files/8_7ea834f3-5064-4bcf-89d5-88243d9b6be5.webp?v=1763544616&width=1920",
      "name": "עריסה נצמדת למיטה נועה NOA - ריפוד בז' / שלד שמפניה",
      "offers": {
        "@id": "/products/65013?variant=43964906700847#offer",
        "@type": "Offer",
        "availability": "http://schema.org/OutOfStock",
        "price": "1100.00",
        "priceCurrency": "ILS",
        "url": "https://www.baby-star.co.il/products/65013?variant=43964906700847"
      },
      "sku": "65013"
    },
    {
      "@id": "/products/65013?variant=43964906733615#variant",
      "@type": "Product",
      "gtin": "7290113213357",
      "image": "https://www.baby-star.co.il/cdn/shop/files/Screenshot_3_bdf7c787-9b95-4f49-9149-c104571b373d.webp?v=1763544616&width=1920",
      "name": "עריסה נצמדת למיטה נועה NOA - ריפוד אפור / שלד אפור כהה",
      "offers": {
        "@id": "/products/65013?variant=43964906733615#offer",
        "@type": "Offer",
        "availability": "http://schema.org/OutOfStock",
        "price": "899.00",
        "priceCurrency": "ILS",
        "url": "https://www.baby-star.co.il/products/65013?variant=43964906733615"
      },
      "sku": "91737"
    },
    {
      "@id": "/products/65013?variant=44662929457199#variant",
      "@type": "Product",
      "gtin": "7290113215771",
      "image": "https://www.baby-star.co.il/cdn/shop/files/ANP_4234_web.webp?v=1763544616&width=1920",
      "name": "עריסה נצמדת למיטה נועה NOA - ריפוד לבן / שלד דמוי עץ",
      "offers": {
        "@id": "/products/65013?variant=44662929457199#offer",
        "@type": "Offer",
        "availability": "http://schema.org/InStock",
        "price": "1190.00",
        "priceCurrency": "ILS",
        "url": "https://www.baby-star.co.il/products/65013?variant=44662929457199"
      },
      "sku": "40165122"
    },
    {
      "@id": "/products/65013?variant=44662940434479#variant",
      "@type": "Product",
      "gtin": "7290113215320",
      "image": "https://www.baby-star.co.il/cdn/shop/files/ANP_4185_web.webp?v=1763544616&width=1920",
      "name": "עריסה נצמדת למיטה נועה NOA - ריפוד שחור / שלד שמפניה",
      "offers": {
        "@id": "/products/65013?variant=44662940434479#offer",
        "@type": "Offer",
        "availability": "http://schema.org/InStock",
        "price": "1190.00",
        "priceCurrency": "ILS",
        "url": "https://www.baby-star.co.il/products/65013?variant=44662940434479"
      },
      "sku": "65128"
    },
    {
      "@id": "/products/65013?variant=44662947020847#variant",
      "@type": "Product",
      "gtin": "7290113215634",
      "image": "https://www.baby-star.co.il/cdn/shop/files/ANP_4214_web.webp?v=1763544616&width=1920",
      "name": "עריסה נצמדת למיטה נועה NOA - ריפוד שחור / שלד רוזגולד",
      "offers": {
        "@id": "/products/65013?variant=44662947020847#offer",
        "@type": "Offer",
        "availability": "http://schema.org/InStock",
        "price": "1190.00",
        "priceCurrency": "ILS",
        "url": "https://www.baby-star.co.il/products/65013?variant=44662947020847"
      },
      "sku": "40165121"
    }
  ]
}
content.js:420 ========== END EXTRACTED DATA ==========

content.js:523 ✅ Found Product data in JSON-LD: {@type: 'Product', name: 'עריסה נצמדת למיטה נועה NOA', brand: {…}, category: 'עריסה', description: 'עריסה מעוצבת במגוון עיצובים חדשים נצמדת למיטת הורי… עבה במיוחד, כילה מפוארת ומשטח אחסנה גדול במיוחד.', …}
content.js:63 🎁 ACTUAL PRODUCT DATA EXTRACTED FROM PAGE:
content.js:64 ==========================================
content.js:65 Product Name: עריסה נצמדת למיטה נועה NOA
content.js:66 Price: 1100.00 ILS
content.js:67 Availability: http://schema.org/OutOfStock
content.js:68 Brand: Sport line
content.js:69 SKU: 65013
content.js:70 Category: עריסה
content.js:71 Image URL: https://www.baby-star.co.il/cdn/shop/files/8_7ea834f3-5064-4bcf-89d5-88243d9b6be5.webp?v=1763544616&width=1920
content.js:72 Full product data: {@type: 'Product', name: 'עריסה נצמדת למיטה נועה NOA', brand: {…}, category: 'עריסה', description: 'עריסה מעוצבת במגוון עיצובים חדשים נצמדת למיטת הורי… עבה במיוחד, כילה מפוארת ומשטח אחסנה גדול במיוחד.', …}
content.js:73 ==========================================

