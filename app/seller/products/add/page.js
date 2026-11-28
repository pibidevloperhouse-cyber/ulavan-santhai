"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import BasicInfoSection, {
  PRODUCT_CATEGORIES,
  CATEGORY_TO_STORAGE_CODES,
} from "@/components/seller/products/add/BasicInfoSection";
import ProductImagesSection from "@/components/seller/products/add/ProductImagesSection";
import CertificationsSection from "@/components/seller/products/add/CertificationsSection";
import SellerSelect from "@/components/seller/ui/SellerSelect";
import {
  createSellerProduct,
  updateSellerProduct,
  getSellerProductById,
} from "@/services/productApi";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getSellerProfile,
  getSellerUnlockedCategories,
} from "@/services/sellerApi";
import { fetchCurrentUserProfile } from "@/services/paymentApi";
import { getSellerCategories } from "@/services/categoryStorage";

const WIZARD_STEPS = [
  { id: 1, title: "Product information" },
  { id: 2, title: "Listing & category fields" },
  { id: 3, title: "Certifications" },
  { id: 4, title: "Review & submit" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Select availability" },
  { value: "Available", label: "Available" },
  { value: "Limited availability", label: "Limited availability" },
  { value: "Temporarily unavailable", label: "Temporarily unavailable" },
  { value: "Out of stock", label: "Out of stock" },
  { value: "Discontinued", label: "Discontinued" },
];

const MOQ_UNIT_OPTIONS = [
  "kg",
  "quintal",
  "tonne",
  "bag (25kg)",
  "bag (50kg)",
  "litre",
  "piece",
];

// Exact category -> fields mapping matching the HTML specification
const CATEGORY_FIELDS_MAP = {
  "Agricultural Products": ["variety", "qualityGrade", "size"],
  "Organic Products": [
    "variety",
    "qualityGrade",
    "size",
    "processingDetails",
    "processingLocation",
    "manufacturingDetails",
    "manufacturingLocation",
  ],
  "Agricultural Raw Materials": [
    "variety",
    "qualityGrade",
    "size",
    "processingDetails",
    "processingLocation",
  ],
  "Agriculture-Derived Ingredients": [
    "qualityGrade",
    "processingDetails",
    "processingLocation",
    "manufacturingDetails",
    "manufacturingLocation",
  ],
  "Value-Added Products": [
    "processingDetails",
    "processingLocation",
    "manufacturingDetails",
    "manufacturingLocation",
  ],
};

function specsArrayToText(specs) {
  if (!Array.isArray(specs) || specs.length === 0) return "";
  return specs
    .filter((s) => s?.name?.trim() || s?.value?.trim())
    .map((s) =>
      s.name && s.name.trim().toLowerCase() !== "specifications"
        ? `${s.name}: ${s.value || ""}`
        : s.value || ""
    )
    .filter(Boolean)
    .join("\n");
}

function AddProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const unlockedParam = searchParams.get("unlocked") || "";
  const isEditing = Boolean(editId);
  const sessionUser = useSessionUser();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Product Information & Images
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [hasClearedCategory, setHasClearedCategory] = useState(false);
  const [productSubcategory, setProductSubcategory] = useState("");
  const [sellerCategories, setSellerCategories] = useState(getSellerCategories);
  const [liveProfileUser, setLiveProfileUser] = useState(null);
  const [pendingUnlockCategory, setPendingUnlockCategory] = useState(null);
  const [productDescription, setProductDescription] = useState("");
  const [images, setImages] = useState([]);

  // Step 2: Common Listing Details & Category-Specific Fields
  const [productType, setProductType] = useState("");
  const [placeOfOrigin, setPlaceOfOrigin] = useState("");
  const [productionLocation, setProductionLocation] = useState("");
  const [moqQty, setMoqQty] = useState("");
  const [moqUnit, setMoqUnit] = useState("kg");
  const [availability, setAvailability] = useState("");
  const [specificationsText, setSpecificationsText] = useState("");
  const [packagingDetails, setPackagingDetails] = useState("");

  const [variety, setVariety] = useState("");
  const [qualityGrade, setQualityGrade] = useState("");
  const [size, setSize] = useState("");
  const [processingDetails, setProcessingDetails] = useState("");
  const [processingLocation, setProcessingLocation] = useState("");
  const [manufacturingDetails, setManufacturingDetails] = useState("");
  const [manufacturingLocation, setManufacturingLocation] = useState("");

  // Step 3: Certifications
  const [certifications, setCertifications] = useState([
    {
      id: "c1",
      name: "",
      number: "",
      authority: "",
      validFrom: "",
      validUntil: "",
      documentUploaded: false,
    },
  ]);

  const [stepError, setStepError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep subcategories & live seller profile synced
  useEffect(() => {
    const syncCategories = () => {
      setSellerCategories(getSellerCategories());
    };
    window.addEventListener("ulavan_categories_updated", syncCategories);
    window.addEventListener("storage", syncCategories);

    let isMounted = true;
    Promise.all([
      getSellerProfile().catch(() => null),
      fetchCurrentUserProfile().catch(() => null),
    ]).then(([sellerRes, userRes]) => {
      if (!isMounted) return;
      const sellerObj =
        sellerRes?.success && sellerRes.data
          ? sellerRes.data.seller || sellerRes.data.profile || sellerRes.data.user || sellerRes.data
          : null;
      const userObj = userRes?.success && userRes.user ? userRes.user : null;

      if (sellerObj || userObj) {
        setLiveProfileUser({
          ...(userObj || {}),
          ...(sellerObj || {}),
          sellerData: {
            ...(userObj?.sellerData || {}),
            ...(sellerObj?.sellerData || {}),
          },
        });
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener("ulavan_categories_updated", syncCategories);
      window.removeEventListener("storage", syncCategories);
    };
  }, []);

  const unlockedCategories = useMemo(() => {
    const mergedUser = liveProfileUser
      ? {
          ...liveProfileUser,
          ...sessionUser,
          subType: sessionUser?.subType || liveProfileUser.subType || "",
          sellerType: sessionUser?.sellerType || liveProfileUser.sellerType || "",
          sellerTypes:
            sessionUser?.sellerTypes?.length > 0
              ? sessionUser.sellerTypes
              : liveProfileUser.sellerTypes || null,
          unlockedCategories: Array.from(
            new Set([
              ...(sessionUser?.unlockedCategories || []),
              ...(liveProfileUser.unlockedCategories || []),
            ])
          ),
          sellerData: {
            ...(liveProfileUser.sellerData || {}),
            ...(sessionUser?.sellerData || {}),
          },
        }
      : sessionUser;

    const rawUnlocked = getSellerUnlockedCategories(mergedUser, sellerCategories);
    const rawSet = new Set(rawUnlocked);

    return PRODUCT_CATEGORIES.filter((prodCat) => {
      if (rawSet.has(prodCat)) return true;
      const mappedCodes = CATEGORY_TO_STORAGE_CODES[prodCat] || [];
      return mappedCodes.some((code) => rawSet.has(code));
    });
  }, [sessionUser, liveProfileUser, sellerCategories]);

  const mappedUnlockedParam = useMemo(() => {
    if (!unlockedParam) return "";
    if (PRODUCT_CATEGORIES.includes(unlockedParam)) return unlockedParam;
    return (
      PRODUCT_CATEGORIES.find((prodCat) =>
        (CATEGORY_TO_STORAGE_CODES[prodCat] || []).includes(unlockedParam)
      ) || ""
    );
  }, [unlockedParam]);

  const effectiveProductCategory =
    productCategory ||
    (!isEditing && !hasClearedCategory
      ? mappedUnlockedParam && unlockedCategories.includes(mappedUnlockedParam)
        ? mappedUnlockedParam
        : unlockedCategories.length === 1
        ? unlockedCategories[0]
        : ""
      : "");

  const categorySpecificFields = useMemo(
    () => CATEGORY_FIELDS_MAP[effectiveProductCategory] || [],
    [effectiveProductCategory]
  );

  const isOrganicCategory = effectiveProductCategory === "Organic Products";

  const handleProceedToUnlockSubscription = () => {
    if (!pendingUnlockCategory) return;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "ulavan_add_product_draft",
          JSON.stringify({
            productName,
            productSubcategory,
            productType,
            variety,
            qualityGrade,
            size,
            productDescription,
            placeOfOrigin,
            productionLocation,
            processingLocation,
            manufacturingLocation,
            moqQty,
            moqUnit,
            availability,
            processingDetails,
            manufacturingDetails,
            packagingDetails,
            specificationsText,
          })
        );
      } catch {
        // ignore storage quota errors
      }
    }
    const target = encodeURIComponent(pendingUnlockCategory);
    setPendingUnlockCategory(null);
    router.push(`/seller/subscription?unlock=${target}`);
  };

  // Restore draft fields if returning from category unlock on Subscription page
  useEffect(() => {
    if (editId || !unlockedParam || typeof window === "undefined") return;
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        const rawDraft = sessionStorage.getItem("ulavan_add_product_draft");
        if (!rawDraft) return;
        const draft = JSON.parse(rawDraft);
        sessionStorage.removeItem("ulavan_add_product_draft");
        if (draft.productName) setProductName(draft.productName);
        if (draft.productSubcategory) setProductSubcategory(draft.productSubcategory);
        if (draft.productType) setProductType(draft.productType);
        if (draft.variety) setVariety(draft.variety);
        if (draft.qualityGrade && draft.qualityGrade !== "Select grade") {
          setQualityGrade(draft.qualityGrade);
        }
        if (draft.size) setSize(draft.size);
        if (draft.productDescription) setProductDescription(draft.productDescription);
        if (draft.placeOfOrigin) setPlaceOfOrigin(draft.placeOfOrigin);
        if (draft.productionLocation) setProductionLocation(draft.productionLocation);
        if (draft.processingLocation) setProcessingLocation(draft.processingLocation);
        if (draft.manufacturingLocation) setManufacturingLocation(draft.manufacturingLocation);
        if (draft.moqQty) setMoqQty(draft.moqQty);
        if (draft.moqUnit) setMoqUnit(draft.moqUnit);
        if (draft.availability) setAvailability(draft.availability);
        if (draft.processingDetails) setProcessingDetails(draft.processingDetails);
        if (draft.manufacturingDetails) setManufacturingDetails(draft.manufacturingDetails);
        if (draft.packagingDetails) setPackagingDetails(draft.packagingDetails);
        if (draft.specificationsText) {
          setSpecificationsText(draft.specificationsText);
        }
      } catch {
        // ignore invalid draft JSON
      }
    });
    return () => {
      isMounted = false;
    };
  }, [editId, unlockedParam]);

  // Load existing product if editing
  useEffect(() => {
    if (!editId) return;
    getSellerProductById(editId).then((res) => {
      if (res.success && res.data?.product) {
        const p = res.data.product;
        setProductName(p.name || "");
        setProductCategory(
          PRODUCT_CATEGORIES.includes(p.category) ? p.category : ""
        );
        setProductSubcategory(p.subcategory || p.productSubcategory || "");
        setProductType(p.productType || "");
        setVariety(p.variety || "");
        setQualityGrade(
          p.qualityGrade && p.qualityGrade !== "Select grade" ? p.qualityGrade : ""
        );
        setSize(p.size || "");
        setProductDescription(p.description || "");
        if (Array.isArray(p.images)) setImages(p.images);
        if (p.originLocation) {
          setPlaceOfOrigin(p.originLocation.placeOfOrigin || "");
          setProductionLocation(p.originLocation.productionLocation || "");
          setProcessingLocation(p.originLocation.processingLocation || "");
          setManufacturingLocation(p.originLocation.manufacturingLocation || "");
        }
        if (p.moq) {
          setMoqQty(p.moq.quantity ? String(p.moq.quantity) : "");
          setMoqUnit(p.moq.unit || "kg");
          setAvailability(p.moq.availability || "");
        }
        if (p.processing) {
          setProcessingDetails(p.processing.processingDetails || "");
          setManufacturingDetails(p.processing.manufacturingDetails || "");
          setPackagingDetails(p.processing.packagingDetails || "");
        }
        if (Array.isArray(p.specifications) && p.specifications.length > 0) {
          setSpecificationsText(specsArrayToText(p.specifications));
        }
        if (Array.isArray(p.certifications) && p.certifications.length > 0) {
          setCertifications(p.certifications);
        }
      }
    });
  }, [editId]);

  // Dynamic Certifications Handlers
  const handleAddCertification = () => {
    setCertifications((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        name: "",
        number: "",
        authority: "",
        validFrom: "",
        validUntil: "",
        documentUploaded: false,
      },
    ]);
  };

  const handleRemoveCertification = (id) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCertification = (id, field, val) => {
    setCertifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Image handlers (supports multiple images + primary image selection)
  const handleAddImages = (newImgs) => {
    setImages((prev) => {
      const combined = [...prev, ...newImgs];
      if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
    setStepError("");
  };

  const handleReplaceImage = (id, newImg) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...newImg, isPrimary: img.isPrimary } : img))
    );
  };

  const handleSetPrimaryImage = (id) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
  };

  const handleDeleteImage = (id) => {
    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== id);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const validateStep1 = () => {
    if (!effectiveProductCategory) {
      setStepError("Please select a product category.");
      return false;
    }
    if (!unlockedCategories.includes(effectiveProductCategory)) {
      setPendingUnlockCategory(effectiveProductCategory);
      setStepError(
        `Please pay ₹365 to unlock "${effectiveProductCategory}" before continuing.`
      );
      return false;
    }
    if (!productName.trim()) {
      setStepError("Product name is required.");
      return false;
    }
    if (!productDescription.trim()) {
      setStepError("Product description is required.");
      return false;
    }
    if (images.length === 0) {
      setStepError("Please upload at least one product image.");
      return false;
    }
    return true;
  };

  const goToStep = (nextStep) => {
    setStepError("");
    setStatusMessage("");
    setCurrentStep(nextStep);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmit = async (type) => {
    setStepError("");
    const isDraft = type === "draft";

    if (!isDraft) {
      if (!validateStep1()) {
        setCurrentStep(1);
        return;
      }
    } else if (!productName.trim()) {
      setStepError("Please enter a product name before saving a draft.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(
      isDraft
        ? "Saving product as draft..."
        : "Uploading assets and submitting for Admin review..."
    );

    try {
      const specificationsPayload = specificationsText.trim()
        ? [{ id: "s1", name: "Specifications", value: specificationsText.trim() }]
        : [];

      const hasField = (field) => categorySpecificFields.includes(field);

      const formData = {
        productName,
        productCategory: effectiveProductCategory,
        productSubcategory,
        productType,
        variety: hasField("variety") ? variety : "",
        qualityGrade: hasField("qualityGrade") ? qualityGrade.trim() || "Select grade" : "Select grade",
        size: hasField("size") ? size : "",
        productDescription,
        images,
        placeOfOrigin,
        productionLocation,
        processingLocation: hasField("processingLocation") ? processingLocation : "",
        manufacturingLocation: hasField("manufacturingLocation") ? manufacturingLocation : "",
        moqQty,
        moqUnit,
        moqVariesBy: "Not specified",
        availability: availability || "Available",
        processingDetails: hasField("processingDetails") ? processingDetails : "",
        manufacturingDetails: hasField("manufacturingDetails") ? manufacturingDetails : "",
        packagingDetails,
        specifications: specificationsPayload,
        otherAttributes: [],
        certifications,
      };

      const res =
        isEditing && editId
          ? await updateSellerProduct(editId, formData)
          : await createSellerProduct(formData, isDraft);

      if (res.success) {
        setStatusMessage(
          isDraft
            ? "Product saved as draft successfully!"
            : "Product submitted for Admin review successfully!"
        );
        setTimeout(() => {
          router.push("/seller/products");
        }, 1200);
      } else {
        setStatusMessage(`Error: ${res.error || res.message || "Failed to save product"}`);
      }
    } catch (err) {
      console.error("Save product error:", err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStepTitle = WIZARD_STEPS[currentStep]?.title || "";

  const filledCertifications = certifications.filter(
    (c) => c.name || c.number || c.authority || c.documentUploaded || c.documentName
  );

  return (
    <div className="max-w-4xl mx-auto space-y-3.5">
      {/* Compact Emerald Hero Header */}
      <div className="bg-gradient-to-br from-[#0B3C26] via-[#135235] to-[#1D6B44] text-white rounded-2xl px-5 pt-4 pb-3 shadow-sm border border-[#1E5C3E] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-[#C5F340]/90 font-medium mb-0.5">
              <Link href="/seller/products" className="hover:underline">
                My products
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">
                {isEditing ? "Edit product" : "Add product"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                {isEditing ? "Edit product" : "Add product"}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C5F340] text-[#0B3C26] px-2.5 py-0.5 rounded-full">
                Step {currentStep} of {WIZARD_STEPS.length} ·{" "}
                {currentStep === 2 && effectiveProductCategory
                  ? effectiveProductCategory
                  : WIZARD_STEPS[currentStep - 1]?.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="self-start sm:self-auto px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            Save as draft
          </button>
        </div>

        {/* Sleek 4-segment Progress Line */}
        <div className="grid grid-cols-4 gap-1.5">
          {WIZARD_STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1 rounded-full transition-colors ${
                s.id <= currentStep ? "bg-[#C5F340]" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Inline Validation / Status Alerts */}
      {stepError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {stepError}
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-3 text-xs font-semibold rounded-xl border ${
            statusMessage.startsWith("Error:")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-[#ECF9C4] border-[#C5E37A] text-[#0B3C26]"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Main Step Content */}
      <div className="space-y-3.5 min-w-0">
        {/* STEP 1: Unified Product Information & Multiple Images Card */}
        {currentStep === 1 && (
          <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
            <BasicInfoSection
              productName={productName}
              onProductNameChange={(v) => {
                setProductName(v);
                setStepError("");
              }}
              productCategory={effectiveProductCategory}
              onProductCategoryChange={(val) => {
                setProductCategory(val);
                setHasClearedCategory(!val);
                setStepError("");
              }}
              productSubcategory={productSubcategory}
              onProductSubcategoryChange={setProductSubcategory}
              sellerCategories={sellerCategories}
              unlockedCategories={unlockedCategories}
              onLockedCategoryClick={(categoryName) => {
                setPendingUnlockCategory(categoryName);
              }}
              productDescription={productDescription}
              onProductDescriptionChange={(v) => {
                setProductDescription(v);
                setStepError("");
              }}
            />

            <ProductImagesSection
              images={images}
              onAddImages={handleAddImages}
              onReplaceImage={handleReplaceImage}
              onSetPrimary={handleSetPrimaryImage}
              onDeleteImage={handleDeleteImage}
            />
          </div>
        )}

        {/* STEP 2: Listing Details (Common) + Category-Specific Fields */}
        {currentStep === 2 && (
          <div className="space-y-3.5 min-w-0">
            {/* Listing Details (Common Fields from HTML) */}
            <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
                <div>
                  <h2 className="text-sm font-extrabold text-[#0B3C26]">
                    Listing details
                  </h2>
                  <p className="text-[11px] text-[#54754B]">
                    Common supply, origin, order quantity and packaging details.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#4E6D45] bg-[#F5F7EC] border border-[#DDE7CE] px-2.5 py-0.5 rounded-full">
                  Common fields
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Product type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flour, spice, grain"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Place of origin
                  </label>
                  <input
                    type="text"
                    placeholder="District or region"
                    value={placeOfOrigin}
                    onChange={(e) => setPlaceOfOrigin(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Production location
                  </label>
                  <input
                    type="text"
                    placeholder="Farm or production unit"
                    value={productionLocation}
                    onChange={(e) => setProductionLocation(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Minimum order quantity (include unit)
                  </label>
                  <div className="flex gap-2 min-w-0">
                    <input
                      type="text"
                      placeholder="e.g. 25"
                      value={moqQty}
                      onChange={(e) => setMoqQty(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                    />
                    <div className="w-28 shrink-0">
                      <SellerSelect
                        value={moqUnit}
                        onChange={setMoqUnit}
                        options={MOQ_UNIT_OPTIONS}
                        ariaLabel="MOQ unit"
                      />
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Availability
                  </label>
                  <SellerSelect
                    value={availability}
                    onChange={setAvailability}
                    options={AVAILABILITY_OPTIONS}
                    ariaLabel="Availability"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Specifications
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Moisture, purity, shelf life, mesh size..."
                    value={specificationsText}
                    onChange={(e) => setSpecificationsText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                    Packaging details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 25 kg PP bags, vacuum pouches"
                    value={packagingDetails}
                    onChange={(e) => setPackagingDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Category-Specific Fields (exact match to HTML categories) */}
            <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
                <div>
                  <h2 className="text-sm font-extrabold text-[#0B3C26]">
                    {effectiveProductCategory}
                  </h2>
                  <p className="text-[11px] text-[#54754B]">
                    Fields required specifically for {effectiveProductCategory}.
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#ECF9C4] border border-[#C5E37A] text-[#0B3C26] px-2.5 py-0.5 rounded-full">
                  {categorySpecificFields.length} fields
                </span>
              </div>

              {(categorySpecificFields.includes("variety") ||
                categorySpecificFields.includes("qualityGrade") ||
                categorySpecificFields.includes("size")) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {categorySpecificFields.includes("variety") && (
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Karuppu Kavuni"
                        value={variety}
                        onChange={(e) => setVariety(e.target.value)}
                        className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}

                  {categorySpecificFields.includes("qualityGrade") && (
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Quality grade
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grade A"
                        value={qualityGrade}
                        onChange={(e) => setQualityGrade(e.target.value)}
                        className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}

                  {categorySpecificFields.includes("size") && (
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Medium, 8–10 mm"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}

              {(categorySpecificFields.includes("processingLocation") ||
                categorySpecificFields.includes("manufacturingLocation")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categorySpecificFields.includes("processingLocation") && (
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Processing location
                      </label>
                      <input
                        type="text"
                        placeholder="Where the product is processed"
                        value={processingLocation}
                        onChange={(e) => setProcessingLocation(e.target.value)}
                        className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}

                  {categorySpecificFields.includes("manufacturingLocation") && (
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Manufacturing location
                      </label>
                      <input
                        type="text"
                        placeholder="Where the product is manufactured"
                        value={manufacturingLocation}
                        onChange={(e) => setManufacturingLocation(e.target.value)}
                        className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}

              {(categorySpecificFields.includes("processingDetails") ||
                categorySpecificFields.includes("manufacturingDetails")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categorySpecificFields.includes("processingDetails") && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Processing details
                      </label>
                      <textarea
                        rows={2}
                        placeholder="How it was cleaned, milled or cold-pressed"
                        value={processingDetails}
                        onChange={(e) => setProcessingDetails(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}

                  {categorySpecificFields.includes("manufacturingDetails") && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
                        Manufacturing details
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Manufacturing process or formulation notes"
                        value={manufacturingDetails}
                        onChange={(e) => setManufacturingDetails(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Certifications */}
        {currentStep === 3 && (
          <CertificationsSection
            certifications={certifications}
            onAddCertification={handleAddCertification}
            onRemoveCertification={handleRemoveCertification}
            onUpdateCertification={handleUpdateCertification}
            isRecommended={isOrganicCategory}
          />
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
              <div>
                <h2 className="text-sm font-extrabold text-[#0B3C26]">
                  Review your product listing
                </h2>
                <p className="text-[11px] text-[#54754B]">
                  Verify all details below before submitting for Admin review.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D8A3E] bg-[#ECF9C4] border border-[#C5E37A] px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to submit
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Product Information Summary */}
              <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0B3C26]">
                    Product information
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-[11px] font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-[#54754B]">Category: </span>
                    <strong className="text-[#0B3C26]">{effectiveProductCategory || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[#54754B]">Subcategory: </span>
                    <strong className="text-[#0B3C26]">{productSubcategory || "—"}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#54754B]">Product name: </span>
                    <strong className="text-[#0B3C26]">{productName || "—"}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#54754B]">Description: </span>
                    <span className="text-[#0B3C26]">{productDescription || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Images Summary */}
              <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0B3C26]">
                    Product images ({images.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-[11px] font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className={`relative w-20 h-16 rounded-lg overflow-hidden border ${
                          img.isPrimary ? "border-[#2D8A3E] ring-2 ring-[#C5F340]" : "border-[#DDE7CE]"
                        }`}
                      >
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt={img.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#ECF9C4]">
                            <ImageIcon className="w-4 h-4 text-[#2D8A3E]" />
                          </div>
                        )}
                        {img.isPrimary && (
                          <span className="absolute bottom-0.5 left-0.5 right-0.5 text-center bg-[#0B3C26]/85 text-[#C5F340] text-[9px] font-bold rounded py-0.2">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#54754B]">No images uploaded.</p>
                )}
              </div>

              {/* Listing & Category Attributes Summary */}
              <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0B3C26]">
                    Listing &amp; {effectiveProductCategory || "category"} details
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-[11px] font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-[#54754B]">Product type: </span>
                    <strong className="text-[#0B3C26]">{productType || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[#54754B]">Availability: </span>
                    <strong className="text-[#0B3C26]">{availability || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-[#54754B]">MOQ: </span>
                    <strong className="text-[#0B3C26]">
                      {moqQty ? `${moqQty} ${moqUnit}` : "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#54754B]">Place of origin: </span>
                    <strong className="text-[#0B3C26]">{placeOfOrigin || "—"}</strong>
                  </div>
                  {productionLocation && (
                    <div>
                      <span className="text-[#54754B]">Production location: </span>
                      <strong className="text-[#0B3C26]">{productionLocation}</strong>
                    </div>
                  )}
                  {categorySpecificFields.includes("variety") && variety && (
                    <div>
                      <span className="text-[#54754B]">Variety: </span>
                      <strong className="text-[#0B3C26]">{variety}</strong>
                    </div>
                  )}
                  {categorySpecificFields.includes("qualityGrade") && qualityGrade && (
                    <div>
                      <span className="text-[#54754B]">Quality grade: </span>
                      <strong className="text-[#0B3C26]">{qualityGrade}</strong>
                    </div>
                  )}
                  {categorySpecificFields.includes("size") && size && (
                    <div>
                      <span className="text-[#54754B]">Size: </span>
                      <strong className="text-[#0B3C26]">{size}</strong>
                    </div>
                  )}
                  {categorySpecificFields.includes("processingLocation") && processingLocation && (
                    <div>
                      <span className="text-[#54754B]">Processing location: </span>
                      <strong className="text-[#0B3C26]">{processingLocation}</strong>
                    </div>
                  )}
                  {categorySpecificFields.includes("manufacturingLocation") && manufacturingLocation && (
                    <div>
                      <span className="text-[#54754B]">Manufacturing location: </span>
                      <strong className="text-[#0B3C26]">{manufacturingLocation}</strong>
                    </div>
                  )}
                  {specificationsText && (
                    <div className="sm:col-span-2">
                      <span className="text-[#54754B]">Specifications: </span>
                      <span className="text-[#0B3C26]">{specificationsText}</span>
                    </div>
                  )}
                  {packagingDetails && (
                    <div className="sm:col-span-2">
                      <span className="text-[#54754B]">Packaging details: </span>
                      <span className="text-[#0B3C26]">{packagingDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications Summary */}
              <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0B3C26]">
                    Certifications ({filledCertifications.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="text-[11px] font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {filledCertifications.length > 0 ? (
                  <div className="space-y-1.5">
                    {filledCertifications.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white border border-[#DDE7CE] rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#2D8A3E]" />
                          <strong className="text-[#0B3C26]">
                            {c.name || "Certificate"}
                          </strong>
                          {c.number && (
                            <span className="text-[#54754B]">#{c.number}</span>
                          )}
                        </div>
                        {c.documentName && (
                          <span className="text-[11px] text-[#2D8A3E] font-semibold">
                            {c.documentName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#54754B]">
                    No certifications added (optional).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onboarding-style Bottom Navigation Bar */}
        <div className="bg-white border border-[#DDE7CE] rounded-2xl px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
          {currentStep === 1 ? (
            <Link
              href="/seller/products"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
              className="px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as draft
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#174B35] hover:bg-[#0B3C26] text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <span>Next: {nextStepTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("review")}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? "Submitting..."
                    : isEditing
                    ? "Save & submit changes"
                    : "Submit for review"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Additional Category / Classification Redirect Modal */}
      {pendingUnlockCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPendingUnlockCategory(null)}
        >
          <div
            className="bg-white border border-[#DDE7CE] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-[#ECF9C4] border border-[#C5E37A] flex items-center justify-center mx-auto mb-4 text-[#0B3C26]">
              <span className="text-2xl font-black leading-none">₹</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B3C26] tracking-tight mb-2">
              Unlock Classification
            </h3>

            <p className="text-xs sm:text-sm text-[#4E6D45] font-medium leading-relaxed max-w-sm mx-auto mb-4">
              {unlockedCategories.length > 0 ? (
                <>
                  You have already unlocked{" "}
                  <strong className="text-[#0B3C26]">
                    {unlockedCategories.join(", ")}
                  </strong>
                  . To add products under{" "}
                  <strong className="text-[#0B3C26]">{pendingUnlockCategory}</strong>,
                  continue to Subscription &amp; Payments to upload the required documents before paying ₹365.
                </>
              ) : (
                <>
                  To add products under{" "}
                  <strong className="text-[#0B3C26]">{pendingUnlockCategory}</strong>,
                  continue to Subscription &amp; Payments to upload verification documents and pay ₹365.
                </>
              )}
            </p>

            <div className="bg-[#F2FAE0] border border-[#C5E37A] rounded-2xl p-4 sm:p-5 mb-5 text-center space-y-1.5">
              {unlockedCategories.length > 0 && (
                <div className="text-[11px] font-semibold text-[#2D8A3E]">
                  Already Active: {unlockedCategories.join(", ")}
                </div>
              )}
              <div className="text-sm sm:text-base font-extrabold text-[#0B3C26]">
                {pendingUnlockCategory} • ₹365
              </div>
              <div className="text-[11px] text-[#4E6D45] font-medium">
                Subscription &amp; Payments &rarr; Upload Docs &rarr; Pay ₹365
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleProceedToUnlockSubscription}
                className="w-full py-3.5 px-6 rounded-xl bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] font-extrabold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
              >
                Go to Subscription &amp; Upload Docs &rarr;
              </button>
              <button
                type="button"
                onClick={() => setPendingUnlockCategory(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#4E6D45] hover:bg-[#F5F7EC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#54754B]">
          Loading product editor...
        </div>
      }
    >
      <AddProductFormContent />
    </Suspense>
  );
}
