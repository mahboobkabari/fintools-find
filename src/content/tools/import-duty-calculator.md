---
title: "Import Duty Calculator: Customs Valuation, Landed Cost & Tariff Surcharges"
metaDescription: "Calculate import customs duty, social welfare surcharge, compounded import GST/VAT, and total landed cost per unit across CIF and FOB valuation standards."
category: "currency"
categoryName: "Currency & Cost Calculators"
slug: "import-duty-calculator"
currency: "generic"
howToUse:
  - "Enter your Item Unit Price and the total Quantity of units in the import consignment."
  - "Input international Freight / Shipping and Transit Cargo Insurance costs."
  - "Select your Customs Valuation Base: CIF (Product + Freight + Insurance for India/EU/UK) or FOB (US CBP standard)."
  - "Specify the applicable Basic Customs Duty (BCD) rate and Import VAT / IGST percentage."
  - "Optionally adjust the Social Welfare Surcharge (SWS) and Courier Clearance / Brokerage Handling fees."
  - "Review the complete landed cost schedule, statutory compounded tax base, and effective tax burden per unit."
features:
  - "WTO/GATT standard customs valuation supporting both CIF and FOB assessment models"
  - "Sequential statutory tax compounding (Customs Duty → Surcharges → Compounded Import VAT/GST)"
  - "Total landed cost and landed cost per unit calculations for commercial procurement"
  - "Landed cost component share breakdown (Product %, Taxes %, Freight %, Brokerage %)"
  - "Multi-currency support across 8 global currency regimes (INR, USD, EUR, GBP, AED, CAD, AUD, SGD)"
  - "Zero-server private client-side execution with shareable scenario URLs"
benefits:
  - "Accurately budget the true landed cost of overseas goods before placing international purchase orders"
  - "Protect gross profit margins for e-commerce, D2C, and Amazon FBA cross-border operations"
  - "Avoid unexpected customs clearance charges, demurrage fees, and courier brokerage surprises"
  - "Evaluate Input Tax Credit (ITC) eligibility on commercial import IGST / VAT payments"
faqs:
  - question: "What is import duty?"
    answer: "Import duty (customs duty) is a statutory tax collected by a country's customs authority on goods imported from abroad. It serves to generate government revenue and protect domestic industries from foreign competition."
  - question: "What is the difference between CIF and FOB customs valuation?"
    answer: "Under CIF (Cost, Insurance, and Freight), customs duty is assessed on the total cost of the product plus international freight and insurance. Most countries (including India, the UK, the EU, and GCC nations) use CIF. Under FOB (Free on Board), used by the US Customs and Border Protection (CBP), customs duty is calculated solely on the product value at the port of export."
  - question: "Why is import GST/VAT higher than the standard percentage on item price?"
    answer: "Import GST/VAT is calculated on a compounded statutory tax base consisting of Assessable Customs Value + Basic Customs Duty + Customs Surcharges. Because taxes are levied on top of duties and freight, the effective tax rate is higher than a simple addition of rates."
  - question: "What is the Social Welfare Surcharge (SWS) in India?"
    answer: "In India, the Social Welfare Surcharge (SWS) is an additional levy of 10% charged on the aggregate value of Basic Customs Duty (BCD) payable on imported goods, introduced under the Finance Act to fund social welfare programs."
  - question: "Can businesses claim back import GST or VAT?"
    answer: "Yes. Registered businesses under GST (in India) or VAT (in the UK, EU, UAE) can generally claim the import IGST/VAT paid at customs as an Input Tax Credit (ITC) against their domestic sales tax obligations, provided they have a valid bill of entry."
  - question: "Does this calculator provide official binding tariff rulings?"
    answer: "No. This calculator is an educational landed cost estimation tool. Binding tariff classifications (HS Codes), preferential trade concessions, and official duty assessments are made exclusively by the destination customs authority upon cargo inspection."
calculatorModule: "currency/import-duty-calculator.js"
publishDate: 2026-08-27
priority: "P0"
relatedTools:
  - "remittance-fee-calculator"
  - "currency-converter"
  - "cost-of-living-calculator"
  - "purchasing-power-calculator"
  - "gst-calculator"
  - "vat-calculator"
eeat:
  reviewedBy: "Fintools Find International Trade & Customs Advisory Board"
  methodology: "Calculations follow the WTO Agreement on Implementation of Article VII of GATT 1994 (Customs Valuation Agreement), CBIC Indian Customs Tariff Acts, and international landed-cost compounding frameworks."
  dataSources:
    - "World Trade Organization (WTO) Customs Valuation Agreement (GATT 1994)"
    - "Central Board of Indirect Taxes and Customs (CBIC) Customs Tariff Act"
    - "HM Revenue & Customs (HMRC) Trade Tariff Schedule"
    - "US International Trade Commission (USITC) Harmonized Tariff Schedule"
