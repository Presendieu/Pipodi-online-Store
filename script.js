// ===== Configuration de la boutique =====
const STORE = {
  name: "Pipodi Store",
  whatsapp: "50948262051", // numéro WhatsApp au format international, sans + ni espaces
  phone: "+509 4826-2051",
  email: "contact@pipodistore.com",
  address: "56 Route de Frères, Puits-Blain 24, Pétion-Ville",
  hours: "Lun – Sam : 8h00 – 17h00",
  currency: "USD",
  payments: ["MonCash", "NatCash", "Espèces"],
  socials: {
    facebook: "#",
    instagram: "#",
    tiktok: "#",
  },
};

// Le menu affiche « Tout » puis une entrée par catégorie (voir CATEGORIES dans products.js)
const NAV_LINKS = [
  { href: "shop.html", label: "Tout", cat: "all" },
  ...Object.entries(CATEGORIES).map(([key, label]) => ({
    href: `shop.html?cat=${key}`,
    label,
    cat: key,
  })),
];

const CART_KEY = "pipodi-cart";
const FAVS_KEY = "pipodi-favs";

// ===== Utilitaires =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const formatPrice = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: STORE.currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

const imgSrc = (path) => encodeURI(path);

const whatsappLink = (text) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;

const readStore = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const currentCat = page === "shop" ? params.get("cat") || "all" : null;

