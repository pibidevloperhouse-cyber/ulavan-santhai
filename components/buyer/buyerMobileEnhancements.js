"use client";

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth <= 900;
}

function enhanceNotifications(root) {
  if (window.S?.page !== "notifs") return;

  const chips = root.querySelector(":scope > .chips");
  const markBtn = chips?.querySelector("button.btn");
  const h1 = root.querySelector(":scope > h1");

  if (h1 && markBtn && !root.querySelector(":scope > .m-notif-head")) {
    const head = document.createElement("div");
    head.className = "m-notif-head";
    h1.parentNode.insertBefore(head, h1);
    head.appendChild(h1);
    markBtn.classList.add("m-mark-read");
    head.appendChild(markBtn);
  }

  root.querySelectorAll(":scope > .card").forEach((card) => {
    if (card.querySelector(".nt")) {
      card.classList.add("m-notif-card");
    }
  });
}

function enhanceAccessPage(root) {
  if (window.S?.page !== "access") return;

  root.classList.add("m-access-page");

  root.querySelectorAll(":scope > .card").forEach((card) => {
    card.classList.add("m-access-card");

    const addBtn = card.querySelector('button[onclick*="pay2"]');
    if (addBtn) {
      addBtn.classList.add("m-access-cta");
    }

    const table = card.querySelector("table");
    if (table && !table.parentElement.classList.contains("m-pay-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "m-pay-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }

    if (table) {
      table.classList.add("m-pay-table");
      table.querySelectorAll("tr").forEach((row, rowIndex) => {
        if (rowIndex === 0 && row.querySelector("th")) {
          row.classList.add("m-pay-head-row");
          return;
        }
        row.classList.add("m-pay-row");
      });
    }
  });
}

function enhanceProductDetail(root) {
  if (window.S?.page !== "product") return;

  const azc = root.querySelector(".azc");
  if (!azc) return;

  const qtyChip = azc.querySelector(".pl");
  if (qtyChip?.parentElement) {
    qtyChip.parentElement.classList.add("m-qty-grid");
  }

  const rtl = azc.querySelector(":scope > .rtl");
  const firstHr = azc.querySelector(":scope > hr");
  if (rtl && firstHr && !azc.querySelector(":scope > .m-prod-badges")) {
    const badges = [];
    let cur = rtl.nextSibling;
    while (cur && cur !== firstHr) {
      if (cur.nodeType === 1 && (cur.matches("a") || cur.classList?.contains("tag"))) {
        badges.push(cur);
      }
      cur = cur.nextSibling;
    }
    if (badges.length) {
      const wrap = document.createElement("div");
      wrap.className = "m-prod-badges";
      rtl.after(wrap);
      badges.forEach((node) => wrap.appendChild(node));
    }
  }
}

function enhanceHome(root) {
  if (window.S?.page !== "home") return;

  root.querySelectorAll(":scope > .sx").forEach((heading) => {
    const nextGrid = heading.nextElementSibling;
    if (nextGrid?.classList.contains("grid") && nextGrid.children.length === 0) {
      heading.style.display = "none";
      nextGrid.style.display = "none";
    }
  });
}

function enhanceDiscover(root) {
  if (window.S?.page !== "discover") return;

  const sideChips = root.querySelector(".fside .ap");
  const clearAll = root.querySelector(".fside h4 a");
  const sortBar = root.querySelector(".rs > .so");

  if (sortBar && sideChips && !root.querySelector(".rs > .m-active-filters")) {
    const strip = document.createElement("div");
    strip.className = "ap m-active-filters";
    strip.innerHTML = sideChips.innerHTML;
    if (clearAll) {
      strip.insertAdjacentHTML("beforeend", clearAll.outerHTML);
    }
    sortBar.after(strip);
  }
}

function closeSelectSheet() {
  const existing = document.getElementById("m-sel-sheet");
  if (existing) existing.remove();
  if (window.__M_SEL_ESC__) {
    document.removeEventListener("keydown", window.__M_SEL_ESC__);
    window.__M_SEL_ESC__ = null;
  }
}

function openSelectSheet(select, btnLabel) {
  closeSelectSheet();

  const backdrop = document.createElement("div");
  backdrop.id = "m-sel-sheet";
  backdrop.className = "m-sel-backdrop";

  const sheet = document.createElement("div");
  sheet.className = "m-sel-panel";

  const fieldLabel =
    select.closest("div")?.querySelector("label")?.textContent?.trim() || "Choose an option";

  const head = document.createElement("div");
  head.className = "m-sel-head";
  const title = document.createElement("b");
  title.textContent = fieldLabel;
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "m-sel-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", closeSelectSheet);
  head.append(title, closeBtn);

  const list = document.createElement("div");
  list.className = "m-sel-list";

  Array.from(select.options).forEach((opt, idx) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `m-sel-opt${idx === select.selectedIndex ? " on" : ""}`;

    const textSpan = document.createElement("span");
    textSpan.textContent = opt.textContent;
    const check = document.createElement("span");
    check.className = "m-sel-ck";
    check.textContent = idx === select.selectedIndex ? "✓" : "";

    item.append(textSpan, check);
    item.addEventListener("click", () => {
      select.selectedIndex = idx;
      select.value = opt.value;
      btnLabel.textContent = opt.textContent;
      closeSelectSheet();
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    list.appendChild(item);
  });

  sheet.append(head, list);
  backdrop.appendChild(sheet);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeSelectSheet();
  });

  window.__M_SEL_ESC__ = (e) => {
    if (e.key === "Escape") closeSelectSheet();
  };
  document.addEventListener("keydown", window.__M_SEL_ESC__);

  document.body.appendChild(backdrop);
}

