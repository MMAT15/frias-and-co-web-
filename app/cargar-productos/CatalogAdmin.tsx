"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATALOG_URL,
  catalogHeaders,
  formatPrice,
  parseImageList,
  productsFromCsv,
  productsToCsv,
  uniqueImages,
  type Product,
} from "../catalog";

const emptyProduct: Product = {
  id: "",
  name: "",
  price: 0,
  description: "",
  category: "Remeras",
  sizes: "",
  promo: "",
  image: "/assets/catalog/catalogo-1.png",
  images: ["/assets/catalog/catalogo-1.png"],
  position: "4.8% 15%",
};

function isCatalogCaptureImage(image: string) {
  return image.startsWith("/assets/catalog/");
}

function makeProductId(name: string, index: number) {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `producto-${index + 1}`;
}

export function CatalogAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sourceUrl, setSourceUrl] = useState(DEFAULT_CATALOG_URL);
  const [notice, setNotice] = useState("Cargando catálogo actual...");

  useEffect(() => {
    async function loadCurrentCatalog() {
      const sourceResponse = await fetch("/catalog-source.json", {
        cache: "no-store",
      });
      const source = sourceResponse.ok ? await sourceResponse.json() : null;
      const csvUrl =
        typeof source?.csvUrl === "string" && source.csvUrl.trim()
          ? source.csvUrl.trim()
          : DEFAULT_CATALOG_URL;

      setSourceUrl(csvUrl);

      const catalogResponse = await fetch(csvUrl, { cache: "no-store" });
      if (!catalogResponse.ok) {
        throw new Error("No se pudo cargar el catálogo actual.");
      }

      return catalogResponse.text();
    }

    loadCurrentCatalog()
      .then((text) => {
        const parsedProducts = productsFromCsv(text);
        setProducts(parsedProducts);
        setNotice(`Catálogo actual cargado: ${parsedProducts.length} productos.`);
      })
      .catch(() => setNotice("No se pudo cargar el catálogo actual."));
  }, []);

  const totalValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price, 0),
    [products],
  );

  function importCatalog(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsedProducts = productsFromCsv(text);

      if (parsedProducts.length === 0) {
        setNotice("La planilla no tiene productos válidos.");
        return;
      }

      setProducts(parsedProducts);
      setNotice(`CSV cargado para revisar: ${parsedProducts.length} productos.`);
    };
    reader.readAsText(file);
  }

  function updateProduct(index: number, field: keyof Product, value: string) {
    setProducts((currentProducts) =>
      currentProducts.map((product, productIndex) => {
        if (productIndex !== index) {
          return product;
        }

        let nextProduct: Product;

        if (field === "price") {
          nextProduct = { ...product, price: Number(value || 0) };
        } else if (field === "images") {
          nextProduct = { ...product, images: parseImageList(value) };
        } else if (field === "image") {
          nextProduct = {
            ...product,
            image: value,
            images: uniqueImages([
              value,
              ...product.images.filter((image) => image !== product.image),
            ]),
          };
        } else {
          nextProduct = { ...product, [field]: value };
        }

        if (field === "name" && (!product.id || product.id.startsWith("producto-"))) {
          nextProduct.id = makeProductId(value, index);
        }

        return nextProduct;
      }),
    );
  }

  function addProduct() {
    setProducts((currentProducts) => [
      {
        ...emptyProduct,
        id: `producto-${currentProducts.length + 1}`,
      },
      ...currentProducts,
    ]);
    setNotice("Producto nuevo agregado arriba.");
  }

  function removeProduct(index: number) {
    setProducts((currentProducts) =>
      currentProducts.filter((_, productIndex) => productIndex !== index),
    );
    setNotice("Producto eliminado de esta edición.");
  }

  function downloadCsv() {
    const csv = productsToCsv(products);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogo-viviana-boutique.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    setNotice("CSV listo descargado. Ese archivo se puede usar como catálogo.");
  }

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <Link className="brandMark" href="/" aria-label="Volver al sitio">
          <img
            src="/assets/brand/viviana-boutique-logo.png"
            alt="Viviana Boutique"
          />
        </Link>
        <div>
          <p className="eyebrow">Administración interna</p>
          <h1>Cargar productos</h1>
          <p>
            Esta página no aparece en el menú público. La carga simple se hace
            editando la planilla de Google Sheets; esta vista sirve para revisar
            el catálogo publicado y descargar un respaldo CSV.
          </p>
        </div>
      </header>

      <section className="adminPanel">
        <div className="adminActions">
          <button type="button" onClick={addProduct}>
            Agregar producto
          </button>
          <label>
            <input accept=".csv,text/csv" type="file" onChange={importCatalog} />
            Cargar CSV
          </label>
          <button type="button" onClick={downloadCsv}>
            Descargar CSV listo
          </button>
          <a href="/catalogo.csv" download>
            Descargar plantilla
          </a>
          {sourceUrl !== DEFAULT_CATALOG_URL ? (
            <a href={sourceUrl} target="_blank" rel="noreferrer">
              Ver CSV publicado
            </a>
          ) : null}
          <Link href="/">Ver tienda</Link>
        </div>

        <div className="adminSummary">
          <span>{products.length} productos</span>
          <span>Valor listado: {formatPrice(totalValue)}</span>
          <span>Columnas: {catalogHeaders.join(", ")}</span>
        </div>
        <p className="notice">{notice}</p>
      </section>

      <section className="adminProductList" aria-label="Editor de productos">
        {products.map((product, index) => (
          <article className="adminProductRow" key={`${product.id}-${index}`}>
            <div
              className={`adminThumb ${
                isCatalogCaptureImage(product.image) ? "catalogCrop" : ""
              }`}
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundPosition: product.position,
              }}
              aria-hidden="true"
            />
            <div className="adminFields">
              <label>
                Nombre
                <input
                  value={product.name}
                  onChange={(event) =>
                    updateProduct(index, "name", event.target.value)
                  }
                />
              </label>
              <label>
                Precio
                <input
                  min="0"
                  type="number"
                  value={product.price || ""}
                  onChange={(event) =>
                    updateProduct(index, "price", event.target.value)
                  }
                />
              </label>
              <label>
                Categoría
                <input
                  value={product.category}
                  onChange={(event) =>
                    updateProduct(index, "category", event.target.value)
                  }
                />
              </label>
              <label>
                Talles
                <input
                  value={product.sizes}
                  onChange={(event) =>
                    updateProduct(index, "sizes", event.target.value)
                  }
                />
              </label>
              <label>
                Promo
                <input
                  value={product.promo}
                  onChange={(event) =>
                    updateProduct(index, "promo", event.target.value)
                  }
                />
              </label>
              <label>
                Imagen principal
                <input
                  value={product.image}
                  onChange={(event) =>
                    updateProduct(index, "image", event.target.value)
                  }
                />
              </label>
              <label className="wideField">
                Galería
                <textarea
                  rows={2}
                  value={product.images.join(" | ")}
                  placeholder="Pegá varios links separados por |"
                  onChange={(event) =>
                    updateProduct(index, "images", event.target.value)
                  }
                />
              </label>
              <label>
                Posición
                <input
                  value={product.position}
                  onChange={(event) =>
                    updateProduct(index, "position", event.target.value)
                  }
                />
              </label>
              <label className="wideField">
                Descripción
                <textarea
                  rows={2}
                  value={product.description}
                  onChange={(event) =>
                    updateProduct(index, "description", event.target.value)
                  }
                />
              </label>
            </div>
            <button
              className="deleteProduct"
              type="button"
              onClick={() => removeProduct(index)}
              aria-label={`Eliminar ${product.name || "producto"}`}
            >
              Eliminar
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
