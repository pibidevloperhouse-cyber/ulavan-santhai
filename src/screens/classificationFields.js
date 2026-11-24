// Profile fields follow the marketplace classification forms.
export const buyerClassifications = {
  "Business": {
    heading: "COMMERCIAL ENTERPRISE BUYER FORM",
    fields: [
      {key: "businessName", label: "Business / Enterprise Name", placeholder: "e.g. Kongu Agri Traders"},
      {key: "businessIsGst", label: "Are you GST Registered?", radio: true},
      {key: "businessGstin", label: "GSTIN (15 Digits)", placeholder: "e.g. 33AAAAA0000A1Z5", when: "businessIsGst"},
    ],
  },
  "Manufacturer": {
    heading: "INDUSTRIAL MANUFACTURER FORM",
    fields: [
      {key: "mfgCompanyName", label: "Legal Company Name", placeholder: "e.g. Apex Bio-Industries Pvt Ltd"},
      {key: "mfgCategory", label: "Manufacturing Category", options: ["Food & Beverage", "Textiles & Cotton", "Animal & Cattle Feed", "Herbal & Ayurvedic Extracts", "Starch & Derivatives", "Bio-Energy"]},
      {key: "mfgIsGst", label: "Are you GST Registered?", radio: true},
      {key: "mfgGstin", label: "Company GSTIN (15 Digits)", placeholder: "e.g. 33AAAAA0000A1Z5", when: "mfgIsGst"},
    ],
  },
  "Reseller": {
    heading: "MANDI RESELLER & RETAIL MERCHANT FORM",
    fields: [
      {key: "resellerShopName", label: "Shop / Mandi Stall Name", placeholder: "e.g. Madurai Vegetable Mandi Stall No. 24"},
      {key: "resellerType", label: "Reseller Type", options: ["Mandi Wholesale Commission Agent", "Retail Grocery / Supermarket", "Vegetable Vendor Group", "Mobile Delivery Van"]},
    ],
  },
  "Other": {
    heading: "CUSTOM INSTITUTION / BUYER FORM",
    fields: [
      {key: "otherOrgName", label: "Organization / Applicant Name", placeholder: "e.g. Sri Krishna Educational Trust Hostel"},
      {key: "otherCategory", label: "Applicant Category / Sector", placeholder: "e.g. Hostel, Temple Trust, NGO, Exporter"},
      {key: "otherPurpose", label: "Purpose of Agricultural Purchase", placeholder: "e.g. Daily meals procurement for 500 hostel students"},
    ],
  },
};

export const sellerClassifications = {
  "Farmer": {
    heading: "DIRECT FARMER & CULTIVATOR FORM",
    fields: [
      {key: "farmerFarmName", label: "Farm Name", placeholder: "e.g. Sri Murugan Thottam"},
    ],
  },
  "Agricultural Producer": {
    heading: "FPO & AGRICULTURAL COOPERATIVE FORM",
    fields: [
      {key: "fpoName", label: "FPO / Society Legal Name", placeholder: "e.g. Kongu Uzhavar Producer Co Ltd"},
      {key: "fpoStructure", label: "Organization Structure", options: ["Farmer Producer Company (FPC)", "Registered Cooperative Society", "Joint Liability Group (JLG)", "Self Help Group (SHG)"]},
      {key: "fpoIsRegistered", label: "Do you have Registration Number?", radio: true},
      {key: "fpoRegNumber", label: "Registration No (CIN / Society Reg)", placeholder: "e.g. U01409TZ2021PTC028491", when: "fpoIsRegistered"},
    ],
  },
  "Organic Producer": {
    heading: "ORGANIC CERTIFIED PRODUCER FORM",
    fields: [
      {key: "organicFarmName", label: "Organic Farm / Brand Name", placeholder: "e.g. Pristine Nature Organic Farm"},
      {key: "organicCertStatus", label: "Certification Status", options: ["Certified Organic (NPOP)", "In-Conversion (C1 / C2)", "PGS-India Green / Organic", "Natural Farming (Uncertified)"]},
      {key: "organicHasLicense", label: "Do you have License Number?", radio: true},
      {key: "organicScopeNumber", label: "Certificate Scope / License No", placeholder: "e.g. NPOP/NAB/0017/ORG-2024", when: "organicHasLicense"},
    ],
  },
  "Raw-Material Provider": {
    heading: "BULK RAW-MATERIAL PROVIDER FORM",
    fields: [
      {key: "rawProviderName", label: "Business / Provider Name", placeholder: "e.g. Cauvery Raw Agri Commodities"},
    ],
  },
  "Ingredient Producer": {
    heading: "AGRI-INGREDIENT PRODUCER FORM",
    fields: [
      {key: "ingProducerName", label: "Enterprise Name", placeholder: "e.g. Kongu Traditional Chekku Oils"},
      {key: "ingHasFssai", label: "Do you have FSSAI Food License?", radio: true},
      {key: "ingFssaiNumber", label: "FSSAI Food License (14 Digits)", placeholder: "e.g. 10020042000789", when: "ingHasFssai"},
    ],
  },
  "Manufacturer": {
    heading: "INDUSTRIAL AGRO-MANUFACTURER FORM",
    fields: [
      {key: "mfgSellerName", label: "Company Name", placeholder: "e.g. Salem Agro Refineries Ltd"},
      {key: "mfgHasFssai", label: "Do you have FSSAI Food License?", radio: true},
      {key: "mfgFssaiNumber", label: "FSSAI Food License (14 Digits)", placeholder: "e.g. 10020042000789", when: "mfgHasFssai"},
      {key: "mfgIsGst", label: "Are you GST Registered?", radio: true},
      {key: "mfgGstin", label: "GSTIN (15 Digits)", placeholder: "e.g. 33AAAAA0000A1Z5", when: "mfgIsGst"},
    ],
  },
  "Value-Added Manufacturer": {
    heading: "VALUE-ADDED FOOD PRODUCTS FORM",
    fields: [
      {key: "vaBrandName", label: "Brand / Enterprise Name", placeholder: "e.g. Madurai Traditional Pickles & Snacks"},
      {key: "vaHasFssai", label: "Do you have FSSAI Food License?", radio: true},
      {key: "vaFssaiNumber", label: "FSSAI License (14 Digits)", placeholder: "e.g. 10020042000999", when: "vaHasFssai"},
    ],
  },
  "Other": {
    heading: "SPECIALIZED FARM ENTERPRISE FORM",
    fields: [
      {key: "otherSellerName", label: "Enterprise Name", placeholder: "e.g. Thanjavur Coconut Saplings Nursery"},
      {key: "otherActivity", label: "Enterprise Activity", placeholder: "e.g. Grafted Fruit Saplings, Honey Apiculture, Mushrooms"},
      {key: "otherIsGst", label: "Are you GST Registered?", radio: true},
      {key: "otherGstin", label: "GSTIN (15 Digits)", placeholder: "e.g. 33AAAAA0000A1Z5", when: "otherIsGst"},
    ],
  },
};