// ===== En-tête, barre mobile & pied de page (communs à toutes les pages) =====
function renderHeader() {
  const el = $("#site-header");
  if (!el) return;

  el.innerHTML = `
    <div class="topbar">
      <p><i class="fa-solid fa-truck-fast"></i> Livraison partout en Haïti<span class="topbar-extra"> · Commandez facilement sur WhatsApp</span></p>
    </div>
    <nav class="nav container">
      <a href="index.html" class="nav-logo" aria-label="Accueil Pipodi Store">
        <img src="img/logo.png" alt="Pipodi Store" />
      </a>
      <ul class="nav-links">
        ${NAV_LINKS.map(
          (l) =>
            `<li><a href="${l.href}" data-nav-cat="${l.cat}" class="${l.cat === currentCat ? "active" : ""}">${l.label}</a></li>`
        ).join("")}
      </ul>
      <div class="nav-actions">
        <a href="shop.html#search" class="icon-btn" aria-label="Rechercher"><i class="fa-solid fa-magnifying-glass"></i></a>
        <a href="shop.html?cat=favs" class="icon-btn" aria-label="Favoris">
          <i class="fa-regular fa-heart"></i>
          <span class="count fav-count" hidden>0</span>
        </a>
        <button class="icon-btn" data-open-cart aria-label="Ouvrir le panier">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="count cart-count" hidden>0</span>
        </button>
      </div>
    </nav>
  `;

  const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function renderBottomNav() {
  const isSearch = location.hash === "#search";
  const items = [
    { href: "index.html", icon: "fa-house", label: "Accueil", active: page === "home" },
    { href: "shop.html", icon: "fa-store", label: "Boutique", active: page === "shop" && currentCat !== "favs" && !isSearch },
    { href: "shop.html#search", icon: "fa-magnifying-glass", label: "Recherche", active: isSearch },
    { href: "shop.html?cat=favs", icon: "fa-heart", label: "Favoris", active: currentCat === "favs", badge: "fav-count" },
  ];
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Navigation principale");
  nav.innerHTML =
    items
      .map(
        (i) => `
      <a href="${i.href}" class="${i.active ? "active" : ""}">
        <span class="bn-icon"><i class="fa-solid ${i.icon}"></i>${i.badge ? `<span class="count ${i.badge}" hidden>0</span>` : ""}</span>
        ${i.label}
      </a>`
      )
      .join("") +
    `<button data-open-cart>
        <span class="bn-icon"><i class="fa-solid fa-bag-shopping"></i><span class="count cart-count" hidden>0</span></span>
        Panier
      </button>`;
  document.body.appendChild(nav);
}

function renderFooter() {
  const el = $("#site-footer");
  if (!el) return;
  const year = new Date().getFullYear();

  el.innerHTML = `
    <div class="footer-main container">
      <div class="footer-col footer-brand">
        <img src="img/logo.png" alt="Pipodi Store" class="footer-logo" />
        <p>Votre boutique en ligne en Haïti : mode, chaussures, accessoires et électronique, livrés chez vous.</p>
        <div class="socials">
          <a href="${STORE.socials.facebook}" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="${STORE.socials.instagram}" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="${STORE.socials.tiktok}" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
          <a href="${whatsappLink("Bonjour Pipodi Store")}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Boutique</h4>
        ${Object.entries(CATEGORIES)
          .map(([key, label]) => `<a href="shop.html?cat=${key}">${label}</a>`)
          .join("")}
      </div>
      <div class="footer-col">
        <h4>Aide</h4>
        <a href="#" data-open-cart>Mon panier</a>
        <a href="shop.html?cat=favs">Mes favoris</a>
        <a href="${whatsappLink("Bonjour, j'ai une question sur ma commande.")}" target="_blank" rel="noopener">Suivre ma commande</a>
        <a href="${whatsappLink("Bonjour, je voudrais commander un article (lien) :")}" target="_blank" rel="noopener">Commande spéciale</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <p><i class="fa-solid fa-location-dot"></i> ${STORE.address}</p>
        <p><i class="fa-solid fa-phone"></i> <a href="tel:${STORE.phone.replace(/[^+\d]/g, "")}">${STORE.phone}</a></p>
        <p><i class="fa-solid fa-envelope"></i> <a href="mailto:${STORE.email}">${STORE.email}</a></p>
        <p><i class="fa-solid fa-clock"></i> ${STORE.hours}</p>
      </div>
    </div>
    <div class="footer-bottom container">
      <p>© ${year} ${STORE.name}. Tous droits réservés.</p>
      <p class="pay-methods">
        <span>Paiement :</span>
        ${STORE.payments.map((m) => `<span class="pay-chip">${m}</span>`).join("")}
      </p>
    </div>
    <a class="wa-float" href="${whatsappLink("Bonjour Pipodi Store 👋")}" target="_blank" rel="noopener" aria-label="Nous écrire sur WhatsApp">
      <i class="fa-brands fa-whatsapp"></i>
    </a>
  `;
}

// ===== Favoris =====
const getFavs = () => readStore(FAVS_KEY).filter((id) => getProduct(id));
const isFav = (id) => getFavs().includes(id);

function toggleFav(id) {
  const favs = getFavs();
  const added = !favs.includes(id);
  writeStore(FAVS_KEY, added ? [...favs, id] : favs.filter((f) => f !== id));
  updateFavButtons();
  updateCounts();
  showToast(
    added
      ? `<i class="fa-solid fa-heart"></i> Ajouté aux favoris`
      : `<i class="fa-regular fa-heart"></i> Retiré des favoris`,
    added ? { href: "shop.html?cat=favs", label: "Voir" } : null
  );
  document.dispatchEvent(new Event("favs:change"));
}

function favButton(id, extraClass = "") {
  const on = isFav(id);
  return `<button class="fav-btn ${extraClass} ${on ? "active" : ""}" data-fav="${id}" aria-pressed="${on}" aria-label="Ajouter aux favoris">
    <i class="fa-${on ? "solid" : "regular"} fa-heart"></i>
  </button>`;
}

function updateFavButtons() {
  const favs = getFavs();
  $$("[data-fav]").forEach((b) => {
    const on = favs.includes(b.dataset.fav);
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
    b.innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-heart"></i>`;
  });
}

// ===== Panier =====
const getCart = () => readStore(CART_KEY).filter((i) => getProduct(i.id));

function saveCart(items) {
  writeStore(CART_KEY, items);
  updateCounts();
}

function addToCart(id, qty = 1, size = null) {
  const items = getCart();
  const existing = items.find((i) => i.id === id && i.size === size);
  if (existing) existing.qty += qty;
  else items.push({ id, qty, size });
  saveCart(items);
  $$(".cart-count").forEach((b) => {
    b.classList.remove("bump");
    void b.offsetWidth;
    b.classList.add("bump");
  });
  openCart();
}

function updateCounts() {
  const cartCount = getCart().reduce((sum, i) => sum + i.qty, 0);
  const favCount = getFavs().length;
  $$(".cart-count").forEach((b) => {
    b.textContent = cartCount;
    b.hidden = cartCount === 0;
  });
  $$(".fav-count").forEach((b) => {
    b.textContent = favCount;
    b.hidden = favCount === 0;
  });
}

// ===== Tiroir panier =====
function renderCartDrawer() {
  const overlay = document.createElement("div");
  overlay.className = "drawer-overlay";
  overlay.dataset.closeCart = "";
  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.id = "cart-drawer";
  drawer.setAttribute("aria-label", "Panier");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="drawer-head">
      <h2>Mon panier <span id="drawer-count"></span></h2>
      <button class="icon-btn" data-close-cart aria-label="Fermer le panier"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="drawer-body" id="drawer-body"></div>
    <div class="drawer-foot" id="drawer-foot"></div>
  `;
  document.body.append(overlay, drawer);

  drawer.addEventListener("click", (e) => {
    const step = e.target.closest("[data-delta]");
    const remove = e.target.closest("[data-remove]");
    if (!step && !remove) return;
    const items = getCart();
    if (step) {
      const item = items[step.dataset.idx];
      item.qty += Number(step.dataset.delta);
      if (item.qty < 1) items.splice(step.dataset.idx, 1);
    } else {
      items.splice(remove.dataset.remove, 1);
    }
    saveCart(items);
    fillCartDrawer();
  });
}

function fillCartDrawer() {
  const body = $("#drawer-body");
  const foot = $("#drawer-foot");
  const items = getCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  $("#drawer-count").textContent = count ? `(${count})` : "";

  if (!items.length) {
    body.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et ajoutez vos coups de cœur.</p>
        <a href="shop.html" class="btn btn-primary">Voir la boutique</a>
      </div>`;
    foot.innerHTML = "";
    return;
  }

  const total = items.reduce((sum, i) => sum + getProduct(i.id).price * i.qty, 0);
  const message =
    "Bonjour Pipodi Store, je voudrais commander :\n" +
    items
      .map((i) => {
        const p = getProduct(i.id);
        return `• ${p.name}${i.size ? ` (taille ${i.size})` : ""} × ${i.qty} – ${formatPrice(p.price * i.qty)}`;
      })
      .join("\n") +
    `\n\nTotal : ${formatPrice(total)}`;

  body.innerHTML = items
    .map((i, idx) => {
      const p = getProduct(i.id);
      return `
      <div class="cart-item">
        <a href="sproduct.html?id=${p.id}"><img src="${imgSrc(p.image)}" alt="${p.name}" /></a>
        <div class="ci-info">
          <a href="sproduct.html?id=${p.id}" class="ci-name">${p.name}</a>
          <span class="ci-meta">${p.brand}${i.size ? ` · Taille ${i.size}` : ""}</span>
          <div class="qty qty-sm">
            <button type="button" data-idx="${idx}" data-delta="-1" aria-label="Diminuer">−</button>
            <span>${i.qty}</span>
            <button type="button" data-idx="${idx}" data-delta="1" aria-label="Augmenter">+</button>
          </div>
        </div>
        <div class="ci-side">
          <button class="ci-remove" data-remove="${idx}" aria-label="Retirer"><i class="fa-regular fa-trash-can"></i></button>
          <strong>${formatPrice(p.price * i.qty)}</strong>
        </div>
      </div>`;
    })
    .join("");

  foot.innerHTML = `
    <div class="row"><span>Livraison</span><span>Calculée sur WhatsApp</span></div>
    <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    <a class="btn btn-whatsapp btn-block" href="${whatsappLink(message)}" target="_blank" rel="noopener">
      <i class="fa-brands fa-whatsapp"></i> Commander sur WhatsApp
    </a>
    <p class="small">Nous confirmons la disponibilité, la livraison et le paiement avec vous sur WhatsApp.</p>
  `;
}

