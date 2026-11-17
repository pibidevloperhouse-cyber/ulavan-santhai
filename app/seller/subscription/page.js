"use client";

import React, { useState, useMemo } from "react";
import CurrentSubscriptionCard from "@/components/seller/subscription/CurrentSubscriptionCard";
import RenewPlanCard from "@/components/seller/subscription/RenewPlanCard";
import PaymentFlowSteps from "@/components/seller/subscription/PaymentFlowSteps";
import PaymentResultCards from "@/components/seller/subscription/PaymentResultCards";
import PaymentHistoryTable from "@/components/seller/subscription/PaymentHistoryTable";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getDynamicSellerProfile,
  PAYMENT_HISTORY,
} from "@/data/sellerPortalData";

export default function SellerSubscriptionPage() {
  const sessionUser = useSessionUser();
  const profile = useMemo(
    () => getDynamicSellerProfile(sessionUser),
    [sessionUser]
  );

  const paymentHistory = useMemo(() => {
    if (typeof window === "undefined") return PAYMENT_HISTORY;
    const paymentId = sessionStorage.getItem("ulavan_latest_payment_id");
    if (paymentId || sessionUser?.isPaid || sessionUser?.sellerPaid) {
      return [
        {
          id: paymentId || "TXN-VERIFIED-01",
          date: "Today",
          amount: "₹365",
          paymentType: "Seller subscription",
          status: "Success",
          transactionId: paymentId || "TXN-VERIFIED-01",
          subscriptionDetails: "Seller plan · 1 year · Active",
          receiptAction: "Download receipt",
        },
      ];
    }
    return PAYMENT_HISTORY;
  }, [sessionUser]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  const handlePay = () => {
    setIsProcessingPayment(true);
    setPaymentNotice("Connecting securely to payment gateway...");
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentNotice(
        "Payment simulated successfully. Your subscription is active."
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2922]">
          Subscription and payments
        </h1>
        <p className="text-xs text-[#526458] mt-0.5">
          Manage your Seller plan and view payment history
        </p>
      </div>

      {/* Top Section: Current Plan & Renew Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CurrentSubscriptionCard
            subscription={profile.subscription}
            onRenew={handlePay}
          />
        </div>

        <div className="lg:col-span-5">
          <RenewPlanCard
            planPrice="₹365"
            onPay={handlePay}
            isProcessing={isProcessingPayment}
            paymentNotice={paymentNotice}
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
