"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATALOG_URL,
  featuredImages,
  formatPrice,
  productsFromCsv,
  type Product,
} from "./catalog";

type CartItem = {
  product: Product;
  quantity: number;
};

type FormState = {
  name: string;
  delivery: "envio" | "showroom";
  location: string;
  notes: string;
};

const WHATSAPP_NUMBER = "5491138097308";

const announcementItems = [
  "🛍️ Venta online y showroom",
  "✈️ Envíos a todo el país",
  "💳 Aceptamos todas las tarjetas",
  "📍 Pueblo Nuevo - Hudson",
];

function isCatalogCaptureImage(image: string) {
  return image.startsWith("/assets/catalog/");
}

function getProductImages(product: Product) {
  return product.images.length > 0 ? product.images : [product.image];
}

function buildWhatsAppUrl(items: CartItem[], form: FormState) {
  const lines =
    items.length > 0
      ? items.map(
          ({ product, quantity }) =>
            `- ${quantity} x ${product.name} (${formatPrice(product.price)} c/u)`,
        )
      : ["Quiero consultar por productos disponibles."];

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const delivery =
    form.delivery === "showroom"
      ? "Retiro en showroom Pueblo Nuevo - Hudson"
      : "Envío a domicilio";

  const message = [
    "Hola Viviana Boutique, quiero hacer un pedido:",
    "",
    ...lines,
    items.length > 0 ? `Total aproximado: ${formatPrice(total)}` : "",
    "",
    `Modalidad: ${delivery}`,
    form.name ? `Nombre: ${form.name}` : "",
    form.location ? `Localidad / dirección: ${form.location}` : "",
    form.notes ? `Talles, colores o comentarios: ${form.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function BoutiqueHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedNotice, setAddedNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    delivery: "envio",
    location: "",
    notes: "",
  });

  async function loadCatalog(sourceUrl = DEFAULT_CATALOG_URL) {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No se pudo cargar el catálogo");
    }
    const text = await response.text();
    const parsedProducts = productsFromCsv(text);

    if (parsedProducts.length === 0) {
      throw new Error("La planilla no tiene productos válidos");
    }
    setProducts(parsedProducts);
  }

  useEffect(() => {
    fetch("/catalog-source.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((source) => {
        const csvUrl =
          typeof source?.csvUrl === "string" && source.csvUrl.trim()
            ? source.csvUrl.trim()
            : DEFAULT_CATALOG_URL;
        return loadCatalog(csvUrl);
      })
      .catch(() => loadCatalog(DEFAULT_CATALOG_URL).catch(() => setProducts([])));
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedProduct]);

  useEffect(() => {
    if (!addedNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setAddedNotice(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [addedNotice]);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          product.name,
          product.description,
          product.sizes,
          product.category,
          product.promo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const galleryImages = selectedProduct ? getProductImages(selectedProduct) : [];
  const activeGalleryImage =
    galleryImages[selectedImageIndex] ?? selectedProduct?.image ?? "";

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.product.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });
    setAddedNotice(`${product.name} agregado`);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function openWhatsApp() {
    window.open(buildWhatsAppUrl(cart, form), "_blank", "noopener,noreferrer");
  }

  function openProductGallery(product: Product) {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  }

  return (
    <main className="siteShell">
      <div className="announcementBar" aria-label="Información importante">
        <div className="tickerTrack">
          {[...announcementItems, ...announcementItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
      <header className="topBar" aria-label="Navegación principal">
        <a className="brandMark" href="#inicio" aria-label="Viviana Boutique inicio">
          <img
            src="/assets/brand/viviana-boutique-logo.png"
            alt="Viviana Boutique"
          />
          <span>Viviana Boutique</span>
        </a>
        <nav className="navLinks" aria-label="Secciones">
          <a href="#catalogo">Catálogo</a>
          <a href="#showroom">Showroom</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <div className="headerActions">
          <a
            className="headerWhatsApp"
            href={buildWhatsAppUrl([], form)}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <button
            className="cartButton"
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrito con ${itemCount} productos`}
          >
            <span className="cartGlyph" aria-hidden="true" />
            <span>{itemCount}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="heroCopy">
          <p className="eyebrow">Pueblo Nuevo - Hudson</p>
          <h1>Viviana Boutique</h1>
          <p className="heroLead">
            Ropa femenina para comprar online o probar en showroom. Elegí tus
            prendas, armamos el pedido por WhatsApp y coordinamos envío a todo
            el país o retiro en Hudson.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#catalogo">
              Ver catálogo
            </a>
            <a
              className="secondaryAction"
              href={buildWhatsAppUrl([], form)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
          <div className="trustStrip" aria-label="Beneficios">
            <span>Venta online</span>
            <span>Showroom</span>
            <span>Todas las tarjetas</span>
            <span>Envíos a todo el país</span>
          </div>
        </div>

        <div className="heroMedia" aria-label="Catálogo de prendas">
          <div className="phonePreview">
            <img src={featuredImages[0]} alt="Catálogo Viviana Boutique" />
          </div>
          <div className="miniPreview topPreview">
            <img src={featuredImages[1]} alt="Prendas destacadas" />
          </div>
          <div className="miniPreview bottomPreview">
            <img src={featuredImages[2]} alt="Abrigos y accesorios" />
          </div>
        </div>
      </section>

      <section
        className="quickInfo"
        id="showroom"
        aria-label="Información de compra"
      >
        <article>
          <span className="infoIcon">01</span>
          <h2>Compra online</h2>
          <p>El carrito prepara el mensaje con prendas, cantidades y total.</p>
        </article>
        <article>
          <span className="infoIcon">02</span>
          <h2>Showroom</h2>
          <p>Coordinación para probar o retirar en Pueblo Nuevo - Hudson.</p>
        </article>
        <article>
          <span className="infoIcon">03</span>
          <h2>Pagos</h2>
          <p>Aceptamos todas las tarjetas. Consultanos cuotas por WhatsApp.</p>
        </article>
        <article>
          <span className="infoIcon">04</span>
          <h2>Envíos</h2>
          <p>Despachos a todo el país con seguimiento del pedido.</p>
        </article>
      </section>

      <section className="catalogSection" id="catalogo">
        <div className="sectionIntro">
          <div>
            <p className="eyebrow">Catálogo actualizado</p>
            <h2>Últimos ingresos</h2>
          </div>
          <p>
            Precios de referencia en pesos argentinos. Confirmamos stock,
            talles y colores antes de cerrar la compra.
          </p>
        </div>

        <div className="catalogTools">
          <label className="searchBox">
            <span>Buscar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Remera, pantalón, buzo..."
              type="search"
            />
          </label>
          <div className="categoryTabs" aria-label="Filtrar por categoría">
            {categories.map((item) => (
              <button
                className={item === category ? "active" : ""}
                key={item}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="catalogStatus">
          <span>{filteredProducts.length} productos</span>
        </div>

        <div className="productGrid">
          {filteredProducts.map((product) => {
            const images = getProductImages(product);

            return (
              <article className="productCard" key={product.id}>
                <button
                  className={`productPhoto ${
                    isCatalogCaptureImage(product.image) ? "catalogCrop" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundPosition: product.position,
                  }}
                  type="button"
                  onClick={() => openProductGallery(product)}
                  aria-label={`Ver fotos de ${product.name}`}
                >
                  <span className="photoBadge">
                    {images.length > 1 ? `${images.length} fotos` : "Ver foto"}
                  </span>
                </button>
                <div className="productBody">
                  <div>
                    <p className="productCategory">{product.category}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <p className="price">{formatPrice(product.price)}</p>
                  {product.description ? (
                    <p className="description">{product.description}</p>
                  ) : null}
                  {product.sizes || product.promo || images.length > 1 ? (
                    <div className="productMeta">
                      {product.sizes ? <span>{product.sizes}</span> : null}
                      {product.promo ? <span>{product.promo}</span> : null}
                      {images.length > 1 ? <span>{images.length} fotos</span> : null}
                    </div>
                  ) : null}
                  <button type="button" onClick={() => addToCart(product)}>
                    <span aria-hidden="true">+</span>
                    Agregar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="siteFooter" id="contacto">
        <div className="footerMain">
          <div className="footerBrand">
            <img
              src="/assets/brand/viviana-boutique-logo.png"
              alt="Viviana Boutique"
            />
            <strong>Viviana Boutique</strong>
            <p>
              Venta online y showroom en Pueblo Nuevo - Hudson. Envíos a todo
              el país y pagos con tarjetas.
            </p>
          </div>
          <nav className="footerLinks" aria-label="Links del sitio">
            <a href="#inicio">Inicio</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#showroom">Showroom</a>
          </nav>
          <div className="footerContact">
            <span>Pueblo Nuevo - Hudson</span>
            <span>Envíos a todo el país</span>
            <span>Aceptamos todas las tarjetas</span>
          </div>
        </div>
        <div className="footerCta">
          <div>
            <p className="eyebrow">Viviana Boutique</p>
            <h2>Consultas, talles y compras por WhatsApp</h2>
          </div>
          <a
            className="primaryAction"
            href={buildWhatsAppUrl(cart, form)}
            target="_blank"
            rel="noreferrer"
          >
            +54 9 11 3809-7308
          </a>
        </div>
      </footer>

      <aside className={`cartDrawer ${cartOpen ? "open" : ""}`} aria-label="Carrito">
        <div className="cartHeader">
          <div>
            <p className="eyebrow">Pedido</p>
            <h2>Carrito por WhatsApp</h2>
          </div>
          <button
            className="iconButton"
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            x
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="emptyCart">Todavía no agregaste prendas.</p>
        ) : (
          <div className="cartItems">
            {cart.map(({ product, quantity }) => (
              <article className="cartItem" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="qtyControls">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, -1)}
                    aria-label={`Quitar ${product.name}`}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, 1)}
                    aria-label={`Agregar ${product.name}`}
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="cartForm">
          <label>
            Nombre
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Tu nombre"
            />
          </label>
          <label>
            Entrega
            <select
              value={form.delivery}
              onChange={(event) =>
                setForm({
                  ...form,
                  delivery: event.target.value as FormState["delivery"],
                })
              }
            >
              <option value="envio">Envío a domicilio</option>
              <option value="showroom">Retiro en showroom</option>
            </select>
          </label>
          <label>
            Localidad o dirección
            <input
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
              placeholder="Ej: Hudson, La Plata..."
            />
          </label>
          <label>
            Talles, colores o comentarios
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Ej: talle M, color negro"
              rows={3}
            />
          </label>
        </div>

        <div className="cartFooter">
          <div>
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button type="button" onClick={openWhatsApp}>
            Enviar pedido
          </button>
        </div>
      </aside>

      {selectedProduct ? (
        <div
          className="galleryOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <section
            className="galleryDialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Fotos de ${selectedProduct.name}`}
          >
            <div className="galleryHeader">
              <div>
                <p className="eyebrow">{selectedProduct.category}</p>
                <h2>{selectedProduct.name}</h2>
                <strong>{formatPrice(selectedProduct.price)}</strong>
              </div>
              <button
                className="iconButton"
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Cerrar galería"
              >
                x
              </button>
            </div>

            <div className="galleryStage">
              <img
                src={activeGalleryImage}
                alt={`Foto ${selectedImageIndex + 1} de ${selectedProduct.name}`}
              />
            </div>

            {galleryImages.length > 1 ? (
              <div className="galleryThumbs" aria-label="Elegir foto">
                {galleryImages.map((image, index) => (
                  <button
                    className={index === selectedImageIndex ? "active" : ""}
                    key={`${image}-${index}`}
                    style={{ backgroundImage: `url(${image})` }}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}

            <div className="galleryActions">
              <button
                className="secondaryAction"
                type="button"
                disabled={galleryImages.length < 2}
                onClick={() =>
                  setSelectedImageIndex((currentIndex) =>
                    currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1,
                  )
                }
              >
                Anterior
              </button>
              <button
                className="secondaryAction"
                type="button"
                disabled={galleryImages.length < 2}
                onClick={() =>
                  setSelectedImageIndex((currentIndex) =>
                    currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1,
                  )
                }
              >
                Siguiente
              </button>
              <button
                className="primaryAction"
                type="button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Agregar al pedido
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {addedNotice ? (
        <div className="cartToast" role="status" aria-live="polite">
          <span>{addedNotice}</span>
          <button type="button" onClick={() => setCartOpen(true)}>
            Ver carrito
          </button>
        </div>
      ) : null}
    </main>
  );
}