function enhanceMobileSelects(container) {
  container.querySelectorAll("select").forEach((select) => {
    if (select.dataset.mSelBound === "1") return;
    select.dataset.mSelBound = "1";

    const wrap = document.createElement("div");
    wrap.className = "m-sel-wrap";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add("m-sel-native");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "m-sel-btn";
    const span = document.createElement("span");
    span.textContent = select.options[select.selectedIndex]?.textContent || "Select";
    btn.appendChild(span);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSelectSheet(select, span);
    });

    wrap.appendChild(btn);
  });
}

function enhanceEnquiries(root) {
  if (window.S?.page !== "enquiries") return;

  const viewBtn = root.querySelector(".chp .btn");
  if (viewBtn && window.innerWidth <= 420) {
    viewBtn.textContent = "View";
    viewBtn.setAttribute("aria-label", "View product");
  }
}

function enhanceProfile(root) {
  if (window.S?.page !== "profile") return;

  root.classList.add("m-profile-page");

  const cards = root.querySelectorAll(":scope > .card");
  cards.forEach((card, idx) => {
    if (idx === 0 && !card.querySelector(".f2")) {
      card.classList.add("m-prof-nav");
      return;
    }
    card.classList.add("m-prof-card");
  });

  const businessCard = root.querySelector(":scope > .card.m-prof-card");
  if (businessCard && !businessCard.querySelector(".m-check-group")) {
    const inlineChecks = Array.from(
      businessCard.querySelectorAll(':scope > label:has(input[type="checkbox"])')
    );
    if (inlineChecks.length) {
      const group = document.createElement("div");
      group.className = "m-check-group";
      inlineChecks[0].before(group);
      inlineChecks.forEach((lbl) => {
        lbl.removeAttribute("style");
        group.appendChild(lbl);
      });
    }
  }

  const accountCard = cards[cards.length - 1];
  if (accountCard) {
    accountCard.querySelectorAll(":scope > p").forEach((p) => {
      if (p.querySelector(".tag")) {
        p.classList.add("m-verify-row");
      } else if (p.querySelector('input[type="checkbox"]')) {
        p.classList.add("m-check-group");
      } else if (p.querySelector("a")) {
        p.classList.add("m-prof-links");
      }
    });

    const bottomBtns = Array.from(accountCard.querySelectorAll(":scope > button.btn")).filter(
      (b) => !b.previousElementSibling?.classList?.contains("f2")
    );
    if (bottomBtns.length >= 2 && !accountCard.querySelector(".m-prof-actions")) {
      const wrap = document.createElement("div");
      wrap.className = "m-prof-actions";
      bottomBtns[0].before(wrap);
      bottomBtns.forEach((btn) => wrap.appendChild(btn));
    }
  }

  enhanceMobileSelects(root);
}

export function enhanceBuyerView() {
  if (typeof window === "undefined") return;
  const root = document.getElementById("v");
  if (!root) return;

  root.classList.remove("m-access-page", "m-profile-page");
  closeSelectSheet();
  enhanceHome(root);

  if (isMobileViewport()) {
    enhanceNotifications(root);
    enhanceAccessPage(root);
    enhanceProductDetail(root);
    enhanceDiscover(root);
    enhanceEnquiries(root);
    enhanceProfile(root);
  }
}

export function enhanceBuyerModal() {
  if (typeof window === "undefined" || !isMobileViewport()) return;
  const mb = document.getElementById("mb");
  if (!mb) return;

  enhanceMobileSelects(mb);

  const slotRow = mb.querySelector(".slot > div:first-child");
  if (slotRow) {
    slotRow.classList.add("m-slot-row");
  }
}
