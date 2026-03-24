import { Metadata } from "next";

const SITE = "PDFToolkit";
const BASE_URL = "https://pdftoolkit.com";

export function toolMeta(name: string, description: string, slug: string): Metadata {
  const title = `${name} - Free Online ${name} Tool | ${SITE}`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/tools/${slug}`, siteName: SITE, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/tools/${slug}` },
  };
}

export function categoryMeta(name: string, description: string, slug: string): Metadata {
  const title = `${name} Tools - Free Online PDF Tools | ${SITE}`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/category/${slug}`, siteName: SITE, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `${BASE_URL}/category/${slug}` },
  };
}

export const homeMeta: Metadata = {
  title: `${SITE} - Free Online PDF Tools`,
  description: "Free online PDF tools to convert, edit, compress, secure and manage your PDF files. No installation required.",
  openGraph: { title: `${SITE} - Free Online PDF Tools`, description: "Free online PDF tools for all your PDF needs.", url: BASE_URL, siteName: SITE, type: "website" },
  twitter: { card: "summary_large_image", title: `${SITE} - Free Online PDF Tools` },
};
