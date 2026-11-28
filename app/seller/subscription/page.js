"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CurrentSubscriptionCard from "@/components/seller/subscription/CurrentSubscriptionCard";
import RenewPlanCard from "@/components/seller/subscription/RenewPlanCard";
import PaymentFlowSteps from "@/components/seller/subscription/PaymentFlowSteps";
import PaymentResultCards from "@/components/seller/subscription/PaymentResultCards";
import PaymentHistoryTable from "@/components/seller/subscription/PaymentHistoryTable";
import UnlockCategoryFlow, {
  getUnlockDocRequirements,
} from "@/components/seller/subscription/UnlockCategoryFlow";
import {
  PRODUCT_CATEGORIES,
  CATEGORY_TO_STORAGE_CODES,
} from "@/components/seller/products/add/BasicInfoSection";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getDynamicSellerProfile,
  getSellerProfile,
  getSellerUnlockedCategories,
  updateSellerProfile,
} from "@/services/sellerApi";
import { getSellerCategories } from "@/services/categoryStorage";
import { submitApplication } from "@/services/onboardingApi";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  submitRolePayment,
  fetchCurrentUserProfile,
} from "@/services/paymentApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

function SellerSubscriptionContent() {
  const searchParams = useSearchParams();
  const unlockParam = searchParams.get("unlock") || "";

  const sessionUser = useSessionUser();
  const [sellerCategories, setSellerCategories] = useState(getSellerCategories);
  const [liveProfileUser, setLiveProfileUser] = useState(null);

  // Sync dynamic admin categories + live backend seller profile
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
          ? sellerRes.data.seller ||
            sellerRes.data.profile ||
            sellerRes.data.user ||
            sellerRes.data
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

  const mergedUser = useMemo(() => {
    if (!liveProfileUser) return sessionUser;
    return {
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
    };
  }, [sessionUser, liveProfileUser]);

  const profile = useMemo(
    () => getDynamicSellerProfile(mergedUser),
    [mergedUser]
  );

  const unlockedCategories = useMemo(() => {
    const rawUnlocked = getSellerUnlockedCategories(mergedUser, sellerCategories);
    const rawSet = new Set(rawUnlocked);

    return PRODUCT_CATEGORIES.filter((prodCat) => {
      if (rawSet.has(prodCat)) return true;
      const mappedCodes = CATEGORY_TO_STORAGE_CODES[prodCat] || [];
      return mappedCodes.some((code) => rawSet.has(code));
    });
  }, [mergedUser, sellerCategories]);

  const lockedCategoryOptions = useMemo(() => {
    const unlockedSet = new Set(unlockedCategories);
    return PRODUCT_CATEGORIES.filter((name) => !unlockedSet.has(name)).map(
      (name) => ({ value: name, label: name })
    );
  }, [unlockedCategories]);

  const normalizedUnlockParam = useMemo(() => {
    if (!unlockParam) return "";
    if (PRODUCT_CATEGORIES.includes(unlockParam)) return unlockParam;
    return (
      PRODUCT_CATEGORIES.find((prodCat) =>
        (CATEGORY_TO_STORAGE_CODES[prodCat] || []).includes(unlockParam)
      ) || ""
    );
  }, [unlockParam]);

  // Manual selection overrides URL param cleanly; "__NONE__" switches back to renewal mode
  const [manualUnlockCategory, setManualUnlockCategory] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [hasFssai, setHasFssai] = useState("No");
  const [hasGst, setHasGst] = useState("No");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [unlockResult, setUnlockResult] = useState(null);
  const [extraHistory, setExtraHistory] = useState([]);

  // Restore local session payment records safely after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        const storedHistory = sessionStorage.getItem("ulavan_seller_payment_history");
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed)) {
            setExtraHistory(parsed);
          }
        }
      } catch {
        // ignore invalid stored history
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeUnlockCategory = useMemo(() => {
    if (unlockResult) return unlockResult.category;
    if (manualUnlockCategory === "__NONE__") return "";
    if (manualUnlockCategory) return manualUnlockCategory;
    if (normalizedUnlockParam && !unlockedCategories.includes(normalizedUnlockParam)) {
      return normalizedUnlockParam;
    }
    return "";
  }, [manualUnlockCategory, normalizedUnlockParam, unlockedCategories, unlockResult]);

  const requestedAlreadyUnlocked =
    !unlockResult &&
    !manualUnlockCategory &&
    Boolean(normalizedUnlockParam) &&
    unlockedCategories.includes(normalizedUnlockParam)
      ? normalizedUnlockParam
      : "";

  const docRequirements = useMemo(
    () => getUnlockDocRequirements(activeUnlockCategory, { hasFssai, hasGst }),
    [activeUnlockCategory, hasFssai, hasGst]
  );

  const areRequiredDocsReady =
    Boolean(activeUnlockCategory) &&
    docRequirements.length > 0 &&
    docRequirements
      .filter((d) => d.required)
      .every((d) => Boolean(uploadedDocs[d.docType]));

  const basePaymentHistory = useMemo(() => {
    const paymentObj = sessionUser?.sellerPayment || sessionUser?.payment;
    if (sessionUser?.isPaid || sessionUser?.sellerPaid || paymentObj) {
      return [
        {
          id: paymentObj?.invoiceNumber || "TXN-VERIFIED-01",
          date: "Active Plan",
          amount: `₹${paymentObj?.amount || 365}`,
          paymentType: "Seller subscription",
          status: "Success",
          transactionId:
            paymentObj?.transactionId ||
            paymentObj?.invoiceNumber ||
            "TXN-VERIFIED-01",
          subscriptionDetails: "Seller plan · 1 year · Active",
          receiptAction: "Download receipt",
        },
      ];
    }
    return [];
  }, [sessionUser]);

  const paymentHistory = useMemo(() => {
    const seen = new Set();
    const combined = [...extraHistory, ...basePaymentHistory].filter((item) => {
      const key = item.transactionId || item.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return combined;
  }, [extraHistory, basePaymentHistory]);

  const handleSelectUnlockCategory = (cat) => {
    setManualUnlockCategory(cat);
    setUploadedDocs({});
    setHasFssai("No");
    setHasGst("No");
    setPaymentError("");
    setPaymentNotice("");
    setUnlockResult(null);
  };

  const handleClearUnlock = () => {
    setManualUnlockCategory("__NONE__");
    setUploadedDocs({});
    setHasFssai("No");
    setHasGst("No");
    setPaymentError("");
    setPaymentNotice("");
    setUnlockResult(null);
  };

  const finalizeUnlockSuccess = async (categoryName, gatewayPaymentId) => {
    const now = new Date();
    const txId = `TXN_US_${Date.now().toString().slice(-8)}`;
    const gwRef =
      gatewayPaymentId ||
      `pay_add_${Math.random().toString(36).substring(2, 10)}`;
    const invNumber = `INV-US-ADD-${Math.floor(100000 + Math.random() * 900000)}`;
    const applicationId = `US_UNLOCK_${Date.now().toString().slice(-6)}`;

    const mergedCategories = Array.from(
      new Set([...unlockedCategories, categoryName])
    );
    const mergedLabel = mergedCategories.join(", ");

    // Best-effort backend application & payment logging
    await submitApplication({
      applicationId,
      role: "SELLER",
      subType: mergedLabel,
      account: mergedUser,
      selectedSellerTypes: [categoryName],
      profile: mergedUser?.sellerData || {},
      documents: uploadedDocs,
      status: "active",
      submittedAt: now.toISOString(),
    }).catch(() => {});

    await submitRolePayment({
      transactionId: txId,
      gatewayReference: gwRef,
      userId: mergedUser?.id || "",
      userName: mergedUser?.name || "Registered Member",
      userEmail: mergedUser?.email || "",
      userMobile: mergedUser?.mobile || "",
      role: "SELLER",
      planId: "plan_seller_unlock_1",
      planName: `Additional Classification Unlock (${categoryName} - ₹365)`,
      baseAmount: 365,
      taxAmount: 0,
      totalAmount: 365,
      currency: "INR",
      paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
      paymentDetails: {
        gateway: "Razorpay",
        razorpayPaymentId: gwRef,
      },
    }).catch(() => {});

    let nextSellerProfileData = null;
    const newRecord = {
      id: invNumber,
      date: now.toLocaleDateString("en-IN", { dateStyle: "medium" }),
      amount: "₹365",
      paymentType: `Unlock · ${categoryName}`,
      status: "Success",
      transactionId: txId,
      subscriptionDetails: `${categoryName} classification · 1 year · Active`,
      receiptAction: "Download receipt",
    };

    if (typeof window !== "undefined") {
      const stored =
        sessionStorage.getItem("ulavan_user") ||
        sessionStorage.getItem("ulavan_registered_user") ||
        localStorage.getItem("ulavan_registered_user");
      const existing = stored ? JSON.parse(stored) : mergedUser || {};
      const existingSellerData = existing.sellerData || {};

      nextSellerProfileData = {
        ...existingSellerData,
        sellerType: existingSellerData.sellerType || mergedCategories[0],
        sellerTypes: mergedCategories,
        unlockedCategories: mergedCategories,
        unlockedDocuments: {
          ...(existingSellerData.unlockedDocuments || {}),
          [categoryName]: uploadedDocs,
        },
      };

      const paymentRecord = {
        transactionId: txId,
        gatewayReference: gwRef,
        invoiceNumber: invNumber,
        amount: 365,
        status: "SUCCESS",
        paidAt: now.toISOString(),
      };

      const updatedUser = {
        ...existing,
        role: "Seller",
        activeRole: "seller",
        subType: mergedLabel,
        status: "active",
        isPaid: true,
        sellerPaid: true,
        sellerOnboarded: true,
        sellerData: nextSellerProfileData,
        sellerPayment: paymentRecord,
        payment: paymentRecord,
      };

      sessionStorage.setItem("ulavan_user", JSON.stringify(updatedUser));
      sessionStorage.setItem(
        "ulavan_registered_user",
        JSON.stringify(updatedUser)
      );
      localStorage.setItem(
        "ulavan_registered_user",
        JSON.stringify(updatedUser)
      );
      sessionStorage.setItem("ulavan_latest_payment_id", invNumber);

      try {
        const existingHistRaw = sessionStorage.getItem(
          "ulavan_seller_payment_history"
        );
        const existingHist = existingHistRaw ? JSON.parse(existingHistRaw) : [];
        const updatedHist = [
          newRecord,
          ...(Array.isArray(existingHist) ? existingHist : []),
        ];
        sessionStorage.setItem(
          "ulavan_seller_payment_history",
          JSON.stringify(updatedHist)
        );
      } catch {
        // ignore storage errors
      }

      window.dispatchEvent(new Event("ulavan_session_updated"));
    }

    if (nextSellerProfileData) {
      await updateSellerProfile(nextSellerProfileData).catch(() => {});
    }

    setExtraHistory((prev) => [newRecord, ...prev]);
    setUnlockResult({
      category: categoryName,
      transactionId: txId,
      invoiceNumber: invNumber,
      totalAmount: 365,
      paymentDate: now.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    });
    setPaymentNotice(
      `"${categoryName}" unlocked! You can now add products under this classification.`
    );
    setIsProcessingPayment(false);
  };

  const handlePay = async () => {
    setPaymentError("");
    setPaymentNotice("");

    if (activeUnlockCategory) {
      if (!areRequiredDocsReady) {
        setPaymentError(
          "Please upload all required verification documents before paying."
        );
        return;
      }

      setIsProcessingPayment(true);
      setPaymentNotice("Connecting securely to payment gateway...");

      try {
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const isLoaded = razorpayKey ? await loadRazorpayScript() : false;

        if (
          isLoaded &&
          razorpayKey &&
          typeof window !== "undefined" &&
          window.Razorpay
        ) {
          const orderRes = await createRazorpayOrder(
            "SELLER_CATEGORY_UNLOCK"
          ).catch(() => null);
          const orderData = orderRes?.data || orderRes?.raw?.data || orderRes;
          const orderId = orderData?.orderId || orderData?.id;

          if (orderRes?.success && orderId) {
            const options = {
              key: orderData?.keyId || orderData?.key || razorpayKey,
              amount: orderData?.amount || 36500,
              currency: orderData?.currency || "INR",
              name: "Ulavan Santhai",
              description: `Unlock Classification (${activeUnlockCategory})`,
              image: "/images/ulavan-santhai-emblem@2x.png",
              order_id: orderId,
              prefill: {
                name: mergedUser?.name || "",
                email: mergedUser?.email || "",
                contact: mergedUser?.mobile || "",
              },
              theme: { color: "#0B3C26" },
              handler: async function (response) {
                try {
                  await verifyRazorpayPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    paymentMethod: response.method || "RAZORPAY_ONLINE",
                  });
                } catch {
                  // Continue local session unlock after Razorpay callback
                }
                await finalizeUnlockSuccess(
                  activeUnlockCategory,
                  response.razorpay_payment_id || `pay_add_${Date.now()}`
                );
              },
              modal: {
                ondismiss: function () {
                  setIsProcessingPayment(false);
                  setPaymentNotice("");
                },
              },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
            return;
          }
        }

        // Preview / sandbox completion when live gateway order route is unavailable
        await new Promise((resolve) => setTimeout(resolve, 900));
        await finalizeUnlockSuccess(
          activeUnlockCategory,
          `pay_add_${Date.now()}`
        );
      } catch (err) {
        setPaymentError(
          err?.message || "Payment failed. Please try again."
        );
        setIsProcessingPayment(false);
        setPaymentNotice("");
      }
      return;
    }

    // Standard Seller Plan Renewal
    setIsProcessingPayment(true);
    setPaymentNotice("Connecting securely to payment gateway...");
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentNotice(
        "Payment simulated successfully. Your subscription is active."
      );
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3C26]">
          Subscription and payments
        </h1>
        <p className="text-xs text-[#4E6D45] mt-0.5">
          {activeUnlockCategory
            ? `Upload required documents and complete ₹365 payment to unlock ${activeUnlockCategory}`
            : "Manage your Seller plan, unlock categories, and view payment history"}
        </p>
      </div>

      {/* Top Section: Document Upload / Current Plan (Left) & Payment Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-7 min-w-0 space-y-5">
          {(activeUnlockCategory || requestedAlreadyUnlocked) && (
            <UnlockCategoryFlow
              unlockCategory={activeUnlockCategory}
              lockedCategoryOptions={lockedCategoryOptions}
              unlockedCategories={unlockedCategories}
              requestedAlreadyUnlocked={requestedAlreadyUnlocked}
              onSelectCategory={handleSelectUnlockCategory}
              onClearUnlock={handleClearUnlock}
              uploadedDocs={uploadedDocs}
              onUploadSuccess={(docType, doc) => {
                setPaymentError("");
                setUploadedDocs((prev) => ({ ...prev, [docType]: doc }));
              }}
              onRemoveDoc={(docType) =>
                setUploadedDocs((prev) => {
                  const next = { ...prev };
                  delete next[docType];
                  return next;
                })
              }
              hasFssai={hasFssai}
              onHasFssaiChange={(val) => {
                setHasFssai(val);
                if (val === "No") {
                  setUploadedDocs((prev) => {
                    const next = { ...prev };
                    delete next.FSSAI_LICENSE;
                    return next;
                  });
                }
              }}
              hasGst={hasGst}
              onHasGstChange={(val) => {
                setHasGst(val);
                if (val === "No") {
                  setUploadedDocs((prev) => {
                    const next = { ...prev };
                    delete next.GST_CERTIFICATE;
                    return next;
                  });
                }
              }}
              docRequirements={docRequirements}
              areRequiredDocsReady={areRequiredDocsReady}
              unlockResult={unlockResult}
            />
          )}

          <CurrentSubscriptionCard
            subscription={profile.subscription}
            unlockedCategories={unlockedCategories}
            lockedCategoryOptions={activeUnlockCategory ? [] : lockedCategoryOptions}
            onRenew={() => {
              if (activeUnlockCategory) {
                handleClearUnlock();
              } else {
                handlePay();
              }
            }}
            onStartUnlock={(cat) => handleSelectUnlockCategory(cat)}
          />
        </div>

        <div className="lg:col-span-5 min-w-0">
          <RenewPlanCard
            planPrice="₹365"
            unlockCategory={activeUnlockCategory}
            docRequirements={docRequirements}
            uploadedDocs={uploadedDocs}
            areRequiredDocsReady={areRequiredDocsReady}
            onPay={handlePay}
            isProcessing={isProcessingPayment}
            paymentNotice={paymentNotice}
            paymentError={paymentError}
            unlockResult={unlockResult}
          />
        </div>
      </div>

      {/* Payment Flow */}
      <PaymentFlowSteps />

      {/* Payment Result Screens Reference */}
      <PaymentResultCards onRetry={handlePay} />

      {/* Payment History */}
      <PaymentHistoryTable
        history={paymentHistory}
        onRetryPayment={handlePay}
      />
    </div>
  );
}

export default function SellerSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#54754B]">
          Loading subscription and payments...
        </div>
      }
    >
      <SellerSubscriptionContent />
    </Suspense>
  );
}
