"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MobileRegistrationHeader from "@/components/onboarding/MobileRegistrationHeader";
import Stepper from "@/components/forms/Stepper";
import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import DocumentUploader from "@/components/forms/DocumentUploader";
import { submitApplication } from "@/services/onboardingApi";
import { submitRolePayment, fetchCurrentUserProfile } from "@/services/paymentApi";
import { useSessionUser } from "@/services/sessionAuth";
import PaymentView from "@/components/onboarding/PaymentView";
import BrandLogo from "@/components/ui/BrandLogo";
import { getSellerCategories, getBuyerCategories } from "@/services/categoryStorage";
import {
  getSellerUnlockedCategories,
  updateSellerProfile,
} from "@/services/sellerApi";

export const BUYER_TYPES = [
  "Individual",
  "Business",
  "Manufacturer",
  "Reseller",
  "Other",
];

export const SELLER_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other",
];

const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

const COMMON_COMMODITIES = [
  "Fresh Vegetables", "Fruits", "Rice & Cereals", "Millets & Pulses",
  "Spices & Condiments", "Coconut & Oilseeds", "Dairy Products", "Organic Produce"
];

const COMMON_CROPS = [
  "Paddy / Rice", "Banana", "Mango", "Tomato", "Onion", "Coconut",
  "Turmeric", "Millets", "Groundnut", "Sugarcane", "Spices", "Vegetables", "Flowers"
];

const createInitialBuyerData = () => ({
  // Common location
  district: "",
  city: "",
  pinCode: "",
  address: "",

  // 1. Individual
  individualCommodities: [],
  individualVolume: "",
  individualFrequency: "",
  individualPayment: "",

  // 2. Business
  businessName: "",
  businessConstitution: "Proprietorship",
  businessDesignation: "",
  businessIsGst: "No",
  businessGstin: "",
  businessCommodities: [],
  businessVolume: "",
  businessPaymentTerms: "",

  // 3. Manufacturer
  mfgCompanyName: "",
  mfgConstitution: "Private Limited",
  mfgDesignation: "",
  mfgCategory: "",
  mfgRawMaterials: "",
  mfgVolume: "",
  mfgIsGst: "No",
  mfgGstin: "",
  mfgPaymentTerms: "",

  // 4. Food Processor
  procBusinessName: "",
  procActivity: "",
  procRawCommodities: "",
  procCapacity: "",
  procFssaiNumber: "",
  procIsGst: "No",
  procGstin: "",
  procPaymentTerms: "",

  // 5. Bakery or Food Business
  bakeryName: "",
  bakeryType: "",
  bakeryDesignation: "",
  bakeryIngredients: "",
  bakeryFrequency: "",
  bakeryFssaiNumber: "",
  bakeryIsGst: "No",
  bakeryGstin: "",

  // 6. Reseller
  resellerShopName: "",
  resellerType: "",
  resellerCategories: [],
  resellerDailyVolume: "",
  resellerIsGst: "No",
  resellerGstin: "",
  resellerPaymentPreference: "",

  // 7. Other
  otherOrgName: "",
  otherCategory: "",
  otherPurpose: "",
  otherItemsNeeded: "",
  otherIsGst: "No",
  otherGstin: "",
});

const createInitialSellerData = () => ({
  // Common location
  district: "",
  village: "",
  pinCode: "",
  farmAddress: "",

  // 1. Farmer
  farmerFarmName: "",

  // 2. Agricultural Producer (FPO / Society)
  fpoName: "",
  fpoStructure: "Farmer Producer Company (FPC)",
  fpoIsRegistered: "No",
  fpoRegNumber: "",

  // 3. Organic Producer
  organicFarmName: "",
  organicCertStatus: "Certified Organic (NPOP)",
  organicHasLicense: "No",
  organicScopeNumber: "",

  // 4. Raw-Material Provider
  rawProviderName: "",

  // 5. Ingredient Producer
  ingProducerName: "",
  ingHasFssai: "No",
  ingFssaiNumber: "",

  // 6. Manufacturer
  mfgSellerName: "",
  mfgHasFssai: "No",
  mfgFssaiNumber: "",
  mfgIsGst: "No",
  mfgGstin: "",

  // 7. Value-Added Manufacturer
  vaBrandName: "",
  vaHasFssai: "No",
  vaFssaiNumber: "",

  // 8. Other
  otherSellerName: "",
  otherActivity: "",
  otherIsGst: "No",
  otherGstin: "",
});

/**
 * Sanitizes seller profile data before submission so only relevant
 * fields corresponding to the active classification are transmitted to backend.
 */
export const getSanitizedSellerProfile = (sellerType, sellerData) => {
  const commonLocation = {
    district: sellerData?.district || "",
    village: sellerData?.village || "",
    pinCode: sellerData?.pinCode || "",
    farmAddress: sellerData?.farmAddress || "",
  };

  switch (sellerType) {
    case "Farmer":
      return {
        ...commonLocation,
        farmerFarmName: sellerData?.farmerFarmName?.trim() || "",
      };
    case "Agricultural Producer":
      return {
        ...commonLocation,
        fpoName: sellerData?.fpoName?.trim() || "",
        fpoStructure: sellerData?.fpoStructure || "Farmer Producer Company (FPC)",
        fpoIsRegistered: sellerData?.fpoIsRegistered || "No",
        ...(sellerData?.fpoIsRegistered === "Yes" ? { fpoRegNumber: sellerData?.fpoRegNumber?.trim() || "" } : {}),
      };
    case "Organic Producer":
      return {
        ...commonLocation,
        organicFarmName: sellerData?.organicFarmName?.trim() || "",
        organicCertStatus: sellerData?.organicCertStatus || "Certified Organic (NPOP)",
        organicHasLicense: sellerData?.organicHasLicense || "No",
        ...(sellerData?.organicHasLicense === "Yes" ? { organicScopeNumber: sellerData?.organicScopeNumber?.trim() || "" } : {}),
      };
    case "Raw-Material Provider":
      return {
        ...commonLocation,
        rawProviderName: sellerData?.rawProviderName?.trim() || "",
      };
    case "Ingredient Producer":
      return {
        ...commonLocation,
        ingProducerName: sellerData?.ingProducerName?.trim() || "",
        ingHasFssai: sellerData?.ingHasFssai || "No",
        ...(sellerData?.ingHasFssai === "Yes" ? { ingFssaiNumber: sellerData?.ingFssaiNumber?.trim() || "" } : {}),
      };
    case "Manufacturer":
      return {
        ...commonLocation,
        mfgSellerName: sellerData?.mfgSellerName?.trim() || "",
        mfgHasFssai: sellerData?.mfgHasFssai || "No",
        ...(sellerData?.mfgHasFssai === "Yes" ? { mfgFssaiNumber: sellerData?.mfgFssaiNumber?.trim() || "" } : {}),
        mfgIsGst: sellerData?.mfgIsGst || "No",
        ...(sellerData?.mfgIsGst === "Yes" ? { mfgGstin: sellerData?.mfgGstin?.trim() || "" } : {}),
      };
    case "Value-Added Manufacturer":
      return {
        ...commonLocation,
        vaBrandName: sellerData?.vaBrandName?.trim() || "",
        vaHasFssai: sellerData?.vaHasFssai || "No",
        ...(sellerData?.vaHasFssai === "Yes" ? { vaFssaiNumber: sellerData?.vaFssaiNumber?.trim() || "" } : {}),
      };
    case "Other":
      return {
        ...commonLocation,
        otherSellerName: sellerData?.otherSellerName?.trim() || "",
        otherActivity: sellerData?.otherActivity?.trim() || "",
        otherIsGst: sellerData?.otherIsGst || "No",
        ...(sellerData?.otherIsGst === "Yes" ? { otherGstin: sellerData?.otherGstin?.trim() || "" } : {}),
      };
    default:
      return commonLocation;
  }
};

