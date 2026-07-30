import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto =
    headersList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "http://localhost:3000";
  const ogImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Viviana Boutique",
      template: "%s | Viviana Boutique",
    },
    description:
      "Ropa femenina, venta online, showroom en Pueblo Nuevo - Hudson, envíos a todo el país y pagos con tarjetas.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Viviana Boutique",
      description: "Venta online + showroom. Envíos a todo el país.",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "Viviana Boutique",
      description: "Venta online + showroom. Envíos a todo el país.",
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
