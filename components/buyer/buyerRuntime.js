import { buyerScripts } from "@/data/buyerScripts";
import { enhanceBuyerModal, enhanceBuyerView } from "@/components/buyer/buyerMobileEnhancements";

export function initBuyerRuntime(initialPage = "home", initialProductId = null) {
  if (typeof window === "undefined") return;

  if (!window.__BUYER_PORTAL_INITIALIZED__) {
    window.__BUYER_PORTAL_INITIALIZED__ = true;

    // Execute scripts in exact sequence 0 -> 1 -> 2 -> 3 -> 4 -> 5
    // exactly as browser executes <script> tags in buyer_final_ui.html
    for (let i = 0; i < buyerScripts.length; i++) {
      const script = document.createElement("script");
      script.text = buyerScripts[i];
      document.head.appendChild(script);
      script.remove();
    }

    if (typeof window.render === "function") {
      const prevRender = window.render;
      window.render = function (...args) {
        const res = prevRender.apply(this, args);
        enhanceBuyerView();
        return res;
      };
    }

    if (typeof window.open_ === "function") {
      const prevOpen = window.open_;
      window.open_ = function (...args) {
        const res = prevOpen.apply(this, args);
        enhanceBuyerModal();
        return res;
      };
    }

    if (!window.__BUYER_MEDIA_BOUND__) {
      window.__BUYER_MEDIA_BOUND__ = true;
      const mq = window.matchMedia("(max-width: 900px)");
      const onViewportCross = () => {
        if (typeof window.render === "function") {
          window.render();
        }
      };
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", onViewportCross);
      }
    }

    enhanceBuyerView();
  } else {
    // Re-render header and main view in case DOM was remounted by React
    if (typeof window.buildHeader === "function") {
      window.buildHeader();
    }
    if (typeof window.render === "function") {
      window.render();
    }
  }

  // Handle route / page navigation
  if (initialPage && typeof window.go === "function") {
    if (initialPage === "product" && initialProductId && typeof window.view === "function") {
      window.view(initialProductId);
    } else if (window.S && window.S.page !== initialPage) {
      window.go(initialPage);
    }
  }
}
