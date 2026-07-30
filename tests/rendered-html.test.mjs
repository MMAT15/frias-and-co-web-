import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Viviana Boutique storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /width=device-width/);
  assert.match(html, /Viviana Boutique/);
  assert.match(html, /Ropa femenina/);
  assert.match(html, /Pueblo Nuevo - Hudson/);
  assert.match(html, /Venta online/);
  assert.match(html, /Envíos a todo el país/);
  assert.match(html, /Carrito por WhatsApp/);
  assert.match(html, /Consultas, talles y compras por WhatsApp/);
  assert.match(html, /Aceptamos todas las tarjetas/);
  assert.doesNotMatch(html, /Carga simple/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("catalog admin is hidden from storefront and starter preview is removed", async () => {
  const [page, layout, packageJson, catalog, source, adminPage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/catalogo.csv", import.meta.url), "utf8"),
    readFile(new URL("../public/catalog-source.json", import.meta.url), "utf8"),
    readFile(new URL("../app/cargar-productos/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Viviana Boutique/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(catalog, /Buzo Scotland/);
  assert.match(catalog, /Pantalón Bennet Leorap/);
  assert.match(catalog, /imagenes/);
  assert.match(catalog, /res\.cloudinary\.com/);
  assert.match(source, /docs\.google\.com\/spreadsheets/);
  assert.match(source, /output=csv/);
  assert.match(adminPage, /index:\s*false/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
