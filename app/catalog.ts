export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sizes: string;
  promo: string;
  image: string;
  images: string[];
  position: string;
};

export const DEFAULT_CATALOG_URL = "/catalogo.csv";

export const featuredImages = [
  "/assets/catalog/catalogo-1.png",
  "/assets/catalog/catalogo-2.png",
  "/assets/catalog/catalogo-3.png",
];

export const catalogHeaders = [
  "id",
  "nombre",
  "precio",
  "descripcion",
  "categoria",
  "talles",
  "promo",
  "imagen",
  "imagenes",
  "posicion",
];

export function parseImageList(value: string) {
  return value
    .split(/\s*(?:\||\n|;)\s*/)
    .map((image) => image.trim())
    .filter(Boolean);
}

export function uniqueImages(images: string[]) {
  return Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function normalizePrice(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return Number(digits || 0);
}

export function productsFromCsv(text: string): Product[] {
  const rows = parseCsv(text);
  const headers =
    rows
      .shift()
      ?.map((header) => header.trim().toLowerCase())
      .filter(Boolean) ?? [];

  return rows
    .map((row, index) => {
      const record = Object.fromEntries(
        headers.map((header, headerIndex) => [
          header,
          (row[headerIndex] ?? "").trim(),
        ]),
      );

      const name = record.nombre || record.name || "";
      const price = normalizePrice(record.precio || record.price || "");

      if (!name || price <= 0) {
        return null;
      }

      const galleryImages = parseImageList(
        record.imagenes || record.images || record.galeria || record.gallery || "",
      );
      const mainImage =
        record.imagen ||
        record.image ||
        galleryImages[0] ||
        featuredImages[index % featuredImages.length];
      const images = uniqueImages([mainImage, ...galleryImages]);

      return {
        id:
          record.id ||
          `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
        name,
        price,
        description: record.descripcion || record.description || "",
        category: record.categoria || record.category || "Colección",
        sizes: record.talles || record.sizes || "",
        promo: record.promo || "",
        image: mainImage,
        images,
        position: record.posicion || record.position || "4.7% 15%",
      };
    })
    .filter((product): product is Product => Boolean(product));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function productsToCsv(products: Product[]) {
  const rows = products.map((product) => [
    product.id,
    product.name,
    product.price,
    product.description,
    product.category,
    product.sizes,
    product.promo,
    product.image,
    uniqueImages(product.images).join(" | "),
    product.position,
  ]);

  return [catalogHeaders, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}
