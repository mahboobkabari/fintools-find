---
title: "Extended Internal Rate of Return (XIRR)"
shortDefinition: "The rate of return for investments with multiple cash flows occurring at irregular date intervals."
category: "investment"
synonyms: ["Internal Rate of Return", "SIP Return Rate"]
relatedTerms: ["cagr", "sip", "mutual-fund"]
relatedCalculators: ["sip-calculator", "step-up-sip-calculator"]
relatedGuides: ["sip-investing-explained"]
relatedComparisons: ["sip-vs-lumpsum"]
examples:
  - "Calculating annualized returns across 36 monthly SIP installments into a mutual fund."
formulas:
  - "Sum of (CashFlow_i / (1 + XIRR) ^ ((Date_i - Date_0) / 365)) = 0"
commonMistakes:
  - "Applying simple CAGR to monthly SIP investments instead of XIRR."
faqs:
  - question: "Why is XIRR necessary for SIPs?"
    answer: "Each SIP installment is invested at a different date and has a different compounding duration."
---

# Extended Internal Rate of Return (XIRR) Guide

**XIRR** is the gold standard metric for measuring returns on mutual fund SIPs where money is invested across multiple dates.
