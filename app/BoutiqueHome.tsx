"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  CreditCard,
  Images,
  MapPin,
  MessageCircle,
  Minus,
  Plane,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
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

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  onOpen: (product: Product) => void;
};

const WHATSAPP_NUMBER = "5491138097308";
const INSTAGRAM_URL = "https://www.instagram.com/vivianavaracca.boutique/";

const announcementItems = [
  { icon: Plane, text: "Envíos a todo el país" },
  { icon: CreditCard, text: "Todas las tarjetas" },
  { icon: MapPin, text: "Pueblo Nuevo · Hudson" },
  { icon: Store, text: "Venta online y showroom" },
];

const serviceItems = [
  {
    icon: Plane,
    title: "Envíos nacionales",
    text: "Despachamos a todo el país.",
  },
  {
    icon: Store,
    title: "Showroom en Hudson",
    text: "Coordiná para probar o retirar.",
  },
  {
    icon: CreditCard,
    title: "Pagá como quieras",
    text: "Aceptamos todas las tarjetas.",
  },
];

function isCatalogCaptureImage(image: string) {
  return image.startsWith("/assets/catalog/");
}

function getProductImages(product: Product) {
  return product.images.length > 0 ? product.images : [product.image];
}

function getPhotoStyle(product: Product, image = product.image) {
  return {
    backgroundImage: `url(${image})`,
    backgroundPosition: isCatalogCaptureImage(image)
      ? product.position
      : "center",
  };
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

function ProductCard({ product, onAdd, onOpen }: ProductCardProps) {
  const images = getProductImages(product);

  return (
    <article className="productCard">
      <button
        className={`productPhoto ${
          isCatalogCaptureImage(product.image) ? "catalogCrop" : ""
        }`}
        style={getPhotoStyle(product)}
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver fotos de ${product.name}`}
      >
        {images.length > 1 ? (
          <span className="photoBadge">
            <Images size={14} aria-hidden="true" />
            {images.length}
          </span>
        ) : null}
      </button>

      <div className="productBody">
        <div className="productHeading">
          <p className="productCategory">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <p className="price">{formatPrice(product.price)}</p>
        {product.sizes || product.promo ? (
          <p className="productDetail">
            {[product.sizes, product.promo].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <button type="button" onClick={() => onAdd(product)}>
          <span>Agregar</span>
          <ShoppingBag size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function BoutiqueHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
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

    const parsedProducts = productsFromCsv(await response.text());
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
      .catch(() => loadCatalog(DEFAULT_CATALOG_URL).catch(() => setProducts([])))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProduct && !cartOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedProduct) {
        setSelectedProduct(null);
      } else {
        setCartOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartOpen, selectedProduct]);

  useEffect(() => {
    if (!addedNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setAddedNotice(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [addedNotice]);

  const categories = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;
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
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cart],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const heroTiles = useMemo(() => {
    if (products.length > 0) {
      return products.slice(0, 3).map((product) => ({
        name: product.name,
        className: isCatalogCaptureImage(product.image) ? "catalogCrop" : "",
        style: getPhotoStyle(product),
      }));
    }

    return featuredImages.map((image, index) => ({
      name: "Colección Viviana Boutique",
      className: "catalogCrop",
      style: {
        backgroundImage: `url(${image})`,
        backgroundPosition: `${5 + index * 18}% 18%`,
      },
    }));
  }, [products]);

  const galleryImages = selectedProduct ? getProductImages(selectedProduct) : [];
  const activeGalleryImage =
    galleryImages[selectedImageIndex] ?? selectedProduct?.image ?? "";

  function addToCart(product: Product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });
    setAddedNotice(`${product.name} se agregó al pedido`);
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

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId),
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
          {[...announcementItems, ...announcementItems].map(
            ({ icon: Icon, text }, index) => (
              <span key={`${text}-${index}`}>
                <Icon size={14} aria-hidden="true" />
                {text}
              </span>
            ),
          )}
        </div>
      </div>

      <header className="topBar" aria-label="Navegación principal">
        <a className="brandMark" href="#inicio" aria-label="Viviana Boutique inicio">
          <img
            src="/assets/brand/viviana-boutique-logo.png"
            alt=""
            aria-hidden="true"
          />
          <span>Viviana Boutique</span>
        </a>

        <nav className="navLinks" aria-label="Secciones">
          <a href="#catalogo">Colección</a>
          <a href="#showroom">Showroom</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <button
          className="cartButton"
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Abrir pedido con ${itemCount} prendas`}
        >
          <ShoppingBag size={20} aria-hidden="true" />
          <span className="cartLabel">Pedido</span>
          <span className="cartCount">{itemCount}</span>
        </button>
      </header>

      <section className="hero" id="inicio">
        <div className="heroCopy">
          <h1>Encontrá tu próximo look</h1>
          <p className="heroLead">
            Comprá online o coordiná una visita al showroom en Hudson.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#catalogo">
              Ver colección
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              className="secondaryAction"
              href={buildWhatsAppUrl([], form)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </a>
          </div>
          <p className="stockNote">
            <Check size={17} aria-hidden="true" />
            Stock y talles se confirman antes de cerrar el pedido.
          </p>
        </div>

        <div className="heroMedia" aria-label="Prendas destacadas">
          {heroTiles.map((tile, index) => (
            <div
              className={`heroTile heroTile${index + 1} ${tile.className}`}
              style={tile.style}
              key={`${tile.name}-${index}`}
              role="img"
              aria-label={tile.name}
            />
          ))}
        </div>
      </section>

      <section className="serviceStrip" id="showroom">
        {serviceItems.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={22} aria-hidden="true" />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="catalogSection" id="catalogo">
        <div className="sectionIntro">
          <div>
            <h2>Nuevos ingresos</h2>
            <p>
              Precios en pesos argentinos. Confirmamos stock, talles y colores
              antes de cerrar la compra.
            </p>
          </div>
          <a href="#contacto">
            ¿Necesitás ayuda?
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>

        <div className="catalogTools">
          <label className="searchBox">
            <span className="srOnly">Buscar prendas</span>
            <Search size={20} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar prendas"
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

        <div className="catalogStatus" role="status">
          {catalogLoading ? "Cargando colección…" : `${filteredProducts.length} productos`}
        </div>

        {catalogLoading ? (
          <div className="productGrid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="productSkeleton" key={index}>
                <span />
                <i />
                <i />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="productGrid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                onOpen={openProductGallery}
              />
            ))}
          </div>
        ) : (
          <div className="emptyCatalog">
            <Search size={24} aria-hidden="true" />
            <h3>No encontramos prendas con ese filtro.</h3>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("Todos");
              }}
            >
              Ver toda la colección
            </button>
          </div>
        )}
      </section>

      <footer className="siteFooter" id="contacto">
        <div className="footerBrand">
          <img
            src="/assets/brand/viviana-boutique-logo.png"
            alt="Viviana Boutique"
          />
          <div>
            <strong>Viviana Boutique</strong>
            <span>Pueblo Nuevo · Hudson</span>
          </div>
        </div>

        <div className="footerServices">
          <span>
            <Plane size={19} aria-hidden="true" />
            Envíos a todo el país
          </span>
          <span>
            <CreditCard size={19} aria-hidden="true" />
            Todas las tarjetas
          </span>
        </div>

        <div className="footerActions">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Camera size={20} aria-hidden="true" />
            Instagram
          </a>
          <a
            href={buildWhatsAppUrl(cart, form)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} aria-hidden="true" />
            +54 9 11 3809-7308
          </a>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} Viviana Boutique
        </p>
      </footer>

      {cartOpen ? (
        <button
          className="cartBackdrop"
          type="button"
          onClick={() => setCartOpen(false)}
          aria-label="Cerrar pedido"
        />
      ) : null}

      <aside
        className={`cartDrawer ${cartOpen ? "open" : ""}`}
        aria-label="Tu pedido"
        aria-hidden={!cartOpen}
      >
        <div className="cartHandle" aria-hidden="true" />
        <div className="cartHeader">
          <div>
            <h2>Tu pedido</h2>
            <p>{itemCount === 1 ? "1 prenda" : `${itemCount} prendas`}</p>
          </div>
          <button
            className="iconButton"
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar pedido"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="cartContent">
          {cart.length === 0 ? (
            <div className="emptyCart">
              <ShoppingBag size={28} aria-hidden="true" />
              <h3>Tu pedido está vacío</h3>
              <p>Agregá prendas del catálogo y las preparamos por WhatsApp.</p>
              <button type="button" onClick={() => setCartOpen(false)}>
                Seguir mirando
              </button>
            </div>
          ) : (
            <div className="cartItems">
              {cart.map(({ product, quantity }) => (
                <article className="cartItem" key={product.id}>
                  <div
                    className={`cartThumb ${
                      isCatalogCaptureImage(product.image) ? "catalogCrop" : ""
                    }`}
                    style={getPhotoStyle(product)}
                    role="img"
                    aria-label={product.name}
                  />
                  <div className="cartItemInfo">
                    <strong>{product.name}</strong>
                    <span>{formatPrice(product.price)}</span>
                    <div className="qtyControls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        aria-label={`Quitar una unidad de ${product.name}`}
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        aria-label={`Agregar una unidad de ${product.name}`}
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <button
                    className="removeItem"
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Eliminar ${product.name} del pedido`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}

          {cart.length > 0 ? (
            <div className="orderOptions">
              <div className="deliveryOptions" aria-label="Modalidad de entrega">
                <button
                  className={form.delivery === "envio" ? "active" : ""}
                  type="button"
                  onClick={() => setForm({ ...form, delivery: "envio" })}
                >
                  <Plane size={18} aria-hidden="true" />
                  Envío
                </button>
                <button
                  className={form.delivery === "showroom" ? "active" : ""}
                  type="button"
                  onClick={() => setForm({ ...form, delivery: "showroom" })}
                >
                  <Store size={18} aria-hidden="true" />
                  Retiro en showroom
                </button>
              </div>

              <details className="orderDetails">
                <summary>
                  Agregar datos y comentarios
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="cartForm">
                  <label>
                    <span>Nombre</span>
                    <div>
                      <UserRound size={18} aria-hidden="true" />
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm({ ...form, name: event.target.value })
                        }
                        placeholder="Tu nombre"
                      />
                    </div>
                  </label>
                  {form.delivery === "envio" ? (
                    <label>
                      <span>Localidad o dirección</span>
                      <input
                        value={form.location}
                        onChange={(event) =>
                          setForm({ ...form, location: event.target.value })
                        }
                        placeholder="Ej: Hudson, La Plata..."
                      />
                    </label>
                  ) : null}
                  <label>
                    <span>Talles, colores o comentarios</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) =>
                        setForm({ ...form, notes: event.target.value })
                      }
                      placeholder="Ej: talle M, color negro"
                      rows={2}
                    />
                  </label>
                </div>
              </details>
            </div>
          ) : null}
        </div>

        {cart.length > 0 ? (
          <div className="cartFooter">
            <div>
              <span>Total estimado</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <button type="button" onClick={openWhatsApp}>
              <MessageCircle size={20} aria-hidden="true" />
              Enviar por WhatsApp
            </button>
          </div>
        ) : null}
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
                <p>{selectedProduct.category}</p>
                <h2>{selectedProduct.name}</h2>
                <strong>{formatPrice(selectedProduct.price)}</strong>
              </div>
              <button
                className="iconButton"
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Cerrar galería"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div
              className={`galleryStage ${
                isCatalogCaptureImage(activeGalleryImage) ? "catalogCrop" : ""
              }`}
              style={getPhotoStyle(selectedProduct, activeGalleryImage)}
              role="img"
              aria-label={`Foto ${selectedImageIndex + 1} de ${selectedProduct.name}`}
            />

            {galleryImages.length > 1 ? (
              <div className="galleryThumbs" aria-label="Elegir foto">
                {galleryImages.map((image, index) => (
                  <button
                    className={`${index === selectedImageIndex ? "active" : ""} ${
                      isCatalogCaptureImage(image) ? "catalogCrop" : ""
                    }`}
                    key={`${image}-${index}`}
                    style={getPhotoStyle(selectedProduct, image)}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}

            <div className="galleryActions">
              <button
                className="galleryNav"
                type="button"
                disabled={galleryImages.length < 2}
                onClick={() =>
                  setSelectedImageIndex((currentIndex) =>
                    currentIndex === 0
                      ? galleryImages.length - 1
                      : currentIndex - 1,
                  )
                }
                aria-label="Foto anterior"
              >
                <ArrowLeft size={19} aria-hidden="true" />
              </button>
              <button
                className="galleryNav"
                type="button"
                disabled={galleryImages.length < 2}
                onClick={() =>
                  setSelectedImageIndex((currentIndex) =>
                    currentIndex === galleryImages.length - 1
                      ? 0
                      : currentIndex + 1,
                  )
                }
                aria-label="Foto siguiente"
              >
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <button
                className="primaryAction"
                type="button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                Agregar al pedido
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {itemCount > 0 && !cartOpen ? (
        <button
          className="floatingOrder"
          type="button"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={21} aria-hidden="true" />
          <span>{itemCount === 1 ? "1 prenda" : `${itemCount} prendas`}</span>
          <i aria-hidden="true">·</i>
          <strong>Ver pedido</strong>
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      ) : null}

      {addedNotice ? (
        <div className="cartToast" role="status" aria-live="polite">
          <Check size={18} aria-hidden="true" />
          <span>{addedNotice}</span>
        </div>
      ) : null}
    </main>
  );
}
