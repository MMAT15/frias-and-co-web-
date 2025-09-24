#!/usr/bin/env python3

"""Utilidad para agregar productos al catálogo estático de BERA clothing.

El script copia la imagen al directorio `assets/images`, inserta el bloque HTML
del nuevo producto en `productos.html` y actualiza el objeto `productData` de
`js/scriptt.js` para que el modal de detalles tenga la información correcta.

Requisitos: Python 3.8+.
"""

from __future__ import annotations

import re
import shutil
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets" / "images"
PRODUCTS_HTML = ROOT / "productos.html"
JS_PATH = ROOT / "js" / "scriptt.js"


CATEGORIES = {
    "remera": {"section": "remeras", "label": "Remeras"},
    "denim": {"section": "denim", "label": "Denim"},
    "pantalon": {"section": "pantalones", "label": "Pantalones"},
    "short": {"section": "shorts", "label": "Shorts / Minis"},
    "top": {"section": "tops", "label": "Tops"},
    "body": {"section": "bodys", "label": "Bodys"},
    "set": {"section": "sets", "label": "Sets"},
    "abrigo": {"section": "abrigos", "label": "Abrigos"},
    "vestido": {"section": "vestidos", "label": "Vestidos"},
    "accesorio": {"section": "accesorios", "label": "Accesorios"},
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return slug.strip("-")


def format_price(value: int) -> str:
    return f"${value:,.0f}".replace(",", ".")


def escape_js(text: str) -> str:
    return text.replace("\\", "\\\\").replace("'", "\\'")


def prompt(msg: str, default: str | None = None) -> str:
    full = f"{msg} "
    if default:
        full += f"[{default}] "
    value = input(full).strip()
    return value or (default or "")


def choose_category() -> str:
    print("\nCategorías disponibles:")
    for key, meta in CATEGORIES.items():
        print(f"  - {key} ({meta['label']})")
    while True:
        value = input("Elegí la categoría (usar el código de la lista): ").strip().lower()
        if value in CATEGORIES:
            return value
        print("\n⚠️ Categoría inválida. Probá otra vez.\n")


def copy_image(src_path: Path, slug: str) -> str:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    suffix = src_path.suffix.lower()
    dest = ASSETS_DIR / f"{slug}{suffix}"

    if dest.exists():
        answer = input(f"La imagen {dest.name} ya existe. ¿Sobrescribir? [s/N] ").strip().lower()
        if answer != "s":
            counter = 1
            while True:
                candidate = ASSETS_DIR / f"{slug}-{counter}{suffix}"
                if not candidate.exists():
                    dest = candidate
                    break
                counter += 1

    shutil.copy2(src_path, dest)
    print(f"✅ Imagen copiada a {dest}")
    return f"assets/images/{dest.name}"


def insert_product_html(html: str, section_id: str, block: str) -> str:
    section_marker = f'<section id="{section_id}"'
    section_index = html.find(section_marker)
    if section_index == -1:
        raise ValueError(f"No se encontró la sección {section_id} en productos.html")

    grid_index = html.find('<div class="grid-products">', section_index)
    if grid_index == -1:
        raise ValueError("No se encontró el contenedor de productos en la sección indicada")

    pos = grid_index
    depth = 0
    close_start = None
    length = len(html)

    while pos < length:
        if html.startswith("<div", pos):
            depth += 1
            pos += 4
        elif html.startswith("</div>", pos):
            depth -= 1
            if depth == 0:
                close_start = pos
                break
            pos += len("</div>")
        else:
            pos += 1

    if close_start is None:
        raise ValueError("No se pudo ubicar el cierre del contenedor de productos")

    return html[:close_start] + block + html[close_start:]


def append_product_to_js(js_text: str, entry: str) -> str:
    marker = "const productData = {"
    start = js_text.find(marker)
    if start == -1:
        raise ValueError("No se encontró la definición de productData en js/scriptt.js")

    closing = js_text.find("\n    };", start)
    if closing == -1:
        raise ValueError("No se encontró el cierre de productData en js/scriptt.js")

    return js_text[:closing] + ",\n" + entry + js_text[closing:]


def main() -> None:
    if not PRODUCTS_HTML.exists():
        raise SystemExit("productos.html no existe en la raíz del proyecto.")

    print("\n=== Alta rápida de productos BERA clothing ===\n")
    name = prompt("Nombre del producto:")
    if not name:
        raise SystemExit("Se requiere un nombre.")

    slug = slugify(name)

    while True:
        price_input = prompt("Precio en ARS (ej 18500):")
        try:
            price_value = int(float(price_input))
            break
        except ValueError:
            print("Ingresá un número válido.")

    category = choose_category()
    talle = prompt("Talle (default 'u')", default="u") or "u"
    badge = prompt("Etiqueta/Badge (Nuevo, Destacado, New Trends, dejar vacío si no aplica)").title()
    destacado = prompt("¿Destacar en secciones especiales? (s/n)", default="n").lower() == "s"

    img_path_input = prompt("Ruta de la imagen local (png/jpg)")
    src_image = Path(img_path_input).expanduser()
    if not src_image.is_file():
        raise SystemExit("La imagen indicada no existe.")

    image_rel = copy_image(src_image, slug)

    details_input = prompt("Detalles para el modal (separá por ';').", default="Medida: Único;Material: ver tabla")
    detail_items = [d.strip() for d in details_input.split(';') if d.strip()]
    details_html = '<br>'.join(detail_items)

    description = prompt("Descripción breve para el modal", default="Descripción pendiente.")

    price_display = format_price(price_value)

    attrs = [
        'class="producto-item"',
        f'data-tipo="{category}"',
        f'data-talle="{talle}"',
        f'data-price="{price_value}"'
    ]
    if badge:
        attrs.append(f'data-badge="{badge}"')
    if destacado:
        attrs.append('data-destacado="true"')

    html_block = textwrap.dedent(f"""
          <div {' '.join(attrs)}>
            <img src="{image_rel}" alt="{name}" width="800" height="1000" loading="lazy" decoding="async">
            <h3>{name}</h3>
            <p class="price">{price_display}</p>
            <button type="button" class="add-to-cart-btn view-product-btn btn btn-secondary"
                    data-id="{slug}" data-name="{name}" data-price="{price_value}"
                    data-images="{image_rel}">Ver producto</button>
            <button class="add-to-cart-icon" type="button"
                    data-id="{slug}" data-name="{name}" data-price="{price_value}">+</button>
            <span class="add-to-cart-label">Añadir al carrito</span>
          </div>
""")

    html_block = "\n" + html_block.rstrip() + "\n"

    html_content = PRODUCTS_HTML.read_text(encoding="utf-8")
    html_updated = insert_product_html(html_content, CATEGORIES[category]["section"], html_block)
    PRODUCTS_HTML.write_text(html_updated, encoding="utf-8")

    js_entry = textwrap.dedent(f"""
      '{slug}': {{
        title: '{escape_js(name)}',
        price: '{price_display}',
        details: '{escape_js(details_html)}',
        description: '{escape_js(description)}',
        images: ['{image_rel}']
      }}
""")

    js_text = JS_PATH.read_text(encoding="utf-8")
    js_updated = append_product_to_js(js_text, js_entry.rstrip())
    JS_PATH.write_text(js_updated, encoding="utf-8")

    print("\n🎉 Producto agregado. Recordá revisar el home si necesitás destacar el ítem en otras secciones o ajustar badges específicos.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperación cancelada.")