advancedContent:
  definitionSnippet: "An import duty calculator computes the total landed cost of imported cargo by modeling basic customs tariffs, surcharges, compounded import VAT/GST, and freight handling fees."
  proTips:
    - "Obtain a formal Certificate of Origin (CoO) from overseas suppliers to unlock preferential zero-duty rates under Free Trade Agreements (FTAs)."
    - "In CIF jurisdictions, reducing parcel dimensional weight lowers both freight costs and the statutory customs assessable value."
    - "Ensure your commercial invoice clearly separates item price, ocean/air freight, and marine insurance to prevent customs officers from applying default maximum freight benchmarks."
  commonMistakes:
    - "Adding percentages naively (10% Duty + 18% GST ≠ 28%): Import taxes are compounded on top of duty and freight."
    - "Overlooking courier clearance fees: International express couriers frequently charge administrative disbursement and clearance fees ($15 - $50)."
    - "Failing to account for B2B Input Tax Credit: Confusing non-recoverable customs duty with recoverable import IGST."
  glossaryTerms:
    - term: "Basic Customs Duty (BCD)"
      definition: "The primary tariff rate levied on imported goods based on their Harmonized System (HS) code classification."
    - term: "Landed Cost"
      definition: "The complete, all-inclusive total cost of an imported good delivered to the final buyer, including product price, freight, insurance, customs duties, taxes, and handling."
    - term: "CIF Valuation"
      definition: "Cost, Insurance, and Freight: A customs assessment standard where duty is levied on the sum of the product price, international shipping, and cargo insurance."
    - term: "FOB Valuation"
      definition: "Free on Board: A customs assessment standard where duty is levied solely on the product price at the export origin port."
---

## Understanding Import Duty & Total Landed Cost

When importing goods internationally—whether as an individual buying a consumer electronic gadget or a business procuring commercial inventory—the invoice price paid to the seller is only one part of the total expenditure.

The true financial metric in cross-border trade is the **Total Landed Cost**, which encompasses:
1. **Base Product Value** (Unit Price × Quantity)
2. **International Freight & Shipping** (Air Courier or Ocean Cargo)
3. **Marine & Transit Insurance**
4. **Basic Customs Duty (BCD)**
5. **Statutory Customs Surcharges** (e.g., 10% Social Welfare Surcharge in India)
6. **Compounded Import GST / VAT** (e.g., 18% IGST or 20% VAT)
7. **Customs Clearance & Courier Brokerage Fees**

---

## The Sequential Tax Compounding Methodology

Customs authorities do not simply add tax percentages together. International customs valuation (under WTO/GATT guidelines) follows a strict compounding sequence:

### Step 1: Assessable Customs Value
- **Under CIF (Cost, Insurance & Freight - India, EU, UK, GCC)**:
  $$\text{Assessable Value} = \text{Product Value} + \text{Shipping} + \text{Insurance}$$
- **Under FOB (Free on Board - USA CBP)**:
  $$\text{Assessable Value} = \text{Product Value}$$

### Step 2: Basic Customs Duty (BCD)
$$\text{Basic Customs Duty} = \text{Assessable Value} \times \left(\frac{\text{Duty Rate \%}}{100}\right)$$

### Step 3: Social Welfare Surcharge (SWS)
$$\text{SWS Amount} = \text{Basic Customs Duty} \times \left(\frac{\text{Surcharge Rate \%}}{100}\right)$$

### Step 4: Import GST / VAT (Compounded Base)
$$\text{Tax Base} = \text{Assessable Value} + \text{Basic Customs Duty} + \text{SWS Surcharge}$$
$$\text{Import GST / VAT} = \text{Tax Base} \times \left(\frac{\text{GST / VAT Rate \%}}{100}\right)$$

### Step 5: Total Landed Cost
$$\text{Total Landed Cost} = \text{Product Value} + \text{Freight} + \text{Insurance} + \text{BCD} + \text{SWS} + \text{Import GST/VAT} + \text{Brokerage Fee}$$

---

## Comparison: CIF vs. FOB Customs Valuation

| Attribute | CIF (Cost, Insurance & Freight) | FOB (Free on Board) |
|---|---|---|
| **Primary Jurisdictions** | India (CBIC), European Union, UK (HMRC), GCC | United States (CBP), Australia (some imports) |
| **Duty Assessment Base** | Item Price + Freight + Insurance | Item Price Only at Port of Export |
| **Freight Impact on Duty** | High freight increases customs duty | Freight is excluded from customs duty |
| **Tax Base for VAT/GST** | (CIF + Duty + Surcharge) | (FOB + Duty + Surcharge + Freight) |

---

## B2B Input Tax Credit (ITC) Recovery

For registered corporate importers, **Import GST / VAT is not a sunk cost**:
- **Basic Customs Duty (BCD)** is a non-recoverable operational business expense.
- **Import IGST / VAT** is 100% creditable against domestic sales tax obligations via the monthly indirect tax return, provided proper customs documentation (Bill of Entry) is maintained.
