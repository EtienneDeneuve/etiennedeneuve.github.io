import {
  getSortedSpeakingTopics,
  mediaKitConfig,
  speakingFormats,
  speakingPageConfig,
} from "../config/speaking.ts";
import { siteConfig } from "../config/site.ts";

export type MediaKitLang = "fr" | "en";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderMediaKitHtml(lang: MediaKitLang = "fr"): string {
  const topics = getSortedSpeakingTopics();
  const generatedAt = new Date().toISOString().slice(0, 10);
  const siteUrl = siteConfig.seo.siteUrl;
  const speakingUrl = lang === "en" ? `${siteUrl}/en/speaking/` : `${siteUrl}/speaking/`;
  const photoUrl = `${siteUrl}${mediaKitConfig.photo.src}`;
  const photoDownloadUrl = `${siteUrl}${mediaKitConfig.photo.fullSrc ?? mediaKitConfig.photo.src}`;

  const labels =
    lang === "en"
      ? {
          title: "Media Kit",
          subtitle: "Press & event organizers",
          shortBio: "Short bio",
          longBio: "Long bio",
          themes: "Speaking themes",
          formats: "Available formats",
          languages: "Languages",
          links: "Links",
          contact: "Contact",
          photo: "Headshot",
          downloadPhoto: "Download photo",
          downloadPdf: "PDF version",
          footer: "Generated from the same source as the speaking page.",
          email: "Email",
          website: "Website",
          speakingPage: "Speaking page",
        }
      : {
          title: "Media Kit",
          subtitle: "Presse et organisateurs d'événements",
          shortBio: "Bio courte",
          longBio: "Bio longue",
          themes: "Thèmes d'intervention",
          formats: "Formats disponibles",
          languages: "Langues",
          links: "Liens",
          contact: "Contact",
          photo: "Photographie",
          downloadPhoto: "Télécharger la photo",
          downloadPdf: "Version PDF",
          footer: "Généré à partir des mêmes données que la page Speaking.",
          email: "Email",
          website: "Site web",
          speakingPage: "Page Speaking",
        };

  const topicItems = topics.map((topic) => `<li>${escapeHtml(topic.title[lang])}</li>`).join("\n");

  const formatBlocks = speakingFormats
    .map(
      (format) => `
    <h3>${escapeHtml(format.label[lang])}</h3>
    <p>${escapeHtml(format.description[lang])}</p>`
    )
    .join("\n");

  const longBioParagraphs = mediaKitConfig.longBio[lang]
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(labels.title)} — ${escapeHtml(siteConfig.identity.name)}</title>
  <style>
    @media print {
      @page { margin: 2cm; size: A4; }
      body { font-size: 12pt; line-height: 1.6; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #1a1a1a;
      background: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 3px solid #14deba;
    }
    .header h1 { font-size: 2.2rem; margin: 0 0 0.35rem 0; color: #090b11; }
    .header p { font-size: 1rem; color: #666; margin: 0; }
    .section { margin-bottom: 2rem; }
    .section h2 {
      font-size: 1.5rem;
      color: #090b11;
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.35rem;
      border-bottom: 2px solid #14deba;
    }
    .section h3 { font-size: 1.1rem; color: #090b11; margin: 1rem 0 0.35rem 0; }
    .section p { margin: 0 0 0.75rem 0; text-align: justify; }
    .headshot {
      display: block;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 1rem;
      border: 2px solid #e0e0e0;
    }
    .topics-list { list-style: none; padding: 0; margin: 0; }
    .topics-list li {
      margin: 0.65rem 0;
      padding-left: 1.25rem;
      position: relative;
    }
    .topics-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #14deba;
      font-weight: bold;
    }
    .contact-info {
      background: #f5f5f5;
      padding: 1.25rem;
      border-radius: 8px;
    }
    .contact-info p { margin: 0.35rem 0; text-align: left; }
    .contact-info a { color: #0a8f78; text-decoration: none; }
    .footer {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 0.85rem;
      color: #666;
    }
    .download-links { text-align: center; margin: 1rem 0; }
    .download-links a { color: #0a8f78; margin: 0 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(siteConfig.identity.name)}</h1>
    <p>${escapeHtml(labels.subtitle)}</p>
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.photo)}</h2>
    <img class="headshot" src="${photoUrl}" alt="${escapeHtml(mediaKitConfig.photo.alt[lang])}" width="${mediaKitConfig.photo.width ?? 160}" height="${mediaKitConfig.photo.height ?? 160}">
    <p class="download-links no-print">
      <a href="${photoDownloadUrl}" download="${mediaKitConfig.photo.downloadFilename}">${escapeHtml(labels.downloadPhoto)}</a>
    </p>
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.shortBio)}</h2>
    <p>${escapeHtml(mediaKitConfig.shortBio[lang])}</p>
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.longBio)}</h2>
    ${longBioParagraphs}
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.themes)}</h2>
    <p>${escapeHtml(mediaKitConfig.themesIntro[lang])}</p>
    <ul class="topics-list">${topicItems}</ul>
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.formats)}</h2>
    ${formatBlocks}
  </div>

  <div class="section">
    <h2>${escapeHtml(labels.languages)}</h2>
    <p>${escapeHtml(mediaKitConfig.languages[lang])}</p>
  </div>

  <div class="section contact-info">
    <h2 style="border: none; margin-top: 0;">${escapeHtml(labels.contact)}</h2>
    <p><strong>${escapeHtml(labels.email)}:</strong> <a href="mailto:${siteConfig.omnivya.email}">${escapeHtml(siteConfig.omnivya.email)}</a></p>
    <p><strong>${escapeHtml(labels.website)}:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
    <p><strong>${escapeHtml(labels.speakingPage)}:</strong> <a href="${speakingUrl}">${speakingUrl}</a></p>
    <p><strong>LinkedIn:</strong> <a href="${siteConfig.social.linkedin}">${escapeHtml(siteConfig.identity.name)}</a></p>
    <p><strong>GitHub:</strong> <a href="${siteConfig.social.github}">EtienneDeneuve</a></p>
  </div>

  <div class="footer">
    <p>${escapeHtml(labels.footer)}</p>
    <p>${generatedAt} — ${speakingUrl}</p>
  </div>
</body>
</html>`;
}

export function renderMediaKitDocumentVariants(): { fr: string; en: string } {
  return {
    fr: renderMediaKitHtml("fr"),
    en: renderMediaKitHtml("en"),
  };
}

export { speakingPageConfig, mediaKitConfig };
