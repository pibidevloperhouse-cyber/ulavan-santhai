"use client";

import React, { useEffect } from "react";
import "@/components/buyer/buyer.css";
import { initBuyerRuntime } from "@/components/buyer/buyerRuntime";

export default function BuyerPortal({ initialPage = "home", initialProductId = null }) {
  useEffect(() => {
    initBuyerRuntime(initialPage, initialProductId);
  }, [initialPage, initialProductId]);

  return (
    <>
      <header id="hd"></header>
      <main>
        <div id="v"></div>
      </main>
      <footer>
        <div className="in">
          <div>
            <h5>About</h5>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("help")}>
              How it works
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("discover")}>
              Discover products
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("enquiries")}>
              My enquiries
            </a>
            <a onClick={() => typeof window !== "undefined" && window.photos && window.photos()}>
              Upload product photos
            </a>
          </div>
          <div>
            <h5>Help</h5>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("help")}>
              Help and FAQs
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("access")}>
              Plan &amp; payments
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("access")}>
              Payments
            </a>
          </div>
          <div>
            <h5>Policies</h5>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("terms")}>
              Terms &amp; conditions
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("terms")}>
              Privacy policy
            </a>
            <a onClick={() => typeof window !== "undefined" && window.go && window.go("terms")}>
              Enquiry policy
            </a>
          </div>
          <div>
            <h5>Ulavan Santhai</h5>
            <div>
              Agricultural sourcing marketplace.<br />
              Enquiry-only: no cart, no checkout, no delivery promise.
            </div>
          </div>
        </div>
        <div className="cp">© 2026 Ulavan Santhai. Buyer portal prototype.</div>
      </footer>
      <div className="modal" id="m">
        <div className="mb" id="mb"></div>
      </div>
      <div className="toast" id="t"></div>
    </>
  );
}
