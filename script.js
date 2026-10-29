// ===== Configuration de la boutique =====
const STORE = {
  name: "Pipodi Store",
  whatsapp: "50948262051", // numéro WhatsApp au format international, sans + ni espaces
  phone: "+509 4826-2051",
  email: "contact@pipodistore.com",
  address: "56 Route de Frères, Puits-Blain 24, Pétion-Ville",
  hours: "Lun – Sam : 8h00 – 17h00",
  payments: ["MonCash", "NatCash", "Espèces"],
  htgRate: 132, // 1 USD = 132 HTG — à mettre à jour selon le taux du jour
  delivery: {
    inStock: "2 à 3 jours", // délai pour un article en stock
    onOrder: "10 à 15 jours", // délai pour un article commandé à l'étranger
    zones: "Port-au-Prince et ses environs. Autres villes : contactez-nous sur WhatsApp.",
  },
  returns:
    "Vous pouvez échanger un article dans les 3 jours suivant la livraison s'il est défectueux ou ne correspond pas à votre commande. L'article doit être neuf, non porté et dans son emballage d'origine.",
  socials: {
    facebook: "#",
    instagram: "#",
    tiktok: "#",
  },
};

// Questions fréquentes (accueil)
const FAQ = [
  {
    q: "Comment passer commande ?",
    a: "Ajoutez vos articles au panier puis touchez « Commander sur WhatsApp » : votre commande nous est envoyée automatiquement. Nous vous répondons pour confirmer la disponibilité, le prix de livraison et le paiement.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: `Article en stock : ${STORE.delivery.inStock}. Article sur commande (Shein, Amazon, Zara…) : ${STORE.delivery.onOrder}.`,
  },
  { q: "Où livrez-vous ?", a: STORE.delivery.zones },
  {
    q: "Comment puis-je payer ?",
    a: `Nous acceptons : ${STORE.payments.join(", ")}. Le paiement se fait à la commande ou à la livraison selon l'article ; nous vous l'indiquons sur WhatsApp.`,
  },
  {
    q: "Pouvez-vous commander un article qui n'est pas sur le site ?",
    a: "Oui ! Envoyez-nous le lien de l'article (Shein, Amazon, Zara, eBay…) sur WhatsApp : nous vous donnons le prix livré en Haïti.",
  },
  { q: "Puis-je échanger ou retourner un article ?", a: STORE.returns },
];

// Guides des tailles (valeurs indicatives)
const SIZE_GUIDES = {
  chaussures: {
    title: "Guide des tailles – Chaussures",
    head: ["EU", "US Homme", "US Femme", "Longueur du pied"],
    rows: [
      ["36", "4", "5,5", "22,5 cm"],
      ["37", "5", "6,5", "23,2 cm"],
      ["38", "5,5", "7", "23,9 cm"],
      ["39", "6,5", "8", "24,6 cm"],
      ["40", "7", "8,5", "25,2 cm"],
      ["41", "8", "9,5", "25,9 cm"],
      ["42", "8,5", "10", "26,6 cm"],
      ["43", "9,5", "11", "27,3 cm"],
      ["44", "10", "11,5", "27,9 cm"],
      ["45", "11", "12,5", "28,6 cm"],
    ],
    kids: {
      head: ["EU", "US Enfant", "Longueur du pied"],
      rows: [
        ["24", "8C", "14,5 cm"],
        ["25", "8,5C", "15,2 cm"],
        ["26", "9,5C", "16 cm"],
        ["27", "10C", "16,5 cm"],
        ["28", "11C", "17,2 cm"],
        ["29", "11,5C", "17,8 cm"],
        ["30", "12,5C", "18,5 cm"],
      ],
    },
    tip: "Mesurez votre pied du talon au gros orteil, en fin de journée. Entre deux tailles, prenez la plus grande.",
  },
  vetements: {
    title: "Guide des tailles – Vêtements",
    head: ["Taille", "Tour de poitrine", "Tour de taille"],
    rows: [
      ["XS", "80 – 84 cm", "64 – 68 cm"],
      ["S", "86 – 90 cm", "70 – 74 cm"],
      ["M", "92 – 96 cm", "76 – 80 cm"],
      ["L", "98 – 102 cm", "82 – 86 cm"],
      ["XL", "104 – 108 cm", "88 – 92 cm"],
      ["XXL", "110 – 114 cm", "94 – 98 cm"],
    ],
    tip: "Les tailles varient selon les marques (Shein taille souvent petit). En cas de doute, demandez-nous sur WhatsApp.",
  },
};