function openCart() {
  fillCartDrawer();
  document.body.classList.add("drawer-open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  $("#cart-drawer [data-close-cart]").focus({ preventScroll: true });
}

function closeCart() {
  document.body.classList.remove("drawer-open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
}

// ===== Notifications =====
let toastTimer;
function showToast(html, action) {
  let toast = $("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${html}</span>${
    action ? `<a href="${action.href}">${action.label}</a>` : ""
  }`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// ===== Cartes produit =====
function productCard(p) {
  const badgeClass = { Promo: "badge-promo", Nouveau: "badge-new" }[p.badge] || "";
  return `
    <article class="product-card reveal">
      <div class="product-media">
        <a href="sproduct.html?id=${p.id}" tabindex="-1" aria-hidden="true">
          <img src="${imgSrc(p.image)}" alt="" loading="lazy" />
        </a>
        ${p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : ""}
        ${favButton(p.id)}
      </div>
      <div class="product-info">
        <span class="product-brand">${p.brand}</span>
        <h3 class="product-name"><a href="sproduct.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-bottom">
          <p class="product-price">
            ${formatPrice(p.price)}
            ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ""}
          </p>
          <button class="add-btn" data-add="${p.id}" aria-label="Ajouter ${p.name} au panier">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderProductGrids() {
  $$("[data-products]").forEach((grid) => {
    const tag = grid.dataset.products;
    const limit = Number(grid.dataset.limit) || 8;
    let list = PRODUCTS.filter((p) => p.tags && p.tags.includes(tag));
    if (tag === "related") {
      const current = params.get("id");
      const cur = getProduct(current);
      list = PRODUCTS.filter((p) => p.id !== current && (!cur || p.category === cur.category));
      if (list.length < limit) list = list.concat(PRODUCTS.filter((p) => p.id !== current && !list.includes(p)));
    }
    grid.innerHTML = list.slice(0, limit).map(productCard).join("");
  });
}

// ===== Clics globaux (délégation) =====
document.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.preventDefault();
    toggleFav(fav.dataset.fav);
    return;
  }
  if (e.target.closest("[data-open-cart]")) {
    e.preventDefault();
    openCart();
    return;
  }
  if (e.target.closest("[data-close-cart]")) {
    closeCart();
    return;
  }
  const add = e.target.closest("[data-add]");
  if (add) {
    e.preventDefault();
    const p = getProduct(add.dataset.add);
    // Les produits avec tailles passent par la fiche produit pour choisir la taille
    if (p.sizes && p.sizes.length) location.href = `sproduct.html?id=${p.id}`;
    else addToCart(p.id);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("drawer-open")) closeCart();
});

