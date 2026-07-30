import type { Metadata } from "next";
import { CatalogAdmin } from "./CatalogAdmin";

export const metadata: Metadata = {
  title: "Carga de productos",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CargarProductosPage() {
  return <CatalogAdmin />;
}