// Le menu affiche « Accueil », « Tout » puis une entrée par catégorie (voir CATEGORIES dans products.js)
const NAV_LINKS = [
  { href: "index.html", label: "Accueil", cat: "home" },
  { href: "shop.html", label: "Tout", cat: "all" },
  ...Object.entries(CATEGORIES).map(([key, label]) => ({
    href: `shop.html?cat=${key}`,
    label,
    cat: key,
  })),
];

const CART_KEY = "pipodi-cart";
const FAVS_KEY = "pipodi-favs";
const CURRENCY_KEY = "pipodi-currency";
const THEME_KEY = "pipodi-theme";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Utilitaires =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const readStore = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

let currency = readStore(CURRENCY_KEY, "USD") === "HTG" ? "HTG" : "USD";

// Les prix sont saisis en USD dans products.js et convertis à l'affichage
const formatPrice = (usd) => {
  if (currency === "HTG") {
    return `${Math.round(usd * STORE.htgRate).toLocaleString("fr-FR")} HTG`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(usd) ? 0 : 2,
  }).format(usd);
};

// Prix qui se met à jour tout seul quand on change de devise
const priceTag = (usd, tag = "span") => `<${tag} data-price="${usd}">${formatPrice(usd)}</${tag}>`;

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

const imgSrc = (path) => encodeURI(path);

const whatsappLink = (text) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;

const itemLabel = (p, i) =>
  `${p.name}${i.color ? ` – ${i.color}` : ""}${i.size ? ` (taille ${i.size})` : ""}`;

const availability = (p) =>
  p.inStock
    ? { cls: "in-stock", label: "En stock", delay: STORE.delivery.inStock }
    : { cls: "on-order", label: "Sur commande", delay: STORE.delivery.onOrder };

const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const currentCat = page === "shop" ? params.get("cat") || "all" : null;

