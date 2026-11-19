import { promises as fs } from "node:fs";
import path from "node:path";
import { isStagingDeploy, stagingHeaders, stagingRobotsTxt } from "./staging-mode.mjs";

// Everything search engines read besides the visible page: JSON-LD, sitemap.xml and robots.txt.
// All values come from content/site.config.json, so the demo flags there also cover this output.
const SCHEMA_CONTEXT = "https://schema.org";

const isIndexable = ({ robots }) => !/noindex/i.test(robots);
const assetUrl = (web, relativePath) => `${web.url}/${relativePath}`;
const escapeXml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function postalAddress({ address }) {
  return {
    "@type": "PostalAddress",
    streetAddress: address.lineAr,
    addressLocality: address.localityAr,
    postalCode: address.postal,
    addressCountry: address.countryCode,
  };
}

/** One entity typed as both Organization and GeneralContractor, so it is a single node in the graph. */
function organizationJsonLd(site) {
  const { company, contact, social, web } = site;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": ["Organization", "GeneralContractor"],
    "@id": `${web.url}/#organization`,
    name: company.nameAr,
    alternateName: [company.nameEn, company.nameLatin],
    slogan: company.taglineAr,
    description: company.descriptionAr,
    url: `${web.url}/`,
    logo: assetUrl(web, web.ogImage),
    image: assetUrl(web, web.ogImage),
    telephone: contact.phone.href,
    email: contact.email,
    address: postalAddress(site),
    areaServed: company.areaServedAr.map((name) => ({ "@type": "City", name })),
    sameAs: social.map((entry) => entry.url),
  };
}

/** A script element's content must not be able to close its own tag, hence the escaped "<". */
export const organizationJsonLdTag = (site) =>
  `<script type="application/ld+json">${JSON.stringify(organizationJsonLd(site)).replace(/</g, "\\u003c")}</script>`;

export const ogImageUrl = ({ web }) => assetUrl(web, web.ogImage);

/** Only indexable pages: a noindex page listed in the sitemap is a contradiction crawlers report. */
function sitemapXml(site, pages) {
  const urls = pages
    .filter(isIndexable)
    .map((page) => `  <url><loc>${escapeXml(`${site.web.url}${page.path}`)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

const robotsTxt = (site) => `User-agent: *\nAllow: /\n\nSitemap: ${site.web.url}/sitemap.xml\n`;

async function writeStagingFiles(outDir) {
  await fs.writeFile(path.join(outDir, "robots.txt"), stagingRobotsTxt);
  await fs.writeFile(path.join(outDir, "_headers"), stagingHeaders);
}

export async function writeSeoFiles(outDir, site, pages) {
  if (isStagingDeploy()) return writeStagingFiles(outDir);
  await fs.writeFile(path.join(outDir, "sitemap.xml"), sitemapXml(site, pages));
  await fs.writeFile(path.join(outDir, "robots.txt"), robotsTxt(site));
}
