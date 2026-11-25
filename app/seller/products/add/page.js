"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BasicInfoSection from "@/components/seller/products/add/BasicInfoSection";
import ProductImagesSection from "@/components/seller/products/add/ProductImagesSection";
import OriginLocationSection from "@/components/seller/products/add/OriginLocationSection";
import MoqAvailabilitySection from "@/components/seller/products/add/MoqAvailabilitySection";
import ProcessingPackagingSection from "@/components/seller/products/add/ProcessingPackagingSection";
import SpecificationsSection from "@/components/seller/products/add/SpecificationsSection";
import CertificationsSection from "@/components/seller/products/add/CertificationsSection";
import ListingStatusSidebar from "@/components/seller/products/add/ListingStatusSidebar";
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

function AddProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const unlockedParam = searchParams.get("unlocked") || "";
  const isEditing = Boolean(editId);
  const sessionUser = useSessionUser();

  // Basic Information State
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [hasClearedCategory, setHasClearedCategory] = useState(false);
  const [productSubcategory, setProductSubcategory] = useState("");
  const [sellerCategories, setSellerCategories] = useState(getSellerCategories);
  const [liveProfileUser, setLiveProfileUser] = useState(null);
  const [pendingUnlockCategory, setPendingUnlockCategory] = useState(null);
  const [productType, setProductType] = useState("");
  const [variety, setVariety] = useState("");
  const [qualityGrade, setQualityGrade] = useState("Select grade");
  const [size, setSize] = useState("");
  const [productDescription, setProductDescription] = useState("");

  // Product Images State
  const [images, setImages] = useState([]);

  // Origin & Location State
  const [placeOfOrigin, setPlaceOfOrigin] = useState("");
  const [productionLocation, setProductionLocation] = useState("");
  const [processingLocation, setProcessingLocation] = useState("");
  const [manufacturingLocation, setManufacturingLocation] = useState("");

  // MOQ & Availability State
  const [moqQty, setMoqQty] = useState("");
  const [moqUnit, setMoqUnit] = useState("kg");
  const [moqVariesBy, setMoqVariesBy] = useState("Not specified");
  const [availability, setAvailability] = useState("Available");

  // Processing, Manufacturing & Packaging State
  const [processingDetails, setProcessingDetails] = useState("");
  const [manufacturingDetails, setManufacturingDetails] = useState("");
  const [packagingDetails, setPackagingDetails] = useState("");

  // Specifications & Attributes State
  const [specifications, setSpecifications] = useState([
    { id: "s1", name: "", value: "" },
    { id: "s2", name: "", value: "" },
  ]);
  const [otherAttributes, setOtherAttributes] = useState([
    { id: "a1", name: "", value: "" },
  ]);

  // Certifications State
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

  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync seller categories from Admin Portal / backend DB & keep live profile updated
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
    const resolved = getSellerUnlockedCategories(mergedUser, sellerCategories);
    return resolved;
  }, [sessionUser, liveProfileUser, sellerCategories]);

  const effectiveProductCategory =
    productCategory ||
    (!isEditing && !hasClearedCategory
      ? unlockedParam && unlockedCategories.includes(unlockedParam)
        ? unlockedParam
        : unlockedCategories.length === 1
        ? unlockedCategories[0]
        : ""
      : "");

  const handleProductCategoryChange = (val) => {
    setProductCategory(val);
    setHasClearedCategory(!val);
  };

  const handleProceedToUnlockOnboarding = () => {
    if (!pendingUnlockCategory) return;
    const target = encodeURIComponent(pendingUnlockCategory);
    setPendingUnlockCategory(null);
    router.push(`/onboarding?role=seller&mode=unlock&category=${target}&step=2`);
  };

  // Load existing product if editing
  useEffect(() => {
    if (editId) {
      getSellerProductById(editId).then((res) => {
        if (res.success && res.data?.product) {
          const p = res.data.product;
          setProductName(p.name || "");
          setProductCategory(p.category || "");
          setProductSubcategory(p.subcategory || p.productSubcategory || "");
          setProductType(p.productType || "");
          setVariety(p.variety || "");
          setQualityGrade(p.qualityGrade || "Select grade");
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
            setMoqVariesBy(p.moq.variesBy || "Not specified");
            setAvailability(p.moq.availability || "Available");
          }
          if (p.processing) {
            setProcessingDetails(p.processing.processingDetails || "");
            setManufacturingDetails(p.processing.manufacturingDetails || "");
            setPackagingDetails(p.processing.packagingDetails || "");
          }
          if (Array.isArray(p.specifications) && p.specifications.length > 0) {
            setSpecifications(p.specifications);
          }
          if (Array.isArray(p.otherAttributes) && p.otherAttributes.length > 0) {
            setOtherAttributes(p.otherAttributes);
          }
          if (Array.isArray(p.certifications) && p.certifications.length > 0) {
            setCertifications(p.certifications);
          }
        }
      });
    }
  }, [editId]);

  // Dynamic Specifications Handlers
  const handleAddSpecification = () => {
    setSpecifications((prev) => [
      ...prev,
      { id: `s_${Date.now()}`, name: "", value: "" },
    ]);
  };

  const handleRemoveSpecification = (id) => {
    setSpecifications((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSpecification = (id, field, val) => {
    setSpecifications((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  // Dynamic Other Attributes Handlers
  const handleAddOtherAttribute = () => {
    setOtherAttributes((prev) => [
      ...prev,
      { id: `a_${Date.now()}`, name: "", value: "" },
    ]);
  };

  const handleRemoveOtherAttribute = (id) => {
    setOtherAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateOtherAttribute = (id, field, val) => {
    setOtherAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

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

  // Image handlers
  const handleAddImages = (newImgs) => {
    setImages((prev) => {
      const combined = [...prev, ...newImgs];
      if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
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

  const handleSubmit = async (type) => {
    if (!productName.trim()) {
      setStatusMessage("Error: Product name is mandatory.");
      return;
    }
    if (!effectiveProductCategory || effectiveProductCategory === "Select a category") {
      setStatusMessage("Error: Please select a product category.");
      return;
    }
    if (!unlockedCategories.includes(effectiveProductCategory)) {
      setPendingUnlockCategory(effectiveProductCategory);
      setStatusMessage(
        `Error: Please pay ₹365 to unlock "${effectiveProductCategory}" before submitting.`
      );
      return;
    }

    setIsSubmitting(true);
    const isDraft = type === "draft";

    setStatusMessage(
      isDraft
        ? "Saving product as draft..."
        : "Uploading assets and submitting for Admin review..."
    );

    try {
      const formData = {
        productName,
        productCategory: effectiveProductCategory,
        productSubcategory,
        productType,
        variety,
        qualityGrade,
        size,
        productDescription,
        images,
        placeOfOrigin,
        productionLocation,
        processingLocation,
        manufacturingLocation,
        moqQty,
        moqUnit,
        moqVariesBy,
        availability,
        processingDetails,
        manufacturingDetails,
        packagingDetails,
        specifications,
        otherAttributes,
        certifications,
      };

      let res;
      if (isEditing && editId) {
        res = await updateSellerProduct(editId, formData);
      } else {
        res = await createSellerProduct(formData, isDraft);
      }

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#7A877E] mb-1">
          <Link
            href="/seller/products"
            className="text-[#24583B] hover:underline"
          >
            My products
          </Link>
          <span>/</span>
          <span className="text-[#1F2922] font-medium">
            {isEditing ? "Edit product" : "Add product"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1F2922]">
              {isEditing ? "Edit product" : "Add product"}
            </h1>
            <p className="text-xs text-[#526458] mt-0.5">
              <span className="text-[#C53030] font-semibold">Mandatory</span>{" "}
              <span className="text-[#7A877E] font-medium">Applicable</span>{" "}
              <span className="text-[#24583B] font-semibold">Configurable</span> —
              &ldquo;Applicable&rdquo; fields show or hide by category.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors shadow-2xs text-center cursor-pointer"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("review")}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs text-center cursor-pointer"
            >
              {isEditing ? "Save & submit changes" : "Submit for review"}
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#EAF5EC] border border-[#BEE3C8] text-[#1D7446] text-xs font-medium rounded-lg">
          {statusMessage}
        </div>
      )}

      {/* Main Grid: Form Sections (Left) & Status Stepper (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-8 space-y-5 sm:space-y-6 min-w-0">
          {/* Section 1: Basic Information */}
          <BasicInfoSection
            productName={productName}
            onProductNameChange={setProductName}
            productCategory={effectiveProductCategory}
            onProductCategoryChange={handleProductCategoryChange}
            productSubcategory={productSubcategory}
            onProductSubcategoryChange={setProductSubcategory}
            sellerCategories={sellerCategories}
            unlockedCategories={unlockedCategories}
            onLockedCategoryClick={(categoryName) => {
              setPendingUnlockCategory(categoryName);
            }}
            productType={productType}
            onProductTypeChange={setProductType}
            variety={variety}
            onVarietyChange={setVariety}
            qualityGrade={qualityGrade}
            onQualityGradeChange={setQualityGrade}
            size={size}
            onSizeChange={setSize}
            productDescription={productDescription}
            onProductDescriptionChange={setProductDescription}
          />

          {/* Section 2: Product Images */}
          <ProductImagesSection
            images={images}
            onAddImages={handleAddImages}
            onReplaceImage={handleReplaceImage}
            onSetPrimary={handleSetPrimaryImage}
            onDeleteImage={handleDeleteImage}
          />

          {/* Section 3: Origin and Location */}
          <OriginLocationSection
            placeOfOrigin={placeOfOrigin}
            onPlaceOfOriginChange={setPlaceOfOrigin}
            productionLocation={productionLocation}
            onProductionLocationChange={setProductionLocation}
            processingLocation={processingLocation}
            onProcessingLocationChange={setProcessingLocation}
            manufacturingLocation={manufacturingLocation}
            onManufacturingLocationChange={setManufacturingLocation}
          />

          {/* Section 4: MOQ and Availability */}
          <MoqAvailabilitySection
            moqQty={moqQty}
            onMoqQtyChange={setMoqQty}
            moqUnit={moqUnit}
            onMoqUnitChange={setMoqUnit}
            moqVariesBy={moqVariesBy}
            onMoqVariesByChange={setMoqVariesBy}
            availability={availability}
            onAvailabilityChange={setAvailability}
          />

          {/* Section 5: Processing, Manufacturing & Packaging */}
          <ProcessingPackagingSection
            processingDetails={processingDetails}
            onProcessingDetailsChange={setProcessingDetails}
            manufacturingDetails={manufacturingDetails}
            onManufacturingDetailsChange={setManufacturingDetails}
            packagingDetails={packagingDetails}
            onPackagingDetailsChange={setPackagingDetails}
          />

          {/* Section 6: Specifications & Other Attributes */}
          <SpecificationsSection
            specifications={specifications}
            onAddSpecification={handleAddSpecification}
            onRemoveSpecification={handleRemoveSpecification}
            onUpdateSpecification={handleUpdateSpecification}
            otherAttributes={otherAttributes}
            onAddOtherAttribute={handleAddOtherAttribute}
            onRemoveOtherAttribute={handleRemoveOtherAttribute}
            onUpdateOtherAttribute={handleUpdateOtherAttribute}
          />

          {/* Section 7: Certifications */}
          <CertificationsSection
            certifications={certifications}
            onAddCertification={handleAddCertification}
            onRemoveCertification={handleRemoveCertification}
            onUpdateCertification={handleUpdateCertification}
          />

          {/* Form Actions Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 pt-3">
            <Link
              href="/seller/products"
              className="flex-1 sm:flex-initial text-center px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="flex-1 sm:flex-initial text-center px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("review")}
              className="w-full sm:w-auto text-center px-4 py-2 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {isEditing ? "Save & submit changes" : "Submit for review"}
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 min-w-0">
          <ListingStatusSidebar />
        </div>
      </div>

      {/* Unlock Additional Category / Classification Redirect Modal */}
      {pendingUnlockCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPendingUnlockCategory(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ₹ Rupee Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#174B35]">
              <span className="text-2xl font-black leading-none">₹</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
              Add Another Classification
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-sm mx-auto mb-4">
              {unlockedCategories.length > 0 ? (
                <>
                  You have already purchased{" "}
                  <strong className="text-[#174B35]">
                    {unlockedCategories.join(", ")}
                  </strong>
                  . To add products under{" "}
                  <strong className="text-gray-900">{pendingUnlockCategory}</strong>,
                  upload the required documents and pay ₹365.
                </>
              ) : (
                <>
                  Complete verification and pay ₹365 to add products under{" "}
                  <strong className="text-gray-900">{pendingUnlockCategory}</strong>.
                </>
              )}
            </p>

            {/* Summary Card matching Onboarding UI */}
            <div className="bg-[#EDF7EE] border border-[#D3E8D6] rounded-2xl p-4 sm:p-5 mb-5 text-center space-y-1.5">
              {unlockedCategories.length > 0 && (
                <div className="text-[11px] font-semibold text-[#174B35]">
                  Already Active: {unlockedCategories.join(", ")}
                </div>
              )}
              <div className="text-sm sm:text-base font-extrabold text-gray-900">
                {pendingUnlockCategory} • ₹365
              </div>
              <div className="text-[11px] text-gray-600 font-medium">
                Document Upload &rarr; Payment (₹365)
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleProceedToUnlockOnboarding}
                className="w-full py-3.5 px-6 rounded-xl bg-[#174B35] hover:bg-[#113B29] text-white font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer"
              >
                Continue to Upload Docs &amp; Pay ₹365 &rarr;
              </button>
              <button
                type="button"
                onClick={() => setPendingUnlockCategory(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
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
        <div className="p-8 text-center text-xs text-[#7A877E]">
          Loading product editor...
        </div>
      }
    >
      <AddProductFormContent />
    </Suspense>
  );
}
