/**
 * BEIT WURUD — Main Interactive UI Controller
 * Handles sticky navigation, mobile hamburger menu, scroll-reveal animations,
 * interior gallery lightbox, flower product rendering, and café menu filtering.
 */

(function () {
  function initStickyNavAndMobileMenu() {
    const header = document.querySelector(".site-header");
    const menuBtn = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("primary-nav-links");

    if (header) {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", () => {
        const expanded = menuBtn.getAttribute("aria-expanded") === "true";
        menuBtn.setAttribute("aria-expanded", String(!expanded));
        navLinks.classList.toggle("open", !expanded);
      });

      // Close mobile menu when a link is clicked
      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          menuBtn.setAttribute("aria-expanded", "false");
          navLinks.classList.remove("open");
        });
      });
    }
  }

  function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal-on-scroll");
    if (!revealEls.length) return;

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  function initGalleryLightbox() {
    const galleryItems = Array.from(document.querySelectorAll("[data-lightbox-src]"));
    const modal = document.getElementById("gallery-lightbox");
    if (!galleryItems.length || !modal) return;

    const modalImg = document.getElementById("lightbox-image");
    const modalCaption = document.getElementById("lightbox-caption");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    let currentIndex = 0;

    function showSlide(index) {
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[currentIndex];
      const src = item.getAttribute("data-lightbox-src");
      const caption = item.getAttribute("data-lightbox-caption") || "";
      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = caption;
      }
      if (modalCaption) {
        modalCaption.textContent = caption;
      }
    }

    function openLightbox(index) {
      showSlide(index);
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }

    galleryItems.forEach((item, idx) => {
      item.addEventListener("click", () => openLightbox(idx));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
      if (e.key === "ArrowRight") showSlide(currentIndex + 1);
    });
  }

  function initFlowersPage() {
    const bouquetsContainer = document.getElementById("bouquets-product-grid");
    if (!bouquetsContainer) return;

    const products = window.BEIT_WURUD_PRODUCTS || [];
    const bouquets = products.filter((p) => p.category === "bouquets");

    bouquetsContainer.innerHTML = bouquets
      .map((product) => {
        const priceDisplay =
          typeof product.price === "number" && !isNaN(product.price)
            ? "$" + product.price.toFixed(2)
            : "Price on Request";

        return `
          <article class="product-card" data-product-id="${product.id}">
            <div class="product-img-container">
              <img src="${product.image}" alt="${product.alt}" class="product-img" loading="lazy" />
              ${
                product.isPlaceholderName
                  ? `<span class="placeholder-badge" title="Temporary editable product name in js/products.js">Editable Placeholder Name</span>`
                  : ""
              }
            </div>
            <div class="product-card-content">
              <span class="product-category-label">${product.categoryLabel}</span>
              <h3 class="product-title">${product.name}</h3>
              <p class="product-desc">${product.description}</p>
              <div class="product-price-row">
                <span class="product-price-label">Price</span>
                <span class="product-price-value">${priceDisplay}</span>
              </div>
              <div class="product-controls">
                <div class="qty-selector" aria-label="Select quantity for ${product.name}">
                  <button type="button" class="qty-btn" data-qty-change="-1" aria-label="Decrease quantity">−</button>
                  <input type="number" class="qty-input" value="1" min="1" max="99" aria-label="Quantity" />
                  <button type="button" class="qty-btn" data-qty-change="1" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="btn btn-primary add-to-cart-btn" data-add-id="${product.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    // Quantity selector & Add to Cart events
    bouquetsContainer.addEventListener("click", (e) => {
      const qtyBtn = e.target.closest("button[data-qty-change]");
      if (qtyBtn) {
        const delta = parseInt(qtyBtn.getAttribute("data-qty-change"), 10);
        const card = qtyBtn.closest(".product-card");
        const input = card ? card.querySelector(".qty-input") : null;
        if (input) {
          const current = parseInt(input.value, 10) || 1;
          input.value = Math.max(1, current + delta);
        }
        return;
      }

      const addBtn = e.target.closest("button[data-add-id]");
      if (addBtn) {
        const productId = addBtn.getAttribute("data-add-id");
        const card = addBtn.closest(".product-card");
        const input = card ? card.querySelector(".qty-input") : null;
        const qty = input ? Math.max(1, parseInt(input.value, 10) || 1) : 1;

        if (window.BeitWurudCart) {
          window.BeitWurudCart.addToCart(productId, qty);
        }

        const labelSpan = addBtn.querySelector("span");
        const originalText = labelSpan ? labelSpan.textContent : "Add to Cart";
        addBtn.classList.add("added");
        if (labelSpan) labelSpan.textContent = "Added to Cart ✓";
        setTimeout(() => {
          addBtn.classList.remove("added");
          if (labelSpan) labelSpan.textContent = originalText;
        }, 1400);
      }
    });

    // Category filter tabs on Flowers page
    const tabBtns = document.querySelectorAll("[data-flower-filter]");
    const categoryBlocks = document.querySelectorAll("[data-flower-section]");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-flower-filter");
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        categoryBlocks.forEach((block) => {
          const sec = block.getAttribute("data-flower-section");
          if (target === "all" || sec === target) {
            block.style.display = "";
          } else {
            block.style.display = "none";
          }
        });
      });
    });
  }

  function initMenuFilterPills() {
    const pills = document.querySelectorAll("[data-menu-filter]");
    const cards = document.querySelectorAll("[data-menu-category]");
    if (!pills.length || !cards.length) return;

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const filter = pill.getAttribute("data-menu-filter");
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        cards.forEach((card) => {
          const cat = card.getAttribute("data-menu-category");
          if (filter === "all" || cat === filter) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  function initWhatsAppLinks() {
    const config = window.BEIT_WURUD_CONFIG || {};

    // Custom Flower Design WhatsApp Button
    document.querySelectorAll("[data-custom-design-whatsapp]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const message =
          config.customDesignPrefillMessage ||
          "Hello Beit Wurud! I would like to request a custom flower design. Could you please help me?";
        const url = window.BeitWurudCart
          ? window.BeitWurudCart.buildWhatsAppUrl(message)
          : "https://wa.me/?text=" + encodeURIComponent(message);
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });

    // General WhatsApp contact buttons in nav & footer
    document.querySelectorAll("[data-general-whatsapp]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const message = "Hello Beit Wurud! 🌸 I would like to inquire about your flowers and café.";
        const url = window.BeitWurudCart
          ? window.BeitWurudCart.buildWhatsAppUrl(message)
          : "https://wa.me/?text=" + encodeURIComponent(message);
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  function init() {
    initStickyNavAndMobileMenu();
    initScrollReveal();
    initGalleryLightbox();
    initFlowersPage();
    initMenuFilterPills();
    initWhatsAppLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
