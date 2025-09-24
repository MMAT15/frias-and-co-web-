from flask import Flask, render_template, request, redirect, url_for, flash
from pathlib import Path
import shutil
import re
import textwrap

app = Flask(__name__)
app.secret_key = 'supersecret'

# Rutas base
ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets" / "images"
PRODUCTS_HTML = ROOT / "productos.html"
JS_PATH = ROOT / "js" / "scriptt.js"

# Categorías
CATEGORIES = {
    "remera": "Remeras", "denim": "Denim", "pantalon": "Pantalones",
    "short": "Shorts / Minis", "top": "Tops", "body": "Bodys",
    "set": "Sets", "abrigo": "Abrigos", "vestido": "Vestidos", "accesorio": "Accesorios"
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return slug.strip("-")


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            # Datos del formulario
            name = request.form["name"]
            slug = slugify(name)
            price = int(float(request.form["price"]))
            category = request.form["category"]
            talle = request.form["talle"] or "u"
            badge = request.form["badge"].title()
            destacado = "destacado" in request.form
            description = request.form["description"]
            details = request.form["details"]
            detail_html = "<br>".join(d.strip() for d in details.split(";") if d.strip())

            # Guardar imagen
            image = request.files["image"]
            suffix = Path(image.filename).suffix
            dest_path = ASSETS_DIR / f"{slug}{suffix}"
            ASSETS_DIR.mkdir(parents=True, exist_ok=True)
            image.save(dest_path)
            image_rel = f"assets/images/{dest_path.name}"

            # Generar HTML producto
            price_display = f"${price:,.0f}".replace(",", ".")
            attrs = [
                'class="producto-item"',
                f'data-tipo="{category}"',
                f'data-talle="{talle}"',
                f'data-price="{price}"'
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
                          data-id="{slug}" data-name="{name}" data-price="{price}"
                          data-images="{image_rel}">Ver producto</button>
                  <button class="add-to-cart-icon" type="button"
                          data-id="{slug}" data-name="{name}" data-price="{price}">+</button>
                  <span class="add-to-cart-label">Añadir al carrito</span>
                </div>
            """).strip()

            html = PRODUCTS_HTML.read_text(encoding="utf-8")
            html_updated = html.replace("</section>", html_block + "\n</section>", 1)
            PRODUCTS_HTML.write_text(html_updated, encoding="utf-8")

            # Agregar al JS
            js_text = JS_PATH.read_text(encoding="utf-8")
            marker = "const productData = {"
            idx = js_text.find(marker)
            end_idx = js_text.find("\n    };", idx)
            js_entry = textwrap.dedent(f"""
              '{slug}': {{
                title: '{name}',
                price: '{price_display}',
                details: '{detail_html}',
                description: '{description}',
                images: ['{image_rel}']
              }},""")
            new_js = js_text[:end_idx] + "\n" + js_entry + js_text[end_idx:]
            JS_PATH.write_text(new_js, encoding="utf-8")

            flash("✅ Producto agregado correctamente.")
            return redirect(url_for("index"))

        except Exception as e:
            flash(f"❌ Error: {str(e)}")

    return render_template("form.html", categories=CATEGORIES)


if __name__ == "__main__":
    app.run(debug=True, port=5050)
