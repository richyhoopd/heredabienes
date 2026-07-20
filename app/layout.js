import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://www.heredabienes.com.mx"),
  title:
    "HEREDABIENES. Grupo Inmobiliario | Regularización de Propiedades, Sucesiones y Escrituración en Jalisco",
  description:
    "HEREDABIENES Grupo Inmobiliario — Especialistas en regularización de propiedades heredadas, sucesiones testamentarias e intestamentarias, escrituración y gestión patrimonial en Guadalajara, Jalisco. Consulta gratuita. Tu patrimonio, en manos confiables.",
  keywords: [
    "regularización de propiedades",
    "sucesiones",
    "herencias",
    "escrituración",
    "gestión patrimonial",
    "Jalisco",
    "Guadalajara",
    "propiedades heredadas",
    "intestado",
    "testamento",
    "registro público de la propiedad",
    "avalúos",
    "notario",
    "HEREDABIENES",
  ],
  authors: [{ name: "HEREDABIENES. Grupo Inmobiliario" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.heredabienes.com.mx" },
  manifest: "/manifest.json",
  icons: {
    icon: "/iconblue.png",
    shortcut: "/iconblue.png",
    apple: "/iconblue.png",
  },
  other: {
    "geo.region": "MX-JAL",
    "geo.placename": "Guadalajara, Jalisco, México",
    language: "es",
  },
  openGraph: {
    type: "website",
    siteName: "HEREDABIENES. Grupo Inmobiliario",
    title:
      "HEREDABIENES. Grupo Inmobiliario — Tu patrimonio, en manos confiables.",
    description:
      "Regularizamos, escrituramos y protegemos tu herencia en Jalisco. Más de 500 familias atendidas. Sucesiones, regularización de propiedades y asesoría patrimonial. Consulta gratuita.",
    url: "https://www.heredabienes.com.mx",
    locale: "es_MX",
    images: [
      {
        url: "https://www.heredabienes.com.mx/og-image.png",
        width: 1200,
        height: 630,
        alt: "HEREDABIENES Grupo Inmobiliario — Regularización de propiedades y sucesiones en Jalisco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "HEREDABIENES. Grupo Inmobiliario — Tu patrimonio, en manos confiables.",
    description:
      "Regularizamos, escrituramos y protegemos tu herencia en Jalisco. Consulta gratuita. +500 familias atendidas.",
    images: [
      {
        url: "https://www.heredabienes.com.mx/og-image.png",
        alt: "HEREDABIENES Grupo Inmobiliario",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0098FF",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "HEREDABIENES. Grupo Inmobiliario",
  description:
    "Especialistas en regularización de propiedades heredadas, sucesiones, escrituración y gestión patrimonial en Jalisco, México.",
  url: "https://www.heredabienes.com.mx",
  logo: "https://www.heredabienes.com.mx/iconblue.png",
  image: "https://www.heredabienes.com.mx/og-image.png",
  telephone: "+52-1-33-1301-3253",
  email: "heredabienes@outlook.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Guadalajara",
    addressRegion: "Jalisco",
    addressCountry: "MX",
  },
  areaServed: { "@type": "State", name: "Jalisco" },
  sameAs: [
    "https://wa.me/5213313013253",
    "https://facebook.com/heredabienes",
    "https://instagram.com/heredabienes",
  ],
  openingHours: "Mo-Fr 09:00-18:00",
  priceRange: "$$",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Se conservan los <link> literales de public/index.html en lugar de
            next/font para no alterar el FOUT ni las metricas de fallback (riesgo R3). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
