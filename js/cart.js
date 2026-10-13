/**
 * BEIT WURUD — Vanilla JS Shopping Cart & WhatsApp Checkout System
 * Persists cart state via localStorage across all pages.
 */

(function () {
  const STORAGE_KEY = "beit_wurud_cart_v1";

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // Ignore storage quota errors in restricted environments
    }
    renderCartUI();
  }

  function findProduct(productId) {
    const list = window.BEIT_WURUD_PRODUCTS || [];
    return list.find((p) => p.id === productId) || null;
  }

  function addToCart(productId, quantity) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = findProduct(productId);
    if (!product) return;

    const cart = getCart();
    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }
    saveCart(cart);
    openCartDrawer();
  }

  function updateQuantity(productId, delta) {
    const cart = getCart();
    const index = cart.findIndex((item) => item.id === productId);
    if (index === -1) return;

    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    saveCart(cart);
  }

  function getTotalCount(cart) {
    return cart.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  }

  function formatPrice(price) {
    if (typeof price === "number" && !isNaN(price)) {
      return "$" + price.toFixed(1).replace(/\.0$/, ".0");
    }
    return "Price on Request";
  }

  function buildWhatsAppUrl(message) {
    const config = window.BEIT_WURUD_CONFIG || {};
    const rawPhone = (config.whatsappNumber || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(message);
    return rawPhone
      ? "https://wa.me/" + rawPhone + "?text=" + encoded
      : "https://wa.me/?text=" + encoded;
  }

  function generateOrderMessage(cart) {
    const lines = ["Hello Beit Wurud! 🌸", "I would like to place an order:"];
    let allPricesAvailable = cart.length > 0;
    let numericTotal = 0;

    cart.forEach((item, idx) => {
      const hasPrice = typeof item.price === "number" && !isNaN(item.price);
      if (hasPrice) {
        const lineTotal = item.price * item.quantity;
        numericTotal += lineTotal;
        lines.push(
          `${idx + 1}. ${item.name} – Quantity: ${item.quantity} ($${lineTotal.toFixed(2)})`
        );
      } else {
        allPricesAvailable = false;
        lines.push(`${idx + 1}. ${item.name} – Quantity: ${item.quantity}`);
      }
    });

    if (allPricesAvailable && numericTotal > 0) {
      lines.push(`Order Total: $${numericTotal.toFixed(2)}`);
    }

    lines.push("Please confirm availability and the total price.");
    lines.push("Thank you!");
    return lines.join("\n");
  }

  function checkoutViaWhatsApp() {
    const cart = getCart();
    if (!cart.length) return;
    const message = generateOrderMessage(cart);
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (drawer && backdrop) {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-backdrop");
    if (drawer && backdrop) {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
    }
  }

  function renderCartUI() {
    const cart = getCart();
    const totalCount = getTotalCount(cart);

    // Update all navbar badges
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = totalCount;
    });

    const itemsContainer = document.getElementById("cart-items-container");
    const summaryItemsEl = document.getElementById("cart-summary-items");
    const summaryTotalEl = document.getElementById("cart-summary-total");
    const checkoutBtn = document.getElementById("cart-whatsapp-checkout");

    if (!itemsContainer) return;

    if (summaryItemsEl) {
      summaryItemsEl.textContent = totalCount + (totalCount === 1 ? " item" : " items");
    }

    // Calculate total price if numeric prices exist
    let hasNumericPrice = false;
    let totalAmount = 0;
    cart.forEach((item) => {
      if (typeof item.price === "number" && !isNaN(item.price)) {
        hasNumericPrice = true;
        totalAmount += item.price * item.quantity;
      }
    });

    if (summaryTotalEl) {
      summaryTotalEl.textContent = hasNumericPrice
        ? "$" + totalAmount.toFixed(2)
        : "Confirmed via WhatsApp";
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = cart.length === 0;
      checkoutBtn.style.opacity = cart.length === 0 ? "0.55" : "1";
      checkoutBtn.style.pointerEvents = cart.length === 0 ? "none" : "auto";
    }

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon" aria-hidden="true">✿</div>
          <p style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--color-olive-deep); margin-bottom: 0.4rem;">Your flower cart is empty</p>
          <p style="font-size: 0.9rem;">Explore our handcrafted bouquets and add your favorites to order via WhatsApp.</p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = `
      <div class="cart-items-list">
        ${cart
          .map(
            (item) => `
          <div class="cart-item" data-cart-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${formatPrice(item.price)}</div>
              <div class="cart-item-qty" aria-label="Quantity controls for ${item.name}">
                <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="cart-qty-value">${item.quantity}</span>
                <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button type="button" class="cart-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart" title="Remove item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  function initCartEvents() {
    // Open/Close Drawer triggers
    document.querySelectorAll("[data-open-cart]").forEach((btn) => {
      btn.addEventListener("click", openCartDrawer);
    });

    document.querySelectorAll("[data-close-cart]").forEach((btn) => {
      btn.addEventListener("click", closeCartDrawer);
    });

    const backdrop = document.getElementById("cart-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeCartDrawer);
    }

    // Delegate inside cart items container
    const itemsContainer = document.getElementById("cart-items-container");
    if (itemsContainer) {
      itemsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");
        if (action === "increase") updateQuantity(id, 1);
        if (action === "decrease") updateQuantity(id, -1);
        if (action === "remove") removeFromCart(id);
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById("cart-whatsapp-checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", checkoutViaWhatsApp);
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCartDrawer();
      }
    });

    renderCartUI();
  }

  // Expose public API
  window.BeitWurudCart = {
    addToCart,
    updateQuantity,
    removeFromCart,
    openCartDrawer,
    closeCartDrawer,
    buildWhatsAppUrl,
    renderCartUI
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCartEvents);
  } else {
    initCartEvents();
  }
})();
