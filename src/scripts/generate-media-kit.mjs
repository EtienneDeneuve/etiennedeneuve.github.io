#!/usr/bin/env node
/**
 * Generate Media Kit PDF
 * 
 * This script generates a PDF media kit from an HTML template.
 * Run during build time to create /public/media-kit.pdf
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Site config (inline to avoid TypeScript import issues)
const siteConfig = {
  author: {
    name: "Etienne Deneuve",
  },
  site: {
    url: "https://etienne.deneuve.xyz",
  },
  contact: {
    personalEmail: "etienne@omnivya.fr",
    businessBookingUrl: "https://outlook.office365.com/owa/calendar/SimplifiED1@simplified.fr/bookings/",
  },
  social: {
    twitter: "https://twitter.com/EtienneDinfo",
    linkedin: "https://linkedin.com/in/EtienneDeneuve",
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

// Media kit HTML template
const mediaKitHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Kit - ${siteConfig.author.name}</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
        size: A4;
      }
      body {
        font-size: 12pt;
        line-height: 1.6;
      }
      .page-break {
        page-break-before: always;
      }
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
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 3px solid #14deba;
    }
    .header h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      color: #090b11;
    }
    .header p {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }
    .section {
      margin-bottom: 2.5rem;
    }
    .section h2 {
      font-size: 1.8rem;
      color: #090b11;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #14deba;
    }
    .section h3 {
      font-size: 1.3rem;
      color: #090b11;
      margin: 1.5rem 0 0.5rem 0;
    }
    .section p {
      margin: 0 0 1rem 0;
      text-align: justify;
    }
    .contact-info {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    .contact-info h3 {
      margin-top: 0;
    }
    .contact-info p {
      margin: 0.5rem 0;
    }
    .contact-info a {
      color: #14deba;
      text-decoration: none;
    }
    .topics-list {
      list-style: none;
      padding: 0;
    }
    .topics-list li {
      margin: 1rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    .topics-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #14deba;
      font-weight: bold;
      font-size: 1.5rem;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${siteConfig.author.name}</h1>
    <p>Media Kit - Press & Event Organizers</p>
  </div>

  <div class="section">
    <h2>Bio Courte</h2>
    <p>
      ${siteConfig.author.name} est ${siteConfig.author.jobTitle}, spécialisé en DevSecOps,
      Platform Engineering et transformation technique. Speaker, writer et expert reconnu
      dans l'écosystème cloud et DevOps.
    </p>
  </div>

  <div class="section">
    <h2>Bio Longue</h2>
    <p>
      ${siteConfig.author.name} est un expert en infrastructure cloud, DevSecOps et Platform Engineering
      avec plus de 15 ans d'expérience. Il accompagne les organisations dans leur transformation technique,
      de la conception à l'implémentation. En tant que ${siteConfig.author.jobTitle}, il a aidé de nombreuses
      entreprises à moderniser leur infrastructure, améliorer leur sécurité et accélérer leurs déploiements.
    </p>
    <p>
      ${siteConfig.author.name} est également un speaker actif dans la communauté technique, partageant
      ses connaissances lors de conférences et workshops. Il écrit régulièrement sur son blog et contribue
      à l'écosystème open source.
    </p>
  </div>

  <div class="section">
    <h2>Sujets de Conférence</h2>
    <ul class="topics-list">
      <li>DevSecOps : Transformer la sécurité dans le cycle de développement</li>
      <li>Platform Engineering : Construire une plateforme interne pour accélérer le développement</li>
      <li>Infrastructure as Code : Terraform et au-delà</li>
      <li>Zero Trust : Architecture et implémentation</li>
      <li>CTO/Staff Engineering : Leadership technique et transformation</li>
      <li>Git pour les Ops : Moderniser les pratiques de développement</li>
    </ul>
  </div>

  <div class="section">
    <h2>Formats Disponibles</h2>
    <h3>Keynote</h3>
    <p>Présentation inspirante pour ouvrir ou clôturer votre événement. Durée : 30-60 min</p>
    
    <h3>Workshop</h3>
    <p>Session interactive et pratique avec démonstrations, exercices et Q&A. Durée : 60-120 min</p>
    
    <h3>Panel</h3>
    <p>Discussion avec d'autres experts sur un sujet donné. Durée : 45-60 min</p>
  </div>

  <div class="section">
    <h2>Langues</h2>
    <p>Français (FR) et Anglais (EN)</p>
  </div>

  <div class="contact-info">
    <h3>Contact</h3>
    <p><strong>Email:</strong> <a href="mailto:${siteConfig.contact.personalEmail}">${siteConfig.contact.personalEmail}</a></p>
    <p><strong>Site web:</strong> <a href="${siteConfig.site.url}">${siteConfig.site.url}</a></p>
    <p><strong>Réserver un appel:</strong> <a href="${siteConfig.contact.businessBookingUrl}">Lien de réservation</a></p>
    <p><strong>Twitter:</strong> <a href="${siteConfig.social.twitter}">@EtienneDinfo</a></p>
    <p><strong>LinkedIn:</strong> <a href="${siteConfig.social.linkedin}">${siteConfig.author.name}</a></p>
  </div>

  <div class="footer">
    <p>Media Kit généré le ${new Date().toLocaleDateString("fr-FR")}</p>
    <p>${siteConfig.site.url}/speaking</p>
  </div>
</body>
</html>`;

// For now, we'll save the HTML file
// In production, you would use a library like puppeteer or playwright to convert to PDF
// For simplicity, we'll create an HTML file that can be printed to PDF
const outputPath = path.join(rootDir, "public", "media-kit.html");
const pdfOutputPath = path.join(rootDir, "public", "media-kit.pdf");

// Ensure public directory exists
const publicDir = path.join(rootDir, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write HTML file
fs.writeFileSync(outputPath, mediaKitHTML, "utf-8");
console.log(`✓ Media kit HTML generated: ${outputPath}`);

// Note: PDF generation would require puppeteer or similar
// For now, we create an HTML file that can be converted to PDF manually
// or via a build step with puppeteer
console.log(`ℹ To generate PDF, install puppeteer and uncomment PDF generation code`);
console.log(`  Or use browser print-to-PDF on ${outputPath}`);

// Placeholder for PDF file (will be generated by CI or manually)
if (!fs.existsSync(pdfOutputPath)) {
  // Create a placeholder or note file
  const noteContent = `This PDF should be generated from media-kit.html using a tool like puppeteer.
  
To generate:
1. Install puppeteer: npm install -D puppeteer
2. Use puppeteer to convert HTML to PDF
3. Or use browser print-to-PDF on media-kit.html
`;
  fs.writeFileSync(pdfOutputPath + ".note", noteContent, "utf-8");
}