// ===== Page Boutique =====
function initShop() {
  const grid = $("#shop-grid");
  if (!grid) return;

  const state = { cat: currentCat, q: "", sort: "default" };

  const chips = $("#filter-chips");
  chips.innerHTML = [["all", "Tout"], ...Object.entries(CATEGORIES), ["favs", `<i class="fa-solid fa-heart"></i> Favoris`]]
    .map(([key, label]) => `<button class="chip" data-cat="${key}">${label}</button>`)
    .join("");

  const emptyState = () =>
    state.cat === "favs" && !state.q
      ? `<div class="empty-state"><i class="fa-regular fa-heart"></i><h2>Aucun favori pour l'instant</h2><p>Touchez le cœur sur un produit pour le retrouver ici.</p><button class="btn btn-primary" data-cat-go="all">Parcourir la boutique</button></div>`
      : `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>Aucun produit trouvé. Vous cherchez quelque chose de précis ?</p><a class="btn btn-primary" href="${whatsappLink(`Bonjour, je cherche : ${state.q}`)}" target="_blank" rel="noopener">Demandez-nous sur WhatsApp</a></div>`;

  const render = () => {
    const q = state.q.trim().toLowerCase();
    const favs = getFavs();
    let list = PRODUCTS.filter(
      (p) =>
        (state.cat === "all" || p.category === state.cat || (state.cat === "favs" && favs.includes(p.id))) &&
        (!q || `${p.name} ${p.brand} ${CATEGORIES[p.category]}`.toLowerCase().includes(q))
    );
    if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

    $$(".chip", chips).forEach((c) => c.classList.toggle("active", c.dataset.cat === state.cat));
    $$("[data-nav-cat]").forEach((a) => a.classList.toggle("active", a.dataset.navCat === state.cat));
    $("#result-count").textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`;
    grid.innerHTML = list.length ? list.map(productCard).join("") : emptyState();
    observeReveal();
  };

  const setCat = (cat) => {
    state.cat = cat;
    const url = new URL(location);
    if (cat === "all") url.searchParams.delete("cat");
    else url.searchParams.set("cat", cat);
    history.replaceState(null, "", url);
    render();
  };

  chips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) setCat(chip.dataset.cat);
  });
  grid.addEventListener("click", (e) => {
    const go = e.target.closest("[data-cat-go]");
    if (go) setCat(go.dataset.catGo);
  });
  $("#search").addEventListener("input", (e) => {
    state.q = e.target.value;
    render();
  });
  $("#sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
  document.addEventListener("favs:change", () => state.cat === "favs" && render());
  if (location.hash === "#search") $("#search").focus();
  render();
}

// ===== Fiche produit =====
function initProductPage() {
  const el = $("#product-detail");
  if (!el) return;

  const p = getProduct(params.get("id")) || PRODUCTS[0];
  document.title = `${p.name} | ${STORE.name}`;

  el.innerHTML = `
    <div class="pd-media">
      <img src="${imgSrc(p.image)}" alt="${p.name}" />
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      ${favButton(p.id, "fav-btn-lg")}
    </div>
    <div class="pd-info">
      <nav class="breadcrumb">
        <a href="index.html">Accueil</a> /
        <a href="shop.html?cat=${p.category}">${CATEGORIES[p.category]}</a> /
        <span>${p.name}</span>
      </nav>
      <span class="product-brand">${p.brand}</span>
      <h1>${p.name}</h1>
      <p class="pd-price">${formatPrice(p.price)} ${p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : ""}</p>
      <p class="pd-desc">${p.description}</p>
      ${
        p.sizes
          ? `<div class="pd-field">
              <label>Taille</label>
              <div class="size-options">
                ${p.sizes.map((s) => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join("")}
              </div>
            </div>`
          : ""
      }
      <div class="pd-field">
        <label for="qty">Quantité</label>
        <div class="qty">
          <button type="button" data-step="-1" aria-label="Diminuer">−</button>
          <input id="qty" type="number" min="1" value="1" />
          <button type="button" data-step="1" aria-label="Augmenter">+</button>
        </div>
      </div>
      <div class="pd-actions">
        <button class="btn btn-primary" id="pd-add"><i class="fa-solid fa-bag-shopping"></i> Ajouter au panier</button>
        <a class="btn btn-whatsapp" id="pd-wa" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Commander sur WhatsApp</a>
      </div>
      <ul class="pd-perks">
        <li><i class="fa-solid fa-truck-fast"></i> Livraison partout en Haïti</li>
        <li><i class="fa-solid fa-shield-halved"></i> Produits vérifiés avant livraison</li>
        <li><i class="fa-solid fa-mobile-screen"></i> Paiement : ${STORE.payments.join(", ")}</li>
      </ul>
    </div>
  `;

  let size = null;
  const qtyInput = $("#qty");
  const qty = () => Math.max(1, parseInt(qtyInput.value, 10) || 1);

  const updateWa = () => {
    $("#pd-wa").href = whatsappLink(
      `Bonjour Pipodi Store, je voudrais commander :\n• ${p.name}${size ? ` (taille ${size})` : ""} × ${qty()} – ${formatPrice(p.price * qty())}`
    );
  };

  $$(".size-btn", el).forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size;
      $$(".size-btn", el).forEach((x) => x.classList.toggle("active", x === b));
      $(".size-options").classList.remove("error");
      updateWa();
    })
  );
  $$("[data-step]", el).forEach((b) =>
    b.addEventListener("click", () => {
      qtyInput.value = Math.max(1, qty() + Number(b.dataset.step));
      updateWa();
    })
  );
  qtyInput.addEventListener("input", updateWa);

  const needsSize = () => {
    if (p.sizes && !size) {
      $(".size-options").classList.add("error");
      showToast(`<i class="fa-solid fa-circle-exclamation"></i> Choisissez une taille`);
      return true;
    }
    return false;
  };
  $("#pd-add").addEventListener("click", () => {
    if (!needsSize()) addToCart(p.id, qty(), size);
  });
  $("#pd-wa").addEventListener("click", (e) => {
    if (needsSize()) e.preventDefault();
  });
  updateWa();
}

// ===== Animations d'apparition au défilement =====
let revealObserver;
function observeReveal() {
  if (!("IntersectionObserver" in window)) {
    $$(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }
  revealObserver =
    revealObserver ||
    new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
  $$(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));
}

// ===== Démarrage =====
renderHeader();
renderBottomNav();
renderFooter();
renderCartDrawer();
renderProductGrids();
initShop();
initProductPage();
updateCounts();
observeReveal();
window.addEventListener("storage", (e) => {
  if (e.key === CART_KEY || e.key === FAVS_KEY) {
    updateCounts();
    updateFavButtons();
  }
});