// ===== En-tête, barre mobile & pied de page (communs à toutes les pages) =====
function renderHeader() {
  const el = $("#site-header");
  if (!el) return;

  el.innerHTML = `
    <nav class="nav">
      <a href="index.html" class="nav-logo" aria-label="Accueil Pipodi Store">
        <img src="img/logo.png" alt="Pipodi Store" />
      </a>
      <ul class="nav-links">
        ${NAV_LINKS.map(
          (l) =>
            `<li><a href="${l.href}" data-nav-cat="${l.cat}" class="${(l.cat === "home" ? page === "home" : l.cat === currentCat) ? "active" : ""}">${l.label}</a></li>`
        ).join("")}
      </ul>
      <div class="nav-actions">
        <a href="shop.html#search" class="icon-btn desktop-only" aria-label="Rechercher"><i class="fa-solid fa-magnifying-glass"></i></a>
        <a href="shop.html?cat=favs" class="icon-btn desktop-only" aria-label="Favoris">
          <i class="fa-regular fa-heart"></i>
          <span class="count fav-count" hidden>0</span>
        </a>
        <button class="icon-btn" data-theme-toggle aria-label="Changer de thème"></button>
        <div class="currency-switch" role="group" aria-label="Devise">
          <button data-currency="USD">USD</button>
          <button data-currency="HTG">HTG</button>
        </div>
        <button class="icon-btn icon-btn-dark desktop-only" data-open-cart aria-label="Ouvrir le panier">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="count cart-count" hidden>0</span>
        </button>
      </div>
    </nav>
  `;
  updateCurrencySwitch();
  updateThemeButton();

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
        <a href="index.html#comment-commander">Comment commander</a>
        <a href="index.html#faq">Questions fréquentes</a>
        <a href="#" data-open-cart>Mon panier</a>
        <a href="shop.html?cat=favs">Mes favoris</a>
        <a href="${whatsappLink("Bonjour, j'ai une question sur ma commande.")}" target="_blank" rel="noopener">Suivre ma commande</a>
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

// ===== Devise (USD / HTG) =====
function updateCurrencySwitch() {
  $$("[data-currency]").forEach((b) => {
    const on = b.dataset.currency === currency;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
}

function setCurrency(value) {
  if (value === currency) return;
  currency = value;
  writeStore(CURRENCY_KEY, value);
  updateCurrencySwitch();
  $$("[data-price]").forEach((el) => (el.textContent = formatPrice(Number(el.dataset.price))));
  document.dispatchEvent(new Event("currency:change"));
}

// ===== Thème clair / sombre =====
// Sans choix enregistré, on suit le réglage du téléphone (voir le script dans <head>)
const currentTheme = () => document.documentElement.dataset.theme || "light";

function updateThemeButton() {
  const dark = currentTheme() === "dark";
  $$("[data-theme-toggle]").forEach((b) => {
    b.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}"></i>`;
    b.setAttribute("aria-label", dark ? "Passer en mode clair" : "Passer en mode sombre");
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  updateThemeButton();
}

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!readStore(THEME_KEY, null)) applyTheme(e.matches ? "dark" : "light");
});

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

function addToCart(id, qty = 1, size = null, color = null, sourceImg = null) {
  const items = getCart();
  const existing = items.find((i) => i.id === id && i.size === size && (i.color || null) === color);
  if (existing) existing.qty += qty;
  else items.push({ id, qty, size, color });
  saveCart(items);
  flyToCart(sourceImg).then(() => {
    $$(".cart-count").forEach((b) => {
      b.classList.remove("bump");
      void b.offsetWidth;
      b.classList.add("bump");
    });
    openCart();
  });
}

// La photo du produit « vole » jusqu'à l'icône du panier visible (en-tête ou barre du bas)
function flyToCart(img) {
  const target = $$(".nav-actions [data-open-cart], .bottom-nav [data-open-cart]").find(
    (el) => el.getBoundingClientRect().width > 0
  );
  if (!img || !target || reducedMotion || !img.animate) return Promise.resolve();

  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = img.cloneNode();
  clone.removeAttribute("id");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: "cover",
    borderRadius: "16px",
    zIndex: 300,
    pointerEvents: "none",
    viewTransitionName: "none",
    opacity: 1,
  });
  document.body.appendChild(clone);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  return clone
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(0.5)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.4 },
      ],
      { duration: 700, easing: "cubic-bezier(0.5, 0, 0.3, 1)" }
    )
    .finished.catch(() => {})
    .then(() => clone.remove());
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
  document.addEventListener("currency:change", fillCartDrawer);
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
        return `• ${itemLabel(p, i)} × ${i.qty} – ${formatPrice(p.price * i.qty)}`;
      })
      .join("\n") +
    `\n\nTotal : ${formatPrice(total)}`;

  body.innerHTML = items
    .map((i, idx) => {
      const p = getProduct(i.id);
      const meta = [p.brand, i.color, i.size && `Taille ${i.size}`].filter(Boolean).join(" · ");
      return `
      <div class="cart-item">
        <a href="sproduct.html?id=${p.id}"><img src="${imgSrc(p.image)}" alt="${p.name}" /></a>
        <div class="ci-info">
          <a href="sproduct.html?id=${p.id}" class="ci-name">${p.name}</a>
          <span class="ci-meta">${meta}</span>
          <div class="qty qty-sm">
            <button type="button" data-idx="${idx}" data-delta="-1" aria-label="Diminuer">−</button>
            <span>${i.qty}</span>
            <button type="button" data-idx="${idx}" data-delta="1" aria-label="Augmenter">+</button>
          </div>
        </div>
        <div class="ci-side">
          <button class="ci-remove" data-remove="${idx}" aria-label="Retirer"><i class="fa-regular fa-trash-can"></i></button>
          ${priceTag(p.price * i.qty, "strong")}
        </div>
      </div>`;
    })
    .join("");

  foot.innerHTML = `
    <div class="row"><span>Livraison</span><span>Calculée sur WhatsApp</span></div>
    <div class="row total"><span>Total</span>${priceTag(total)}</div>
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
            ${priceTag(p.price)}
            ${p.oldPrice ? priceTag(p.oldPrice, "s") : ""}
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

// ===== Accueil : FAQ & avis =====
function renderFaq() {
  const el = $("#faq-list");
  if (!el) return;
  el.innerHTML = FAQ.map(
    (f, i) => `
    <details class="accordion reveal" ${i === 0 ? "open" : ""}>
      <summary>${f.q}<i class="fa-solid fa-plus"></i></summary>
      <p>${f.a}</p>
    </details>`
  ).join("");
}

function renderReviews() {
  const section = $("#avis");
  if (!section || typeof REVIEWS === "undefined" || !REVIEWS.length) return;
  section.hidden = false;
  $("#reviews-list").innerHTML = REVIEWS.map(
    (r) => `
    <figure class="review reveal">
      ${
        r.rating
          ? `<div class="stars" aria-label="${r.rating} sur 5">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}${'<i class="fa-regular fa-star"></i>'.repeat(5 - r.rating)}</div>`
          : ""
      }
      <blockquote>« ${r.text} »</blockquote>
      <figcaption>
        <span class="avatar">${r.name.trim().charAt(0).toUpperCase()}</span>
        <span><strong>${r.name}</strong>${r.city ? `<small>${r.city}</small>` : ""}</span>
      </figcaption>
    </figure>`
  ).join("");
}

// ===== Guide des tailles =====
function sizeTable(head, rows) {
  return `<div class="table-wrap"><table>
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function openSizeGuide(category) {
  const guide = SIZE_GUIDES[category];
  if (!guide) return;
  let dialog = $("#size-guide");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "size-guide";
    dialog.className = "modal";
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.closest("[data-close-modal]")) dialog.close();
    });
    document.body.appendChild(dialog);
  }
  dialog.innerHTML = `
    <div class="modal-inner">
      <div class="modal-head">
        <h2>${guide.title}</h2>
        <button class="icon-btn" data-close-modal aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
      </div>
      ${guide.kids ? "<h3>Adultes</h3>" : ""}
      ${sizeTable(guide.head, guide.rows)}
      ${guide.kids ? `<h3>Enfants</h3>${sizeTable(guide.kids.head, guide.kids.rows)}` : ""}
      <p class="modal-tip"><i class="fa-solid fa-lightbulb"></i> ${guide.tip}</p>
    </div>`;
  dialog.showModal();
}

