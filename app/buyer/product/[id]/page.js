"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import BuyerPortal from "@/components/buyer/BuyerPortal";

function ProductContent() {
  const params = useParams();
  const id = params?.id;
  return <BuyerPortal initialPage="product" initialProductId={id} />;
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProductContent />
    </Suspense>
  );
}