const createPaymentIdentifiers = (role, razorpayPaymentId) => ({
  now: new Date(),
  txId: `TXN_US_${Date.now().toString().slice(-8)}`,
  gwRef: razorpayPaymentId || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`,
  invNumber: `INV-US-2026-${Math.floor(100000 + Math.random() * 900000)}`,
  applicationId: `US_${role.toUpperCase()}_${Date.now().toString().slice(-6)}`,
});

function OnboardingContent({ initialRole, initialMode = "", initialUnlockCategory = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active role & optional additional-classification unlock mode from query
  const roleParam = (searchParams.get("role") || initialRole || "buyer").toLowerCase();
  const modeParam = (searchParams.get("mode") || initialMode || "").toLowerCase();
  const unlockCategoryParam = searchParams.get("category") || initialUnlockCategory || "";
  const [role, setRole] = useState(roleParam === "seller" ? "seller" : "buyer");
  const isUnlockMode = role === "seller" && modeParam === "unlock" && Boolean(unlockCategoryParam);

  // Stepper: normal onboarding uses 1 -> 2 -> 3 -> 4; unlock mode uses only 2 (Documents) -> 4 (Payment)
  const stepParam = parseInt(searchParams.get("step") || "", 10);
  const [currentStep, setCurrentStep] = useState(
    isUnlockMode
      ? stepParam === 4
        ? 4
        : 2
      : stepParam >= 1 && stepParam <= 4
        ? stepParam
        : 1
  );
  const [reviewSubStep, setReviewSubStep] = useState(1);

  // Authenticated user from session (hydration-safe)
  const userAuth = useSessionUser();
  const rightPanelRef = useRef(null);

  const scrollToTop = () => {
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Selected sub-type
  const [buyerType, setBuyerType] = useState("Individual");
  const [sellerType, setSellerType] = useState(() => (isUnlockMode ? unlockCategoryParam : ""));
  const [selectedSellerTypes, setSelectedSellerTypes] = useState(() =>
    isUnlockMode ? [unlockCategoryParam] : []
  );
  const [showMultiRoleModal, setShowMultiRoleModal] = useState(false);

  const hasSellerRole = (type) => selectedSellerTypes.includes(type);
  const selectedCustomSellerTypes = selectedSellerTypes.filter((t) => !SELLER_TYPES.includes(t));
  const activeCustomSellerType = selectedCustomSellerTypes[0] || "";

  // Live dynamic categories synchronized with Admin Portal
  const [dynamicSellerCats, setDynamicSellerCats] = useState(getSellerCategories);
  const [dynamicBuyerCats, setDynamicBuyerCats] = useState(getBuyerCategories);

  useEffect(() => {
    const handleCategorySync = () => {
      setDynamicSellerCats(getSellerCategories());
      setDynamicBuyerCats(getBuyerCategories());
    };
    handleCategorySync();
    window.addEventListener("ulavan_categories_updated", handleCategorySync);
    window.addEventListener("storage", handleCategorySync);
    return () => {
      window.removeEventListener("ulavan_categories_updated", handleCategorySync);
      window.removeEventListener("storage", handleCategorySync);
    };
  }, []);

  const displayedBuyerTypes = dynamicBuyerCats
    .filter((c) => c.status === "Active")
    .map((c) => c.code || c.name);
  const finalBuyerTypes = Array.from(new Set([...displayedBuyerTypes, ...BUYER_TYPES]));

  const displayedSellerTypes = dynamicSellerCats
    .filter((c) => c.status === "Active")
    .map((c) => c.code || c.name);
  const finalSellerTypes = Array.from(new Set([...displayedSellerTypes, ...SELLER_TYPES]));

  // Already purchased classifications when adding another classification from Seller Portal
  const existingPurchasedRoles = isUnlockMode
    ? getSellerUnlockedCategories(userAuth, dynamicSellerCats)
    : [];

  const selectedSellerCategoryObj = dynamicSellerCats.find(
    (c) => (c.code || c.name) === activeCustomSellerType || c.name === activeCustomSellerType
  );
  const selectedBuyerCategoryObj = dynamicBuyerCats.find(
    (c) => (c.code || c.name) === buyerType || c.name === buyerType
  );

  // Dynamic Buyer Form State - initialized clean
  const [buyerData, setBuyerData] = useState(createInitialBuyerData);

  // Dynamic Seller Form State - initialized clean
  const [sellerData, setSellerData] = useState(createInitialSellerData);
  const [sellerLocationEdits, setSellerLocationEdits] = useState({});

  const getSellerLocationField = (field) => {
    if (Object.prototype.hasOwnProperty.call(sellerLocationEdits, field)) {
      return sellerLocationEdits[field];
    }
    if (isUnlockMode && userAuth?.sellerData?.[field]) {
      return userAuth.sellerData[field];
    }
    return sellerData[field] || "";
  };

  const resolvedSellerData = {
    ...sellerData,
    district: getSellerLocationField("district"),
    village: getSellerLocationField("village"),
    pinCode: getSellerLocationField("pinCode"),
    farmAddress: getSellerLocationField("farmAddress"),
  };

  const handleSellerLocationChange = (field, value) => {
    setSellerLocationEdits((prev) => ({ ...prev, [field]: value }));
    setSellerData((p) => ({ ...p, [field]: value }));
  };

  // Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [previewDoc, setPreviewDoc] = useState(null);

  // Feedback & State
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Automatic reset when role switches or query changes
  const prevRoleRef = useRef(role);
  useEffect(() => {
    const nextRole = roleParam === "seller" ? "seller" : "buyer";
    if (prevRoleRef.current !== nextRole) {
      prevRoleRef.current = nextRole;
      setRole(nextRole);
      setCurrentStep(1);
      setUploadedDocs({});
      setPreviewDoc(null);
      setFormError("");
      setTermsAgreed(false);
      setBuyerData(createInitialBuyerData());
      setSellerData(createInitialSellerData());
    }
  }, [roleParam]);

  const handleBuyerTypeChange = (type) => {
    if (type !== buyerType) {
      setBuyerType(type);
      setUploadedDocs({});
      setFormError("");
    }
  };

  const handleSellerTypeToggle = (type) => {
    if (isUnlockMode && existingPurchasedRoles.includes(type)) {
      setFormError(`"${type}" is already active on your account. Select a new classification to unlock.`);
      return;
    }
    const isAlreadySelected = selectedSellerTypes.includes(type);
    const nextSelected = isAlreadySelected
      ? selectedSellerTypes.filter((t) => t !== type)
      : [...selectedSellerTypes, type];

    setSelectedSellerTypes(nextSelected);
    setSellerType(isAlreadySelected ? (nextSelected[0] || "") : type);
    setShowMultiRoleModal(nextSelected.length > 0);
    setUploadedDocs({});
    setFormError("");
  };

  const handleSellerTypeChange = (type) => {
    handleSellerTypeToggle(type);
  };

  // Combined document requirement flags across all selected seller classifications
  const needLandProof = role === "seller" && hasSellerRole("Farmer");
  const needFpoCert = role === "seller" && hasSellerRole("Agricultural Producer");
  const needOrganicCert = role === "seller" && hasSellerRole("Organic Producer");
  const needIdProof =
    role === "seller" && (hasSellerRole("Other") || selectedCustomSellerTypes.length > 0);
  const needBankPassbook = role === "seller" && selectedCustomSellerTypes.length > 0;
  const needFssaiCert =
    role === "seller" &&
    ((hasSellerRole("Ingredient Producer") && sellerData.ingHasFssai === "Yes") ||
      hasSellerRole("Manufacturer") ||
      hasSellerRole("Value-Added Manufacturer"));
  const needGstCert =
    role === "seller" &&
    (hasSellerRole("Raw-Material Provider") ||
      hasSellerRole("Ingredient Producer") ||
      hasSellerRole("Manufacturer") ||
      hasSellerRole("Other") ||
      (selectedCustomSellerTypes.length > 0 && sellerData.otherIsGst === "Yes") ||
      (hasSellerRole("Agricultural Producer") && sellerData.fpoIsGst === "Yes"));

  // Stage 4: Razorpay Payment States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const steps = [
    {
      id: 1,
      title: "Profile Details",
      subtitle:
        role === "buyer"
          ? `${buyerType} Form`
          : selectedSellerTypes.length > 1
            ? `${selectedSellerTypes.length} Roles Selected`
            : selectedSellerTypes.length === 1
              ? `${selectedSellerTypes[0]} Form`
              : "Choose Seller Type",
    },
    {
      id: 2,
      title: "Document Upload",
      subtitle: "Identity & Verification",
    },
    {
      id: 3,
      title: "Review & Submit",
      subtitle: "Final Confirmation",
    },
    {
      id: 4,
      title: "Payment",
      subtitle:
        role === "buyer"
          ? "₹365 Membership"
          : `₹${(Math.max(1, selectedSellerTypes.length) * 365).toLocaleString("en-IN")} Membership`,
    },
  ];

  const activeSteps = isUnlockMode
    ? [
        {
          id: 2,
          title: "Document Upload",
          subtitle: "Identity & Verification",
        },
        {
          id: 4,
          title: "Payment",
          subtitle: `₹${(Math.max(1, selectedSellerTypes.length) * 365).toLocaleString("en-IN")} Fee`,
        },
      ]
    : steps;

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    setFormError("");
    if (role === "buyer") {
      if (!buyerData.district) {
        setFormError("Please select your operating district.");
        return;
      }
      if (buyerType === "Business" && !buyerData.businessName.trim()) {
        setFormError("Please enter your Legal Business Name.");
        return;
      }
      if (buyerType === "Manufacturer" && !buyerData.mfgCompanyName.trim()) {
        setFormError("Please enter your Legal Company Name.");
        return;
      }
      if (buyerType === "Reseller" && !buyerData.resellerShopName.trim()) {
        setFormError("Please enter your Shop / Mandi Stall Name.");
        return;
      }
      if (buyerType === "Other" && !buyerData.otherOrgName.trim()) {
        setFormError("Please enter your Organization / Applicant Name.");
        return;
      }
      if (!BUYER_TYPES.includes(buyerType) && !buyerData.businessName?.trim() && !buyerData.otherOrgName?.trim()) {
        setFormError(`Please enter your Organization / Entity Name for ${buyerType}.`);
        return;
      }
    } else {
      if (selectedSellerTypes.length === 0) {
        setFormError("Please select at least one Seller Classification.");
        return;
      }
      if (!resolvedSellerData.district) {
        setFormError("Please select your farm/operating district.");
        return;
      }
      if (hasSellerRole("Farmer") && !sellerData.farmerFarmName?.trim()) {
        setFormError("Please enter your Farm Name.");
        return;
      }
      if (hasSellerRole("Agricultural Producer") && !sellerData.fpoName.trim()) {
        setFormError("Please enter your Producer Organization / FPO Name.");
        return;
      }
      if (hasSellerRole("Organic Producer") && !sellerData.organicFarmName?.trim()) {
        setFormError("Please enter your Organic Farm / Brand Name.");
        return;
      }
      if (hasSellerRole("Raw-Material Provider") && !sellerData.rawProviderName?.trim()) {
        setFormError("Please enter your Business / Enterprise Name.");
        return;
      }
      if (hasSellerRole("Ingredient Producer") && !sellerData.ingProducerName?.trim()) {
        setFormError("Please enter your Enterprise Name.");
        return;
      }
      if (hasSellerRole("Ingredient Producer") && sellerData.ingHasFssai === "Yes" && !sellerData.ingFssaiNumber?.trim()) {
        setFormError("Please enter your 14-digit FSSAI Food License Number.");
        return;
      }
      if (hasSellerRole("Manufacturer") && !sellerData.mfgSellerName?.trim()) {
        setFormError("Please enter your Company Name.");
        return;
      }
      if (hasSellerRole("Manufacturer") && sellerData.mfgHasFssai === "Yes" && !sellerData.mfgFssaiNumber?.trim()) {
        setFormError("Please enter your 14-digit FSSAI Food License Number.");
        return;
      }
      if (hasSellerRole("Manufacturer") && sellerData.mfgIsGst === "Yes" && !sellerData.mfgGstin?.trim()) {
        setFormError("Please enter your 15-digit GSTIN.");
        return;
      }
      if (hasSellerRole("Value-Added Manufacturer") && !sellerData.vaBrandName?.trim()) {
        setFormError("Please enter your Brand / Enterprise Name.");
        return;
      }
      if (hasSellerRole("Value-Added Manufacturer") && sellerData.vaHasFssai === "Yes" && !sellerData.vaFssaiNumber?.trim()) {
        setFormError("Please enter your 14-digit FSSAI Food License Number.");
        return;
      }
      if (hasSellerRole("Other") && !sellerData.otherSellerName?.trim()) {
        setFormError("Please enter your Enterprise Name.");
        return;
      }
      if (hasSellerRole("Other") && sellerData.otherIsGst === "Yes" && !sellerData.otherGstin?.trim()) {
        setFormError("Please enter your 15-digit GSTIN.");
        return;
      }
      if (selectedCustomSellerTypes.length > 0 && !sellerData.otherSellerName?.trim() && !sellerData.farmerFarmName?.trim()) {
        setFormError(`Please enter your Enterprise or Farm Name for ${selectedCustomSellerTypes[0]}.`);
        return;
      }
    }

    setCurrentStep(2);
    scrollToTop();
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    setFormError("");

    // For Buyers, document upload is optional (not mandatory)
    if (role === "buyer") {
      setCurrentStep(3);
      setReviewSubStep(1);
      scrollToTop();
      return;
    }

    // Validate combined document requirements across all selected seller classifications
    if (needLandProof && !uploadedDocs["LAND_PROOF"]) {
      setFormError("Please upload your Patta / Chitta document to continue.");
      return;
    }
    if (needFpoCert && !uploadedDocs["FPO_CERTIFICATE"]) {
      setFormError("Please upload your FPO / Cooperative Registration Certificate to continue.");
      return;
    }
    if (needOrganicCert && !uploadedDocs["ORGANIC_CERTIFICATE"]) {
      setFormError("Please upload your NPOP Organic Certificate document to continue.");
      return;
    }
    if (needIdProof && !uploadedDocs["ID_PROOF"]) {
      setFormError(
        hasSellerRole("Other")
          ? "Please upload your PAN Card / Government Identity Proof to continue."
          : "Please upload your Government Identity Proof to continue."
      );
      return;
    }
    if (needBankPassbook && !uploadedDocs["BANK_PASSBOOK"]) {
      setFormError("Bank Account Proof / Passbook is required for direct farm-gate settlement.");
      return;
    }
    if (needGstCert && !uploadedDocs["GST_CERTIFICATE"]) {
      setFormError("Please upload your GST Registration Certificate to continue.");
      return;
    }
    if (needFssaiCert && !uploadedDocs["FSSAI_LICENSE"]) {
      setFormError("Please upload your FSSAI Food Safety License Certificate to continue.");
      return;
    }

    if (isUnlockMode) {
      setCurrentStep(4);
      scrollToTop();
      return;
    }

    setCurrentStep(3);
    setReviewSubStep(1);
    scrollToTop();
  };

  // Stage 3 -> Stage 4 Transition
  const handleProceedToPayment = () => {
    if (!termsAgreed) {
      setFormError("Please agree to the declaration by checking the box to proceed.");
      return;
    }
    setFormError("");
    setCurrentStep(4);
    scrollToTop();
  };

  // Helper to dynamically load Razorpay Checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Stage 4: Initiate Razorpay Checkout
  const handleInitiateRazorpay = async () => {
    setFormError("");
    setIsProcessingPayment(true);

    const baseAmount = role === "seller" ? Math.max(1, selectedSellerTypes.length) * 365 : 365;
    const addonAmount = role === "buyer" ? addonBlocks * 10 : 0;
    const totalAmount = baseAmount + addonAmount;

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const isLoaded = await loadRazorpayScript();

    if (isLoaded && razorpayKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: totalAmount * 100, // paise
          currency: "INR",
          name: "Ulavan Santhai",
          description: role === "buyer" ? `Buyer Access Plan (${10 + addonBlocks * 10} Sellers)` : "Seller Monthly Membership",
          image: "/images/ulavan-santhai-emblem@2x.png",
          prefill: {
            name: userAuth?.name || "Verified Trader",
            email: userAuth?.email || "trader@ulavansanthai.in",
            contact: userAuth?.mobile || "9876543210",
          },
          theme: {
            color: "#174B35",
          },
          handler: function (response) {
            handleFinalizePayment(response.razorpay_payment_id || `pay_rzp_${Date.now()}`);
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay live checkout error, opening preview simulation:", err);
      }
    }

    // In development or when no live key is configured:
    // Open the interactive Razorpay payment modal
    setIsProcessingPayment(false);
    setIsRazorpayModalOpen(true);
  };

  // Finalize payment upon Razorpay success
  const handleFinalizePayment = async (razorpayPaymentId) => {
    setIsProcessingPayment(true);
    setIsRazorpayModalOpen(false);

    const baseAmount = role === "seller" ? Math.max(1, selectedSellerTypes.length) * 365 : 365;
    const addonAmount = role === "buyer" ? addonBlocks * 10 : 0;
    const totalAmount = baseAmount + addonAmount;
    const buyerViewLimit = role === "buyer" ? 10 + addonBlocks * 10 : null;

    const { now, txId, gwRef, invNumber, applicationId } = createPaymentIdentifiers(role, razorpayPaymentId);
    const startDate = now.toISOString();
    const endDate = new Date(now);
    if (role === "seller") {
      endDate.setDate(endDate.getDate() + 30); // 30 days monthly validity
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1-year buyer access validity
    }
    const renewalDueDate = endDate.toISOString();

    const resolvedSellerTypes = selectedSellerTypes.length > 0 ? selectedSellerTypes : [sellerType || "Farmer"];
    const mergedSellerTypes = isUnlockMode
      ? Array.from(new Set([...existingPurchasedRoles, ...resolvedSellerTypes]))
      : resolvedSellerTypes;
    const sellerTypesLabel = resolvedSellerTypes.join(", ");
    const mergedSellerTypesLabel = mergedSellerTypes.join(", ");

    // 1. Submit Application Data
    const fullPayload = {
      applicationId,
      role: role.toUpperCase(),
      subType: role === "buyer" ? buyerType : mergedSellerTypesLabel,
      account: userAuth,
      selectedSellerTypes: role === "seller" ? resolvedSellerTypes : [sellerType],
      profile: role === "buyer" ? buyerData : resolvedSellerData,
      documents: uploadedDocs,
      status: "active",
      submittedAt: startDate,
    };

    try {
      await submitApplication(fullPayload);

      // 2. Submit Payment Record via Payment API
      const checkoutData = {
        transactionId: txId,
        gatewayReference: gwRef,
        userId: userAuth?.id || "",
        userName: userAuth?.name || "Registered Member",
        userEmail: userAuth?.email || "",
        userMobile: userAuth?.mobile || "",
        role: role.toUpperCase(),
        planId:
          role === "buyer"
            ? "plan_buyer_base"
            : isUnlockMode
              ? `plan_seller_unlock_${resolvedSellerTypes.length}`
              : resolvedSellerTypes.length > 1
                ? `plan_seller_multi_${resolvedSellerTypes.length}`
                : "plan_seller_monthly",
        planName:
          role === "buyer"
            ? `Buyer Access Plan (${buyerViewLimit} Sellers)`
            : isUnlockMode
              ? `Additional Classification Unlock (${sellerTypesLabel} - ₹${resolvedSellerTypes.length * 365})`
              : `Seller Monthly Plan (${resolvedSellerTypes.length} Role${resolvedSellerTypes.length > 1 ? "s" : ""} - ₹${resolvedSellerTypes.length * 365})`,
        baseAmount,
        taxAmount: 0,
        totalAmount,
        currency: "INR",
        paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
        paymentDetails: {
          gateway: "Razorpay",
          razorpayPaymentId: gwRef,
        },
      };

      await submitRolePayment(checkoutData);

      // 3. Update session user state with role-specific independent completion flags
      let nextSellerProfileData = null;
      if (typeof window !== "undefined") {
        const stored =
          sessionStorage.getItem("ulavan_user") ||
          sessionStorage.getItem("ulavan_registered_user") ||
          localStorage.getItem("ulavan_registered_user");
        const existing = stored ? JSON.parse(stored) : (userAuth || {});

        const isBuyer = role === "buyer";
        const paymentRecord = {
          transactionId: txId,
          gatewayReference: gwRef,
          invoiceNumber: invNumber,
          amount: totalAmount,
          status: "SUCCESS",
          paidAt: startDate,
          planStartDate: startDate,
          planEndDate: endDate.toISOString(),
          renewalDueDate,
          buyerViewLimit,
          buyerViewed: 0,
          buyerRemaining: buyerViewLimit,
        };

        if (!isBuyer) {
          const existingSellerData = existing.sellerData || {};
          const rawUnlockFields = resolvedSellerTypes.reduce(
            (acc, cat) => ({ ...acc, ...getSanitizedSellerProfile(cat, resolvedSellerData) }),
            {}
          );
          const nonEmptyUnlockFields = Object.fromEntries(
            Object.entries(rawUnlockFields).filter(
              ([, value]) => value !== "" && value !== undefined && value !== null
            )
          );
          nextSellerProfileData = isUnlockMode
            ? {
                ...existingSellerData,
                ...nonEmptyUnlockFields,
                district: resolvedSellerData.district || existingSellerData.district || "",
                village: resolvedSellerData.village || existingSellerData.village || "",
                pinCode: resolvedSellerData.pinCode || existingSellerData.pinCode || "",
                farmAddress: resolvedSellerData.farmAddress || existingSellerData.farmAddress || "",
                sellerType: existingPurchasedRoles[0] || mergedSellerTypes[0],
                sellerTypes: mergedSellerTypes,
                unlockedCategories: mergedSellerTypes,
              }
            : {
                ...resolvedSellerData,
                sellerType: mergedSellerTypes[0],
                sellerTypes: mergedSellerTypes,
                unlockedCategories: mergedSellerTypes,
              };
        }

        const updatedUser = {
          ...existing,
          role: role.charAt(0).toUpperCase() + role.slice(1),
          activeRole: role,
          subType: isBuyer ? buyerType : mergedSellerTypesLabel,
          status: "active",
          isPaid: true,
          // Role-specific completion flags
          buyerPaid: isBuyer ? true : Boolean(existing.buyerPaid),
          buyerOnboarded: isBuyer ? true : Boolean(existing.buyerOnboarded),
          buyerData: isBuyer ? { ...buyerData, buyerType } : existing.buyerData,
          buyerPayment: isBuyer ? paymentRecord : existing.buyerPayment,

          sellerPaid: !isBuyer ? true : Boolean(existing.sellerPaid),
          sellerOnboarded: !isBuyer ? true : Boolean(existing.sellerOnboarded),
          sellerData: !isBuyer ? nextSellerProfileData : existing.sellerData,
          sellerPayment: !isBuyer ? paymentRecord : existing.sellerPayment,

          payment: paymentRecord,
        };

        sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        localStorage.setItem("ulavan_registered_user", JSON.stringify(updatedUser));
        sessionStorage.setItem("ulavan_latest_app_id", applicationId);
        sessionStorage.setItem("ulavan_latest_payment_id", invNumber);
      }

      if (role === "seller" && isUnlockMode && nextSellerProfileData) {
        await updateSellerProfile(nextSellerProfileData).catch(() => {});
      }

      // 4. Update local state to show Payment Receipt confirmation
      setPaymentResult({
        transactionId: txId,
        gatewayReference: gwRef,
        invoiceNumber: invNumber,
        paymentStatus: "SUCCESS",
        paymentDate: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        planStartDate: now.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        planEndDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        renewalDueDate: endDate.toLocaleDateString("en-IN", { dateStyle: "medium" }),
        role: role === "buyer" ? `Buyer (${buyerType})` : `Seller (${sellerTypesLabel})`,
        planName:
          role === "buyer"
            ? "Buyer Access Plan (10 Verified Sellers)"
            : isUnlockMode
              ? `Additional Classification (${sellerTypesLabel})`
              : `Seller Monthly Plan (${resolvedSellerTypes.length} Role${resolvedSellerTypes.length > 1 ? "s" : ""})`,
        baseAmount,
        addonAmount,
        totalAmount,
        paymentMethod: "Razorpay Gateway",
        buyerViewLimit,
        buyerViewed: 0,
        buyerRemaining: buyerViewLimit,
        addonBlocks,
        applicationId,
      });
      scrollToTop();
    } catch (err) {
      console.error("Payment submission error:", err);
      setFormError("Payment processing encountered an error. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Determine which documents are required based on active type
  // When buyerType is "Individual", GST certificate is NEVER required or shown.
  const isGstProvided =
    role === "buyer"
      ? buyerType !== "Individual" &&
      ((buyerType === "Business" && buyerData.businessIsGst === "Yes") ||
        (buyerType === "Manufacturer" && buyerData.mfgIsGst === "Yes") ||
        (buyerType === "Reseller" && buyerData.resellerIsGst === "Yes") ||
        (buyerType === "Other" && buyerData.otherIsGst === "Yes"))
      : needGstCert;

  const isFssaiRequired =
    role === "buyer"
      ? false
      : needFssaiCert;

  if (currentStep === 4) {
    return (
      <PaymentView
        role={role}
        selectedRoles={selectedSellerTypes}
        payableAmount={role === "seller" ? Math.max(1, selectedSellerTypes.length) * 365 : 365}
        isUnlockMode={isUnlockMode}
        existingRoles={existingPurchasedRoles}
        onRoleChange={(nextRole) => {
          if (isUnlockMode) return;
          setRole(nextRole);
          setCurrentStep(1);
          setUploadedDocs({});
          setPreviewDoc(null);
          setFormError("");
          setTermsAgreed(false);
          setSelectedSellerTypes([]);
          setSellerType("");
          setBuyerData(createInitialBuyerData());
          setSellerData(createInitialSellerData());
          router.replace(`/onboarding?role=${nextRole}&step=1`);
        }}
        userAuth={userAuth}
        onBack={() => {
          setCurrentStep(isUnlockMode ? 2 : 3);
          scrollToTop();
        }}
        onStepClick={(s) => {
          setCurrentStep(isUnlockMode ? (s === 4 ? 4 : 2) : s);
          if (!isUnlockMode && s === 3) setReviewSubStep(1);
          scrollToTop();
        }}
        onFinalizePayment={handleFinalizePayment}
        paymentResult={paymentResult}
        isProcessingExternal={isProcessingPayment}
        backgroundImage="/images/onboarding-step-4.png"
      />
    );
  }

  const stepVisualConfigs = {
    1: {
      src: "/images/onboarding-step-1.png",
      scale: "scale-[1.10]",
      alt: "Step 1: Sprouting Seed",
    },
    2: {
      src: "/images/onboarding-step-2.png",
      scale: "scale-[1.12]",
      alt: "Step 2: Growing Seedling",
    },
    3: {
      src: "/images/onboarding-step-3.png",
      scale: "scale-[1.15]",
      alt: "Step 3: Thriving Plant",
    },
    4: {
      src: "/images/onboarding-step-4.png",
      scale: "scale-[1.18]",
      alt: "Step 4: Flourishing Tree",
    },
  };
  const activeBackground = stepVisualConfigs[currentStep]?.src || "/images/onboarding-step-1.png";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("ulavan_auth_token");
      localStorage.removeItem("ulavan_registered_user");
    }
    router.push("/login");
  };

  const handleStepClick = (s) => {
    if (isUnlockMode) {
      if (s === 4) {
        handleNextFromStep2();
        return;
      }
      setCurrentStep(2);
      scrollToTop();
      return;
    }
    setCurrentStep(s);
    if (s === 3) setReviewSubStep(1);
    scrollToTop();
  };

  return (
    <div
      className="relative min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-[#174B35] selection:text-white bg-[#F5F8EC] lg:overflow-hidden"
    >
      <MobileRegistrationHeader
        currentStep={currentStep}
        isUnlockMode={isUnlockMode}
        onStepClick={handleStepClick}
        onLogout={handleLogout}
      />
      {/* Panoramic landscape footer strip in sequence without any clipping */}
      <div
        className="hidden lg:block fixed bottom-0 left-0 right-0 h-[30px] pointer-events-none z-20 bg-repeat-x bg-bottom"
        style={{
          backgroundImage: "url('/images/onboarding-landscape-strip.png')",
          backgroundSize: "auto 30px",
        }}
        aria-hidden="true"
      />

      {/* ======================================================== */}
      {/* LEFT PANEL: Brand, Stepper & Plant Visual on Nature BG  */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] shrink-0 lg:h-full hidden lg:flex flex-col justify-between p-6 sm:p-7 xl:p-9 pb-8 lg:pb-12 z-10 lg:overflow-hidden select-none">
        {/* Top Brand & Welcome */}
        <div>
          <BrandLogo width={160} priority />
          <h1 className="text-2xl sm:text-3xl font-black text-[#174B35] tracking-tight mt-6 sm:mt-8 leading-tight">
            {isUnlockMode ? "Add Classification" : "Create your account!"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1.5">
            {isUnlockMode
              ? "Upload verification documents & pay ₹365 to unlock this category"
              : "Manage crops, soil, and yields in one place"}
          </p>
        </div>

        {/* Stepper + Plant Growth Image Side-by-Side (NO vertical line between them) */}
        <div className="flex items-center justify-between gap-4 my-auto py-6 relative">
          {/* Vertical Stepper with single line titles only */}
          <div className="shrink-0 z-20 pr-2">
            <Stepper
              currentStep={isUnlockMode ? (currentStep === 4 ? 2 : 1) : currentStep}
              steps={activeSteps}
              orientation="vertical"
              onStepClick={(s) => handleStepClick(isUnlockMode ? (s === 1 ? 2 : 4) : s)}
            />
          </div>

          {/* Step Plant Growth Visual Aligned to Stepper with Dynamic Stepwise Scale - Pushed Right */}
          <div className="relative w-[210px] sm:w-[240px] xl:w-[270px] 2xl:w-[300px] h-[230px] sm:h-[260px] xl:h-[290px] 2xl:h-[320px] shrink-0 flex items-end justify-center pointer-events-none translate-x-3 sm:translate-x-6 xl:translate-x-8">
            <div
              key={currentStep}
              className={`relative w-full h-full transition-all duration-700 ease-out transform origin-bottom animate-in fade-in duration-300 ${stepVisualConfigs[currentStep]?.scale || "scale-100"
                }`}
            >
              <Image
                src={activeBackground}
                alt={stepVisualConfigs[currentStep]?.alt || "Growth Stage Visual"}
                fill
                sizes="(max-width: 640px) 210px, (max-width: 1280px) 240px, 300px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Form Controls on Shared Nature BG         */}
      {/* ======================================================== */}
      <div ref={rightPanelRef} className="flex-1 w-full lg:h-full lg:overflow-y-auto pt-5 lg:pt-8 pb-10 lg:pb-36 px-4 sm:px-10 xl:px-16 flex flex-col lg:justify-between relative bg-transparent scroll-smooth">
        {/* Top Floating Actions: Home, Logout & User Avatar */}
        <div className="hidden lg:flex items-center justify-end gap-2.5 pb-6">
          {isUnlockMode && (
            <Link
              href="/seller/products/add"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
            >
              <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="m10 5-7 7 7 7M3 12h18" />
              </svg>
              <span>Back to Add Product</span>
            </Link>
          )}
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-[#174B35] bg-white/90 hover:bg-white border border-gray-200/90 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs backdrop-blur-xs"
          >
            <svg className="w-3.5 h-3.5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* Form fits directly onto the natural cream background with leaf and tractor elements */}
        <main className="w-full max-w-2xl mx-auto space-y-6 lg:my-auto [&_label]:text-gray-800 [&_label]:font-bold [&_.text-red-500]:text-red-600">
          {isUnlockMode && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300/90 flex items-start gap-3 shadow-2xs animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                ₹
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#174B35]">
                  {existingPurchasedRoles.length > 0
                    ? `You have already purchased: ${existingPurchasedRoles.join(", ")}.`
                    : "You already have an active seller classification plan."}
                </p>
                <p className="text-xs sm:text-[13px] text-gray-700 leading-relaxed">
                  You are adding{" "}
                  <strong className="text-[#174B35] font-bold">
                    {selectedSellerTypes.length > 0 ? selectedSellerTypes.join(", ") : unlockCategoryParam}
                  </strong>{" "}
                  to list products under another classification. Upload its required documents below and complete the{" "}
                  <strong className="text-[#174B35] font-bold">
                    ₹{(Math.max(1, selectedSellerTypes.length) * 365).toLocaleString("en-IN")}
                  </strong>{" "}
                  classification fee in the Payment step.
                </p>
              </div>
            </div>
          )}

          {/* Error notification */}
          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs sm:text-sm font-semibold text-red-800">{formError}</p>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: DYNAMIC PROFILE DETAILS BY TYPE                 */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with User Icon Badge matching reference image */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174B35] tracking-tight">
                    {role === "buyer"
                      ? "Buyer profile"
                      : isUnlockMode
                        ? "Add seller classification"
                        : "Seller profile"}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
                    {isUnlockMode
                      ? "Confirm your new classification details before uploading its verification documents."
                      : "Choose your type, then enter your details."}
                  </p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ROLE: BUYER - 7 DYNAMIC BUYER TYPES                     */}
              {/* ======================================================== */}
              {role === "buyer" && (
                <div className="space-y-6">
                  {/* 5 Buyer Types Selection Pills / Cards */}
                  <div>
                    <label htmlFor="buyer-classification" className="block text-sm font-bold text-gray-800 mb-2.5">
                      Buyer Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="buyer-classification"
                      value={buyerType}
                      onChange={(event) => handleBuyerTypeChange(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-[#cbd8cb] bg-white px-3 text-base font-semibold text-[#174B35] focus:outline-2 focus:outline-[#246146] sm:hidden"
                    >
                      {BUYER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {BUYER_TYPES.map((type) => {
                        const isSelected = buyerType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleBuyerTypeChange(type)}
                            className={`p-3 rounded-2xl border text-center text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center min-h-[50px] ${isSelected
                              ? "bg-[#174B35] text-white border-[#174B35] shadow-sm shadow-emerald-900/20 scale-[1.02]"
                              : "bg-white hover:bg-emerald-50/50 text-gray-700 hover:text-[#174B35] border-gray-200/90 hover:border-[#174B35]/40 shadow-2xs"
                              }`}
                          >
                            <span className="leading-tight">{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-form 2: Business */}
                  {buyerType === "Business" && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Commercial Enterprise Buyer Form</span>
                      </div>
                      <FormInput
                        label="Business / Enterprise Name"
                        required
                        placeholder="e.g. Kongu Agri Traders"
                        value={buyerData.businessName}
                        onChange={(e) => setBuyerData((p) => ({ ...p, businessName: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="businessIsGst"
                                value="Yes"
                                checked={buyerData.businessIsGst === "Yes"}
                                onChange={() => setBuyerData((p) => ({ ...p, businessIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="businessIsGst"
                                value="No"
                                checked={buyerData.businessIsGst === "No"}
                                onChange={() => setBuyerData((p) => ({ ...p, businessIsGst: "No", businessGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {buyerData.businessIsGst === "Yes" && (
                          <FormInput
                            label="GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={buyerData.businessGstin}
                            onChange={(e) => setBuyerData((p) => ({ ...p, businessGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form 3: Manufacturer */}
                  {buyerType === "Manufacturer" && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Industrial Manufacturer Form</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Legal Company Name"
                          required
                          placeholder="e.g. Apex Bio-Industries Pvt Ltd"
                          value={buyerData.mfgCompanyName}
                          onChange={(e) => setBuyerData((p) => ({ ...p, mfgCompanyName: e.target.value }))}
                        />
                        <FormSelect
                          label="Manufacturing Category"
                          value={buyerData.mfgCategory}
                          onChange={(e) => setBuyerData((p) => ({ ...p, mfgCategory: e.target.value }))}
                          options={[
                            "Food & Beverage", "Textiles & Cotton", "Animal & Cattle Feed",
                            "Herbal & Ayurvedic Extracts", "Starch & Derivatives", "Bio-Energy"
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgIsGst"
                                value="Yes"
                                checked={buyerData.mfgIsGst === "Yes"}
                                onChange={() => setBuyerData((p) => ({ ...p, mfgIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgIsGst"
                                value="No"
                                checked={buyerData.mfgIsGst === "No"}
                                onChange={() => setBuyerData((p) => ({ ...p, mfgIsGst: "No", mfgGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {buyerData.mfgIsGst === "Yes" && (
                          <FormInput
                            label="Company GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={buyerData.mfgGstin}
                            onChange={(e) => setBuyerData((p) => ({ ...p, mfgGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form 4: Reseller */}
                  {buyerType === "Reseller" && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Mandi Reseller &amp; Retail Merchant Form</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Shop / Mandi Stall Name"
                          required
                          placeholder="e.g. Madurai Vegetable Mandi Stall No. 24"
                          value={buyerData.resellerShopName}
                          onChange={(e) => setBuyerData((p) => ({ ...p, resellerShopName: e.target.value }))}
                        />
                        <FormSelect
                          label="Reseller Type"
                          value={buyerData.resellerType}
                          onChange={(e) => setBuyerData((p) => ({ ...p, resellerType: e.target.value }))}
                          options={["Mandi Wholesale Commission Agent", "Retail Grocery / Supermarket", "Vegetable Vendor Group", "Mobile Delivery Van"]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sub-form 7: Other */}
                  {buyerType === "Other" && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Custom Institution / Buyer Form</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Organization / Applicant Name"
                          required
                          placeholder="e.g. Sri Krishna Educational Trust Hostel"
                          value={buyerData.otherOrgName}
                          onChange={(e) => setBuyerData((p) => ({ ...p, otherOrgName: e.target.value }))}
                        />
                        <FormInput
                          label="Applicant Category / Sector"
                          placeholder="e.g. Hostel, Temple Trust, NGO, Exporter"
                          value={buyerData.otherCategory}
                          onChange={(e) => setBuyerData((p) => ({ ...p, otherCategory: e.target.value }))}
                        />
                      </div>
                      <FormInput
                        label="Purpose of Agricultural Purchase"
                        placeholder="e.g. Daily meals procurement for 500 hostel students"
                        value={buyerData.otherPurpose}
                        onChange={(e) => setBuyerData((p) => ({ ...p, otherPurpose: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Sub-form: Dynamic Custom Category Added via Admin Portal */}
                  {!BUYER_TYPES.includes(buyerType) && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                          <span>{buyerType} Procurement Form</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-[#E8F0E3] px-2 py-0.5 rounded-md border border-[#729B59]/40">
                          Admin Synced Category
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Business / Enterprise Name"
                          required
                          placeholder={`e.g. Prime ${buyerType} Enterprises`}
                          value={buyerData.businessName}
                          onChange={(e) => setBuyerData((p) => ({ ...p, businessName: e.target.value }))}
                        />
                        <FormInput
                          label="Designation / Role"
                          placeholder="e.g. Managing Partner / Procurement Lead"
                          value={buyerData.businessDesignation}
                          onChange={(e) => setBuyerData((p) => ({ ...p, businessDesignation: e.target.value }))}
                        />
                      </div>

                      {/* Dynamic subcategory pills if configured by Admin */}
                      {selectedBuyerCategoryObj?.subcategories?.length > 0 && (
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Commodities &amp; Products of Interest:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedBuyerCategoryObj.subcategories.map((sub) => {
                              const isChecked = buyerData.businessCommodities?.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => {
                                    setBuyerData((prev) => {
                                      const current = prev.businessCommodities || [];
                                      const next = current.includes(sub)
                                        ? current.filter((c) => c !== sub)
                                        : [...current, sub];
                                      return { ...prev, businessCommodities: next };
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isChecked
                                      ? "bg-[#174B35] text-white border-[#174B35] shadow-xs"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-[#174B35]/40"
                                    }`}
                                >
                                  {isChecked && "✓ "}
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="customBuyerIsGst"
                                value="Yes"
                                checked={buyerData.businessIsGst === "Yes"}
                                onChange={() => setBuyerData((p) => ({ ...p, businessIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="customBuyerIsGst"
                                value="No"
                                checked={buyerData.businessIsGst === "No"}
                                onChange={() => setBuyerData((p) => ({ ...p, businessIsGst: "No", businessGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {buyerData.businessIsGst === "Yes" && (
                          <FormInput
                            label="GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={buyerData.businessGstin}
                            onChange={(e) => setBuyerData((p) => ({ ...p, businessGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Common Location Details for Buyer */}
                  <div className="pt-4 border-t border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-[#174B35]">Location</h3>
                    <FormInput
                      label="Street Address"
                      placeholder="e.g. Shop No. 12, Main Bazaar Road, Near Bus Stand"
                      value={buyerData.address}
                      onChange={(e) => setBuyerData((p) => ({ ...p, address: e.target.value }))}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormSelect
                        label="District"
                        required
                        value={buyerData.district}
                        onChange={(e) => setBuyerData((p) => ({ ...p, district: e.target.value }))}
                        options={TAMIL_NADU_DISTRICTS}
                      />
                      <FormInput
                        label="City / Town"
                        placeholder="e.g. Pollachi"
                        value={buyerData.city}
                        onChange={(e) => setBuyerData((p) => ({ ...p, city: e.target.value }))}
                      />
                      <FormInput
                        label="PIN Code"
                        placeholder="e.g. 642001"
                        maxLength={6}
                        value={buyerData.pinCode}
                        onChange={(e) => setBuyerData((p) => ({ ...p, pinCode: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* ROLE: SELLER - 8 DYNAMIC SELLER TYPES                   */}
              {/* ======================================================== */}
              {role === "seller" && (
                <div className="space-y-6">
                  {/* 8 Seller Types Selection Pills / Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label htmlFor="seller-classification" className="block text-sm font-bold text-gray-800">
                          Seller Classification <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowMultiRoleModal(true)}
                          className="text-xs text-gray-500 hover:text-[#174B35] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Click to view multi-role pricing"
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-400 text-[10px] flex items-center justify-center font-bold text-gray-500 leading-none">i</span>
                          <span>You can select multiple roles that apply to you</span>
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {selectedSellerTypes.length} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {finalSellerTypes.map((type) => {
                        const isAlreadyPurchased = isUnlockMode && existingPurchasedRoles.includes(type);
                        const isSelected = selectedSellerTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleSellerTypeToggle(type)}
                            disabled={isAlreadyPurchased}
                            title={isAlreadyPurchased ? "Already active on your account" : undefined}
                            className={`p-3 rounded-2xl border text-center text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[50px] ${
                              isAlreadyPurchased
                                ? "bg-emerald-50/90 text-[#174B35] border-emerald-300 cursor-default opacity-90"
                                : isSelected
                                  ? "bg-[#174B35] text-white border-[#174B35] shadow-sm shadow-emerald-900/20 scale-[1.02] cursor-pointer"
                                  : "bg-white hover:bg-emerald-50/50 text-gray-700 hover:text-[#174B35] border-gray-200/90 hover:border-[#174B35]/40 shadow-2xs cursor-pointer"
                            }`}
                          >
                            <span className="leading-tight">{type}</span>
                            {isAlreadyPurchased && (
                              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-[#174B35]/10 text-[#174B35]">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-form 1: Farmer */}
                  {hasSellerRole("Farmer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Direct Farmer &amp; Cultivator Form</span>
                      </div>

                      <FormInput
                        label="Farm Name"
                        required
                        placeholder="e.g. Sri Murugan Thottam"
                        value={sellerData.farmerFarmName}
                        onChange={(e) => setSellerData((p) => ({ ...p, farmerFarmName: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Sub-form 2: Agricultural Producer (FPO / Society) */}
                  {hasSellerRole("Agricultural Producer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>FPO &amp; Agricultural Cooperative Form</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="FPO / Society Legal Name"
                          required
                          placeholder="e.g. Kongu Uzhavar Producer Co Ltd"
                          value={sellerData.fpoName}
                          onChange={(e) => setSellerData((p) => ({ ...p, fpoName: e.target.value }))}
                        />
                        <FormSelect
                          label="Organization Structure"
                          value={sellerData.fpoStructure}
                          onChange={(e) => setSellerData((p) => ({ ...p, fpoStructure: e.target.value }))}
                          options={["Farmer Producer Company (FPC)", "Registered Cooperative Society", "Joint Liability Group (JLG)", "Self Help Group (SHG)"]}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Do you have Registration Number?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="fpoIsRegistered"
                                value="Yes"
                                checked={sellerData.fpoIsRegistered === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, fpoIsRegistered: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="fpoIsRegistered"
                                value="No"
                                checked={sellerData.fpoIsRegistered === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, fpoIsRegistered: "No", fpoRegNumber: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.fpoIsRegistered === "Yes" && (
                          <FormInput
                            label="Registration No (CIN / Society Reg)"
                            required
                            placeholder="e.g. U01409TZ2021PTC028491"
                            value={sellerData.fpoRegNumber}
                            onChange={(e) => setSellerData((p) => ({ ...p, fpoRegNumber: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form 3: Organic Producer */}
                  {hasSellerRole("Organic Producer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Organic Certified Producer Form</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Organic Farm / Brand Name"
                          required
                          placeholder="e.g. Pristine Nature Organic Farm"
                          value={sellerData.organicFarmName}
                          onChange={(e) => setSellerData((p) => ({ ...p, organicFarmName: e.target.value }))}
                        />
                        <FormSelect
                          label="Certification Status"
                          value={sellerData.organicCertStatus}
                          onChange={(e) => setSellerData((p) => ({ ...p, organicCertStatus: e.target.value }))}
                          options={["Certified Organic (NPOP)", "In-Conversion (C1 / C2)", "PGS-India Green / Organic", "Natural Farming (Uncertified)"]}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Do you have License Number?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="organicHasLicense"
                                value="Yes"
                                checked={sellerData.organicHasLicense === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, organicHasLicense: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="organicHasLicense"
                                value="No"
                                checked={sellerData.organicHasLicense === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, organicHasLicense: "No", organicScopeNumber: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.organicHasLicense === "Yes" && (
                          <FormInput
                            label="Certificate Scope / License No"
                            placeholder="e.g. NPOP/NAB/0017/ORG-2024"
                            value={sellerData.organicScopeNumber}
                            onChange={(e) => setSellerData((p) => ({ ...p, organicScopeNumber: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form 4: Raw-Material Provider */}
                  {hasSellerRole("Raw-Material Provider") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Bulk Raw-Material Provider Form</span>
                      </div>

                      <FormInput
                        label="Business / Provider Name"
                        required
                        placeholder="e.g. Cauvery Raw Agri Commodities"
                        value={sellerData.rawProviderName}
                        onChange={(e) => setSellerData((p) => ({ ...p, rawProviderName: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Sub-form 5: Ingredient Producer */}
                  {hasSellerRole("Ingredient Producer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Agri-Ingredient Producer Form</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <FormInput
                          label="Enterprise Name"
                          required
                          placeholder="e.g. Kongu Traditional Chekku Oils"
                          value={sellerData.ingProducerName}
                          onChange={(e) => setSellerData((p) => ({ ...p, ingProducerName: e.target.value }))}
                        />

                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Do you have FSSAI Food License?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="ingHasFssai"
                                value="Yes"
                                checked={sellerData.ingHasFssai === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, ingHasFssai: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="ingHasFssai"
                                value="No"
                                checked={sellerData.ingHasFssai === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, ingHasFssai: "No", ingFssaiNumber: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {sellerData.ingHasFssai === "Yes" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="FSSAI Food License (14 Digits)"
                            required
                            maxLength={14}
                            placeholder="e.g. 10020042000789"
                            value={sellerData.ingFssaiNumber}
                            onChange={(e) => setSellerData((p) => ({ ...p, ingFssaiNumber: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-form 6: Manufacturer */}
                  {hasSellerRole("Manufacturer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Industrial Agro-Manufacturer Form</span>
                      </div>

                      <FormInput
                        label="Company Name"
                        required
                        placeholder="e.g. Salem Agro Refineries Ltd"
                        value={sellerData.mfgSellerName}
                        onChange={(e) => setSellerData((p) => ({ ...p, mfgSellerName: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Do you have FSSAI Food License?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgHasFssai"
                                value="Yes"
                                checked={sellerData.mfgHasFssai === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, mfgHasFssai: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgHasFssai"
                                value="No"
                                checked={sellerData.mfgHasFssai === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, mfgHasFssai: "No", mfgFssaiNumber: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.mfgHasFssai === "Yes" && (
                          <FormInput
                            label="FSSAI Food License (14 Digits)"
                            required
                            maxLength={14}
                            placeholder="e.g. 10020042000789"
                            value={sellerData.mfgFssaiNumber}
                            onChange={(e) => setSellerData((p) => ({ ...p, mfgFssaiNumber: e.target.value }))}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgIsGst"
                                value="Yes"
                                checked={sellerData.mfgIsGst === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, mfgIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="mfgIsGst"
                                value="No"
                                checked={sellerData.mfgIsGst === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, mfgIsGst: "No", mfgGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.mfgIsGst === "Yes" && (
                          <FormInput
                            label="GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={sellerData.mfgGstin}
                            onChange={(e) => setSellerData((p) => ({ ...p, mfgGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form 7: Value-Added Manufacturer */}
                  {hasSellerRole("Value-Added Manufacturer") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Value-Added Food Products Form</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <FormInput
                          label="Brand / Enterprise Name"
                          required
                          placeholder="e.g. Madurai Traditional Pickles & Snacks"
                          value={sellerData.vaBrandName}
                          onChange={(e) => setSellerData((p) => ({ ...p, vaBrandName: e.target.value }))}
                        />

                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Do you have FSSAI Food License?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="vaHasFssai"
                                value="Yes"
                                checked={sellerData.vaHasFssai === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, vaHasFssai: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="vaHasFssai"
                                value="No"
                                checked={sellerData.vaHasFssai === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, vaHasFssai: "No", vaFssaiNumber: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {sellerData.vaHasFssai === "Yes" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="FSSAI License (14 Digits)"
                            required
                            maxLength={14}
                            placeholder="e.g. 10020042000999"
                            value={sellerData.vaFssaiNumber}
                            onChange={(e) => setSellerData((p) => ({ ...p, vaFssaiNumber: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-form 8: Other */}
                  {hasSellerRole("Other") && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                        <span>Specialized Farm Enterprise Form</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Enterprise Name"
                          required
                          placeholder="e.g. Thanjavur Coconut Saplings Nursery"
                          value={sellerData.otherSellerName}
                          onChange={(e) => setSellerData((p) => ({ ...p, otherSellerName: e.target.value }))}
                        />
                        <FormInput
                          label="Enterprise Activity"
                          placeholder="e.g. Grafted Fruit Saplings, Honey Apiculture, Mushrooms"
                          value={sellerData.otherActivity}
                          onChange={(e) => setSellerData((p) => ({ ...p, otherActivity: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="otherIsGst"
                                value="Yes"
                                checked={sellerData.otherIsGst === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, otherIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="otherIsGst"
                                value="No"
                                checked={sellerData.otherIsGst === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, otherIsGst: "No", otherGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.otherIsGst === "Yes" && (
                          <FormInput
                            label="GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={sellerData.otherGstin}
                            onChange={(e) => setSellerData((p) => ({ ...p, otherGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-form: Dynamic Custom Category Added via Admin Portal */}
                  {selectedCustomSellerTypes.length > 0 && (
                    <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#174B35] uppercase tracking-wider">
                          <span>{activeCustomSellerType} Specialized Form</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-[#E8F0E3] px-2 py-0.5 rounded-md border border-[#729B59]/40">
                          Admin Synced Category
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Farm / Enterprise Legal Name"
                          required
                          placeholder={`e.g. Kongu ${activeCustomSellerType} Collective`}
                          value={sellerData.otherSellerName}
                          onChange={(e) => setSellerData((p) => ({ ...p, otherSellerName: e.target.value }))}
                        />
                        <FormInput
                          label="Primary Agricultural Activity"
                          placeholder="e.g. Cultivation, processing & direct producer supply"
                          value={sellerData.otherActivity}
                          onChange={(e) => setSellerData((p) => ({ ...p, otherActivity: e.target.value }))}
                        />
                      </div>

                      {/* Dynamic subcategory pills if configured by Admin */}
                      {selectedSellerCategoryObj?.subcategories?.length > 0 && (
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Available Crops / Produce / Products:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedSellerCategoryObj.subcategories.map((sub) => {
                              const isChecked = sellerData.farmerCrops?.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => {
                                    setSellerData((prev) => {
                                      const current = prev.farmerCrops || [];
                                      const next = current.includes(sub)
                                        ? current.filter((c) => c !== sub)
                                        : [...current, sub];
                                      return { ...prev, farmerCrops: next };
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isChecked
                                      ? "bg-[#174B35] text-white border-[#174B35] shadow-xs"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-[#174B35]/40"
                                    }`}
                                >
                                  {isChecked && "✓ "}
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2">
                            Are you GST Registered?
                          </label>
                          <div className="flex items-center gap-6 h-11">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="customSellerIsGst"
                                value="Yes"
                                checked={sellerData.otherIsGst === "Yes"}
                                onChange={() => setSellerData((p) => ({ ...p, otherIsGst: "Yes" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="radio"
                                name="customSellerIsGst"
                                value="No"
                                checked={sellerData.otherIsGst === "No"}
                                onChange={() => setSellerData((p) => ({ ...p, otherIsGst: "No", otherGstin: "" }))}
                                className="w-4 h-4 text-[#174B35] focus:ring-[#174B35] accent-[#174B35] cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-gray-800">No</span>
                            </label>
                          </div>
                        </div>

                        {sellerData.otherIsGst === "Yes" && (
                          <FormInput
                            label="GSTIN (15 Digits)"
                            required
                            maxLength={15}
                            placeholder="e.g. 33AAAAA0000A1Z5"
                            value={sellerData.otherGstin}
                            onChange={(e) => setSellerData((p) => ({ ...p, otherGstin: e.target.value.toUpperCase() }))}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Common Location Details for Seller */}
                  <div className="pt-4 border-t border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-[#174B35]">Location</h3>
                    <FormInput
                      label="Street Address"
                      placeholder="e.g. Survey No. 42/B, Thottam Road, Post Box 12"
                      value={resolvedSellerData.farmAddress}
                      onChange={(e) => handleSellerLocationChange("farmAddress", e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormSelect
                        label="District"
                        required
                        value={resolvedSellerData.district}
                        onChange={(e) => handleSellerLocationChange("district", e.target.value)}
                        options={TAMIL_NADU_DISTRICTS}
                      />
                      <FormInput
                        label="Village / Taluk"
                        placeholder="e.g. Anaimalai"
                        value={resolvedSellerData.village}
                        onChange={(e) => handleSellerLocationChange("village", e.target.value)}
                      />
                      <FormInput
                        label="PIN Code"
                        placeholder="e.g. 642001"
                        maxLength={6}
                        value={resolvedSellerData.pinCode}
                        onChange={(e) => handleSellerLocationChange("pinCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-col items-center gap-2 border-t border-gray-200/80 pt-4 sm:flex-row-reverse sm:justify-between sm:gap-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#174B35] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#103A29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174B35] sm:w-auto sm:px-6"
                >
                  <span className="sm:hidden">Continue to documents</span>
                  <span className="hidden sm:inline">Continue to Document Upload</span>
                  <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <Link
                  href={isUnlockMode ? "/seller/products/add" : "/get-started"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#174B35] transition-colors hover:bg-[#e8efdf] focus-visible:outline-2 focus-visible:outline-[#174B35] sm:border sm:border-gray-200 sm:bg-white"
                >
                  <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10 5-7 7 7 7M3 12h18" />
                  </svg>
                  {isUnlockMode ? "Back to Add Product" : "Change Role"}
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: DYNAMIC DOCUMENT VERIFICATION                    */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Document Badge */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174B35] tracking-tight">
                    {role === "buyer" ? "Verification Documents (Optional)" : "Required Verification Documents"}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
                    {role === "buyer"
                      ? "Upload identity or business verification documents (optional). Allowed formats: PDF, JPG, PNG up to 5MB."
                      : <>Upload verification proofs required for your selected classification (<strong className="text-gray-900 font-bold">{selectedSellerTypes.join(", ")}</strong>). Allowed formats: PDF, JPG, PNG up to 5MB.</>}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Individual Buyer: Aadhaar Card & PAN Card */}
                {role === "buyer" && buyerType === "Individual" && (
                  <>
                    <DocumentUploader
                      documentType="AADHAAR_CARD"
                      title="Aadhaar Card"
                      description="Upload your Aadhaar Card (Front & Back) or valid Government ID proof."
                      required={false}
                      uploadedDoc={uploadedDocs["AADHAAR_CARD"]}
                      onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, AADHAAR_CARD: doc }))}
                      onRemove={() =>
                        setUploadedDocs((prev) => {
                          const next = { ...prev };
                          delete next.AADHAAR_CARD;
                          return next;
                        })
                      }
                    />
                    <DocumentUploader
                      documentType="PAN_CARD"
                      title="PAN Card"
                      description="Upload your PAN Card proof document."
                      required={false}
                      uploadedDoc={uploadedDocs["PAN_CARD"]}
                      onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, PAN_CARD: doc }))}
                      onRemove={() =>
                        setUploadedDocs((prev) => {
                          const next = { ...prev };
                          delete next.PAN_CARD;
                          return next;
                        })
                      }
                    />
                  </>
                )}

                {/* Common: PAN / Government ID for other buyers or Other/Custom sellers */}
                {((role === "buyer" && buyerType !== "Individual") || needIdProof) && (
                  <DocumentUploader
                    documentType="ID_PROOF"
                    title={
                      role === "seller" && hasSellerRole("Other")
                        ? "PAN Card / Government Identity Proof"
                        : "Identity Proof (Aadhaar Card / Voter ID / PAN)"
                    }
                    description={
                      role === "seller" && hasSellerRole("Other")
                        ? "Upload valid Business or Proprietor PAN Card proof."
                        : "Government identity proof of the account owner or registered business."
                    }
                    required={role !== "buyer"}
                    uploadedDoc={uploadedDocs["ID_PROOF"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, ID_PROOF: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.ID_PROOF;
                        return next;
                      })
                    }
                  />
                )}

                {/* Seller: Bank Account Proof for custom admin categories */}
                {needBankPassbook && (
                  <DocumentUploader
                    documentType="BANK_PASSBOOK"
                    title="Bank Account Passbook / Cancelled Cheque"
                    description="Required for direct farm-gate payments from buyers with 0% platform commission."
                    required
                    uploadedDoc={uploadedDocs["BANK_PASSBOOK"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, BANK_PASSBOOK: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.BANK_PASSBOOK;
                        return next;
                      })
                    }
                  />
                )}

                {/* Farmer: Land Records (Patta / Chitta) */}
                {needLandProof && (
                  <DocumentUploader
                    documentType="LAND_PROOF"
                    title="Patta / Chitta Document"
                    description="Upload your official Patta / Chitta document for farm cultivation verification."
                    required
                    uploadedDoc={uploadedDocs["LAND_PROOF"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, LAND_PROOF: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.LAND_PROOF;
                        return next;
                      })
                    }
                  />
                )}

                {/* Organic Producer: Organic Certificate (NPOP) */}
                {needOrganicCert && (
                  <DocumentUploader
                    documentType="ORGANIC_CERTIFICATE"
                    title="Organic Certification Document (NPOP / PGS-India)"
                    description="Upload valid NPOP scope certificate from accredited organic certification agency."
                    required
                    uploadedDoc={uploadedDocs["ORGANIC_CERTIFICATE"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, ORGANIC_CERTIFICATE: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.ORGANIC_CERTIFICATE;
                        return next;
                      })
                    }
                  />
                )}

                {/* Agricultural Producer: FPO / Society Reg */}
                {needFpoCert && (
                  <DocumentUploader
                    documentType="FPO_CERTIFICATE"
                    title="FPO / Cooperative Registration Certificate"
                    description="Certificate of Incorporation or Society Registration proof."
                    required
                    uploadedDoc={uploadedDocs["FPO_CERTIFICATE"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, FPO_CERTIFICATE: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.FPO_CERTIFICATE;
                        return next;
                      })
                    }
                  />
                )}

                {/* FSSAI Certificate */}
                {needFssaiCert && (
                  <DocumentUploader
                    documentType="FSSAI_LICENSE"
                    title="FSSAI Food Safety License Certificate"
                    description="Mandatory state or central FSSAI registration certificate for food products."
                    required
                    uploadedDoc={uploadedDocs["FSSAI_LICENSE"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, FSSAI_LICENSE: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.FSSAI_LICENSE;
                        return next;
                      })
                    }
                  />
                )}

                {/* GST Certificate */}
                {(role === "buyer" ? isGstProvided : needGstCert) && (
                  <DocumentUploader
                    documentType="GST_CERTIFICATE"
                    title="GST Registration Certificate (Form REG-06)"
                    description="Upload valid GST registration certificate for your business."
                    required={role !== "buyer"}
                    uploadedDoc={uploadedDocs["GST_CERTIFICATE"]}
                    onUploadSuccess={(doc) => setUploadedDocs((prev) => ({ ...prev, GST_CERTIFICATE: doc }))}
                    onRemove={() =>
                      setUploadedDocs((prev) => {
                        const next = { ...prev };
                        delete next.GST_CERTIFICATE;
                        return next;
                      })
                    }
                  />
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col items-center gap-2 border-t border-gray-200/80 pt-4 sm:flex-row-reverse sm:justify-between sm:gap-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleNextFromStep2}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#174B35] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#103A29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174B35] sm:w-auto sm:px-6"
                >
                  <span className="sm:hidden">{isUnlockMode ? "Continue to payment" : "Continue to review"}</span>
                  <span className="hidden sm:inline">{isUnlockMode ? "Continue to Payment" : "Continue to Review & Submit"}</span>
                  <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                {isUnlockMode ? (
                  <Link
                    href="/seller/products/add"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#174B35] transition-colors hover:bg-[#e8efdf] focus-visible:outline-2 focus-visible:outline-[#174B35] sm:border sm:border-gray-200 sm:bg-white"
                  >
                    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10 5-7 7 7 7M3 12h18" />
                    </svg>
                    <span>Back to Add Product</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStepClick(1)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#174B35] transition-colors hover:bg-[#e8efdf] focus-visible:outline-2 focus-visible:outline-[#174B35] sm:border sm:border-gray-200 sm:bg-white"
                  >
                    <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10 5-7 7 7 7M3 12h18" />
                    </svg>
                    <span className="sm:hidden">Back to profile</span>
                    <span className="hidden sm:inline">Back to Profile Details</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: REVIEW & SUBMIT                                  */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Profile Icon Badge */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#174B35] tracking-tight">
                    Review &amp; Finalize Registration
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">
                    Verify your tailored profile details before activating direct trade on Ulavan Santhai.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Account Credentials Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      Account credentials
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      From registration
                    </span>
                  </div>

                  {/* Avatar & User Name */}
                  <div suppressHydrationWarning className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#174B35] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {userAuth?.name
                        ? userAuth.name
                          .split(" ")
                          .filter(Boolean)
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                        : "US"}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight">
                        {userAuth?.name || "Registered Member"}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-normal">
                        Full Name / Username
                      </p>
                    </div>
                  </div>

                  {/* Email & Mobile Sub-cards */}
                  <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Email */}
                    <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-gray-400 block font-normal">Email Address</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                          {userAuth?.email || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-gray-400 block font-normal">Mobile Number</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                          {userAuth?.mobile ? `+91 ${userAuth.mobile}` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classification Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      {role === "buyer" ? "Buyer classification" : "Seller classification"}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {role === "buyer" ? buyerType : selectedSellerTypes.join(", ")}
                    </span>
                  </div>

                  {role === "buyer" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {buyerType === "Individual" && (
                        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Account Category</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              Individual Direct Consumer
                            </span>
                          </div>
                        </div>
                      )}
                      {buyerType === "Business" && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Enterprise Name</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {buyerData.businessName}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">GST Status</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {buyerData.businessIsGst === "Yes" ? buyerData.businessGstin : "Unregistered"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {buyerType === "Manufacturer" && (
                        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Company &amp; Sector</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              {buyerData.mfgCompanyName} • {buyerData.mfgCategory}
                            </span>
                          </div>
                        </div>
                      )}
                      {buyerType === "Reseller" && (
                        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Mandi Shop / Stall</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              {buyerData.resellerShopName} • {buyerData.resellerType}
                            </span>
                          </div>
                        </div>
                      )}
                      {buyerType === "Other" && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Organization</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {buyerData.otherOrgName} • {buyerData.otherCategory}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Buying Purpose</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {buyerData.otherPurpose}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Operating District Card */}
                      <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-gray-400 block font-normal">Operating District</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                            {buyerData.district}, Tamil Nadu
                          </span>
                        </div>
                      </div>

                      {buyerData.address && (
                        <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Street Address</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              {buyerData.address}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {hasSellerRole("Farmer") && (
                        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs sm:col-span-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Farm Name</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              {sellerData.farmerFarmName}
                            </span>
                          </div>
                        </div>
                      )}
                      {hasSellerRole("Agricultural Producer") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">FPO / Cooperative</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.fpoName} ({sellerData.fpoStructure})
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Registration Number</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.fpoIsRegistered === "Yes" && sellerData.fpoRegNumber
                                  ? sellerData.fpoRegNumber
                                  : "Not Registered"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {hasSellerRole("Organic Producer") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19V6m0 0l-4 4m4-4l4 4M5 21h14" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Organic Farm</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.organicFarmName} • {sellerData.organicCertStatus}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">License / Scope Number</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.organicHasLicense === "Yes" && sellerData.organicScopeNumber
                                  ? sellerData.organicScopeNumber
                                  : "No License"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {hasSellerRole("Raw-Material Provider") && (
                        <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs sm:col-span-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-400 block font-normal">Business / Provider Name</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                              {sellerData.rawProviderName}
                            </span>
                          </div>
                        </div>
                      )}
                      {hasSellerRole("Ingredient Producer") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Enterprise Name</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.ingProducerName}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">FSSAI License</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.ingHasFssai === "Yes" && sellerData.ingFssaiNumber
                                  ? sellerData.ingFssaiNumber
                                  : "No FSSAI License"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {hasSellerRole("Manufacturer") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Company Name</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.mfgSellerName}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">FSSAI &amp; GSTIN</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.mfgHasFssai === "Yes" && sellerData.mfgFssaiNumber ? `FSSAI: ${sellerData.mfgFssaiNumber}` : "No FSSAI"}
                                {" • "}
                                {sellerData.mfgIsGst === "Yes" && sellerData.mfgGstin ? `GST: ${sellerData.mfgGstin}` : "No GST"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {hasSellerRole("Value-Added Manufacturer") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Brand Name</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.vaBrandName}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">FSSAI License</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.vaHasFssai === "Yes" && sellerData.vaFssaiNumber
                                  ? sellerData.vaFssaiNumber
                                  : "No FSSAI License"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {hasSellerRole("Other") && (
                        <>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">Enterprise Name</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.otherSellerName || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-gray-400 block font-normal">GSTIN & Activity</span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                                {sellerData.otherIsGst === "Yes" && sellerData.otherGstin ? sellerData.otherGstin : "Not GST Registered"}
                                {sellerData.otherActivity ? ` • ${sellerData.otherActivity}` : ""}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-3 shadow-2xs sm:col-span-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-gray-400 block font-normal">Farm / Unit Location</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate block">
                            {resolvedSellerData.village}, {resolvedSellerData.district}, Tamil Nadu
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      Verification documents uploaded
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {Object.keys(uploadedDocs).length} file{Object.keys(uploadedDocs).length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {Object.entries(uploadedDocs).map(([key, doc]) => (
                      <div
                        key={key}
                        className="bg-[#EDF7EE] border border-[#CDE5D0] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-2xs shrink-0">
                            <svg className="w-5 h-5 text-[#174B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                              {doc.fileName || key}
                            </p>
                            <p className="text-[11px] text-[#174B35] font-medium mt-0.5">
                              Uploaded
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <div className="w-6 h-6 rounded-full bg-[#174B35] text-white flex items-center justify-center shrink-0 shadow-xs" title="Document verified">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                    {Object.keys(uploadedDocs).length === 0 && (
                      <p className="text-xs text-gray-400 italic py-2">
                        No verification documents attached
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="pt-2">
                <label
                  className={`flex items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border transition-colors cursor-pointer select-none ${!termsAgreed && formError
                      ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                      : "border-gray-200/80 hover:border-emerald-300"
                    } shadow-2xs`}
                >
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => {
                      setTermsAgreed(e.target.checked);
                      if (formError) setFormError("");
                    }}
                    className="mt-0.5 sm:mt-0 h-4 w-4 text-[#174B35] focus:ring-[#174B35] border-gray-300 rounded cursor-pointer accent-[#174B35] shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-900 font-medium leading-normal">
                    I certify that the information entered above is genuine and accurate. I agree to trade on Ulavan Santhai following direct agricultural trade practices with 0% middleman margin.
                  </span>
                </label>
                {!termsAgreed && formError && (
                  <p className="text-xs font-semibold text-red-600 mt-1.5 ml-1 animate-in fade-in">
                    ⚠ {formError}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col items-center gap-2 border-t border-gray-200/80 pt-4 sm:flex-row-reverse sm:justify-between sm:gap-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#174B35] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#103A29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174B35] sm:w-auto sm:px-6"
                >
                  <span>Proceed to Payment</span>
                  <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepClick(2)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#174B35] transition-colors hover:bg-[#e8efdf] focus-visible:outline-2 focus-visible:outline-[#174B35] sm:border sm:border-gray-200 sm:bg-white"
                >
                  <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10 5-7 7 7 7M3 12h18" />
                  </svg>
                  <span>Back to Documents</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#174B35] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {previewDoc.fileName || "Document Preview"}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Verification Document
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewDoc.url && (
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-[#174B35] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open in Tab</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body / Preview */}
            <div className="flex-1 overflow-auto py-4 flex items-center justify-center bg-gray-50/70 rounded-2xl mt-4 min-h-[250px]">
              {previewDoc.url ? (
                previewDoc.fileName?.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.fileName}
                    className="w-full h-[55vh] rounded-xl border border-gray-200"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.fileName || "Document Preview"}
                    className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-xs"
                  />
                )
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#174B35] flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{previewDoc.fileName}</p>
                  <p className="text-xs text-gray-500">File uploaded and verified successfully</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-[#174B35] text-white text-xs font-bold hover:bg-[#103A29] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MULTIPLE ROLES SUPPORTED MODAL (SELLER CLASSIFICATION)  */}
      {/* ======================================================== */}
      {showMultiRoleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowMultiRoleModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ₹ Rupee Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#174B35]">
              <span className="text-2xl font-black leading-none">₹</span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
              Multiple Roles Supported
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto mb-5">
              You can select one or more Seller Classifications that match your business.
            </p>

            {/* Dynamic Calculation Box */}
            <div className="bg-[#EDF7EE] border border-[#D3E8D6] rounded-2xl p-4 sm:p-5 mb-6 text-center">
              <div className="text-sm sm:text-base font-extrabold text-gray-900">
                ₹365 per role / month
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                {selectedSellerTypes.length} {selectedSellerTypes.length === 1 ? "role" : "roles"} selected • Total: ₹{(selectedSellerTypes.length * 365).toLocaleString("en-IN")} / month
              </div>
            </div>

            {/* Got it, Continue Button */}
            <button
              type="button"
              onClick={() => setShowMultiRoleModal(false)}
              className="w-full py-3.5 px-6 rounded-xl bg-[#174B35] hover:bg-[#113B29] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Got it, Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OnboardingContentWrapper() {
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "buyer").toLowerCase();
  const modeParam = (searchParams.get("mode") || "").toLowerCase();
  const categoryParam = searchParams.get("category") || "";

  return (
    <OnboardingContent
      key={`${roleParam}-${modeParam}-${categoryParam}`}
      initialRole={roleParam}
      initialMode={modeParam}
      initialUnlockCategory={categoryParam}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F5EB] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#174B35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContentWrapper />
    </Suspense>
  );
}