// ===== Clics globaux (délégation) =====
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-theme-toggle]")) {
    const next = currentTheme() === "dark" ? "light" : "dark";
    writeStore(THEME_KEY, next);
    applyTheme(next);
    return;
  }
  const cur = e.target.closest("[data-currency]");
  if (cur) {
    setCurrency(cur.dataset.currency);
    return;
  }
  // Transition entre pages : la photo de la carte s'agrandit vers la fiche produit
  const productLink = e.target.closest('a[href^="sproduct.html"]');
  if (productLink) {
    const img = productLink.closest(".product-card, .cart-item")?.querySelector("img");
    if (img) {
      $$("[style*='view-transition-name']").forEach((el) => (el.style.viewTransitionName = ""));
      const main = $("#pd-main");
      if (main) main.style.viewTransitionName = "none";
      img.style.viewTransitionName = "product-image";
    }
  }
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
    // Les produits avec tailles ou couleurs passent par la fiche produit pour faire le choix
    if ((p.sizes && p.sizes.length) || (p.colors && p.colors.length)) location.href = `sproduct.html?id=${p.id}`;
    else addToCart(p.id, 1, null, null, add.closest(".product-card")?.querySelector(".product-media img"));
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
  const photos = [p.image, ...(p.images || [])];
  const stock = availability(p);
  const hasGuide = p.sizes && SIZE_GUIDES[p.category];
  document.title = `${p.name} | ${STORE.name}`;

  el.innerHTML = `
    <div class="pd-gallery">
      <div class="pd-media">
        <img src="${imgSrc(photos[0])}" alt="${p.name}" id="pd-main" />
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        ${favButton(p.id, "fav-btn-lg")}
      </div>
      ${
        photos.length > 1
          ? `<div class="pd-thumbs">${photos
              .map(
                (src, i) =>
                  `<button class="pd-thumb ${i === 0 ? "active" : ""}" data-photo="${imgSrc(src)}" aria-label="Photo ${i + 1}"><img src="${imgSrc(src)}" alt="" loading="lazy" /></button>`
              )
              .join("")}</div>`
          : ""
      }
    </div>
    <div class="pd-info">
      <nav class="breadcrumb">
        <a href="index.html">Accueil</a> /
        <a href="shop.html?cat=${p.category}">${CATEGORIES[p.category]}</a> /
        <span>${p.name}</span>
      </nav>
      <span class="product-brand">${p.brand}</span>
      <h1>${p.name}</h1>
      <p class="pd-price">${priceTag(p.price)} ${p.oldPrice ? priceTag(p.oldPrice, "s") : ""}</p>
      <p class="stock ${stock.cls}"><span class="dot"></span> ${stock.label} · livré en ${stock.delay}</p>
      <p class="pd-desc">${p.description}</p>
      ${
        p.colors
          ? `<div class="pd-field">
              <label>Couleur : <span id="color-name" class="muted">à choisir</span></label>
              <div class="options" id="color-options">
                ${p.colors.map((c) => `<button type="button" class="opt-btn" data-color="${c}">${c}</button>`).join("")}
              </div>
            </div>`
          : ""
      }
      ${
        p.sizes
          ? `<div class="pd-field">
              <div class="field-head">
                <label>Taille</label>
                ${hasGuide ? `<button type="button" class="link-btn" id="size-guide-btn"><i class="fa-solid fa-ruler"></i> Guide des tailles</button>` : ""}
              </div>
              <div class="options" id="size-options">
                ${p.sizes.map((s) => `<button type="button" class="opt-btn size-btn" data-size="${s}">${s}</button>`).join("")}
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
      <div class="pd-accordions">
        <details class="accordion" open>
          <summary>Description<i class="fa-solid fa-plus"></i></summary>
          <p>${p.description}</p>
          <ul class="spec-list">
            <li><span>Marque</span>${p.brand}</li>
            <li><span>Catégorie</span>${CATEGORIES[p.category]}</li>
            ${p.colors ? `<li><span>Couleurs</span>${p.colors.join(", ")}</li>` : ""}
            ${p.sizes ? `<li><span>Tailles</span>${p.sizes.join(", ")}</li>` : ""}
          </ul>
        </details>
        <details class="accordion">
          <summary>Livraison & paiement<i class="fa-solid fa-plus"></i></summary>
          <ul class="spec-list">
            <li><span>Délai</span>${stock.label} : ${stock.delay}</li>
            <li><span>Zones</span>${STORE.delivery.zones}</li>
            <li><span>Frais</span>Calculés selon votre adresse, confirmés sur WhatsApp</li>
            <li><span>Paiement</span>${STORE.payments.join(", ")}</li>
          </ul>
        </details>
        <details class="accordion">
          <summary>Retours & échanges<i class="fa-solid fa-plus"></i></summary>
          <p>${STORE.returns}</p>
        </details>
      </div>
    </div>
  `;

  let size = null;
  let color = null;
  const qtyInput = $("#qty");
  const qty = () => Math.max(1, parseInt(qtyInput.value, 10) || 1);

  const updateWa = () => {
    $("#pd-wa").href = whatsappLink(
      `Bonjour Pipodi Store, je voudrais commander :\n• ${itemLabel(p, { size, color })} × ${qty()} – ${formatPrice(p.price * qty())}`
    );
  };

  const selectOption = (groupId, btn) => {
    $$(".opt-btn", $(groupId)).forEach((x) => x.classList.toggle("active", x === btn));
    $(groupId).classList.remove("error");
    updateWa();
  };
  $$("[data-size]", el).forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size;
      selectOption("#size-options", b);
    })
  );
  $$("[data-color]", el).forEach((b) =>
    b.addEventListener("click", () => {
      color = b.dataset.color;
      $("#color-name").textContent = color;
      $("#color-name").classList.remove("muted");
      selectOption("#color-options", b);
    })
  );
  $$("[data-photo]", el).forEach((b) =>
    b.addEventListener("click", () => {
      $("#pd-main").src = b.dataset.photo;
      $$(".pd-thumb", el).forEach((x) => x.classList.toggle("active", x === b));
    })
  );
  $$("[data-step]", el).forEach((b) =>
    b.addEventListener("click", () => {
      qtyInput.value = Math.max(1, qty() + Number(b.dataset.step));
      updateWa();
    })
  );
  qtyInput.addEventListener("input", updateWa);
  if (hasGuide) $("#size-guide-btn").addEventListener("click", () => openSizeGuide(p.category));

  const missingChoice = () => {
    const missing = [];
    if (p.colors && !color) missing.push(["#color-options", "une couleur"]);
    if (p.sizes && !size) missing.push(["#size-options", "une taille"]);
    if (!missing.length) return false;
    missing.forEach(([id]) => $(id).classList.add("error"));
    showToast(`<i class="fa-solid fa-circle-exclamation"></i> Choisissez ${missing.map((m) => m[1]).join(" et ")}`);
    return true;
  };
  $("#pd-add").addEventListener("click", () => {
    if (!missingChoice()) addToCart(p.id, qty(), size, color, $("#pd-main"));
  });
  $("#pd-wa").addEventListener("click", (e) => {
    if (missingChoice()) e.preventDefault();
  });
  document.addEventListener("currency:change", updateWa);
  updateWa();
}

// ===== Accueil : compteurs =====
function renderCategoryCounts() {
  $$("[data-total-count]").forEach((el) => (el.textContent = PRODUCTS.length));
  $$("[data-cat-count]").forEach((el) => {
    const n = PRODUCTS.filter((p) => p.category === el.dataset.catCount).length;
    el.textContent = n ? `${n} article${n > 1 ? "s" : ""}` : "";
  });
}

// ===== Chargement des photos produit (squelette animé puis fondu) =====
const markLoaded = (img) => img.classList.add("loaded");
document.addEventListener(
  "load",
  (e) => e.target.matches?.(".product-media img") && markLoaded(e.target),
  true
);
document.addEventListener(
  "error",
  (e) => e.target.matches?.(".product-media img") && markLoaded(e.target),
  true
);

// ===== Animations d'apparition au défilement =====
let revealObserver;
function observeReveal() {
  $$(".product-media img:not(.loaded)").forEach((img) => img.complete && markLoaded(img));
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
renderFaq();
renderReviews();
renderCategoryCounts();
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
