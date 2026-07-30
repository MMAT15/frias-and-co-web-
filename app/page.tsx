import type { Metadata } from "next";
import { BoutiqueHome } from "./BoutiqueHome";

export const metadata: Metadata = {
  title: "Viviana Boutique | Venta online y showroom en Hudson",
  description:
    "Ropa femenina, venta online, showroom en Pueblo Nuevo - Hudson, envíos a todo el país y pagos con tarjetas.",
};

export default function Home() {
  return <BoutiqueHome />;
}
