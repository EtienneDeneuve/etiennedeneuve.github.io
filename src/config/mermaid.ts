/**
 * Mermaid theme for Thinking articles — graphite / ivory / copper.
 * Baked into SVG at build time via remark-mermaidjs (Playwright).
 * global.css also forces the same palette with !important so stale
 * / default SVGs still look on-brand in dev.
 */
export const mermaidThemeCSS = `
  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: #1b1e20 !important;
    stroke: #f0aa78 !important;
    stroke-width: 1.25px !important;
    filter: none !important;
  }
  [data-look="neo"] .node rect,
  [data-look="neo"] .node polygon,
  [data-look="neo"].node rect,
  [data-look="neo"].node polygon {
    fill: #1b1e20 !important;
    stroke: #f0aa78 !important;
    filter: none !important;
  }
  .node .label,
  .nodeLabel,
  .node .label span,
  .node foreignObject div,
  .node foreignObject span,
  .node foreignObject p {
    color: #f7f3ec !important;
    fill: #f7f3ec !important;
    font-weight: 600 !important;
    letter-spacing: -0.01em;
  }
  .edgePath .path,
  .flowchart-link {
    stroke: #9aa0a3 !important;
    stroke-width: 1.25px !important;
  }
  .edgeLabel rect {
    fill: #111416 !important;
    opacity: 0.9 !important;
    stroke: none !important;
  }
  .edgeLabel text,
  .edgeLabel tspan {
    fill: #cdd0cf !important;
    font-size: 11px !important;
  }
  .marker,
  .marker path,
  .arrowheadPath,
  .root .anchor path {
    fill: #f0aa78 !important;
    stroke: #f0aa78 !important;
  }
  .cluster rect {
    fill: #16191b !important;
    stroke: rgba(243, 239, 231, 0.14) !important;
    stroke-width: 1px !important;
    filter: none !important;
  }
  .cluster-label,
  .cluster-label span,
  .cluster-label text {
    fill: #f0aa78 !important;
    color: #f0aa78 !important;
    font-weight: 650 !important;
    letter-spacing: 0.06em !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
  }
`;

export const mermaidConfig = {
  theme: "base",
  darkMode: true,
  look: "classic",
  themeVariables: {
    darkMode: true,
    background: "#111416",
    fontFamily: "Outfit, system-ui, -apple-system, Segoe UI, sans-serif",
    fontSize: "14px",
    primaryColor: "#1b1e20",
    primaryTextColor: "#f7f3ec",
    primaryBorderColor: "#f0aa78",
    secondaryColor: "#16191b",
    secondaryTextColor: "#f7f3ec",
    secondaryBorderColor: "rgba(243, 239, 231, 0.22)",
    tertiaryColor: "#151819",
    tertiaryTextColor: "#cdd0cf",
    tertiaryBorderColor: "rgba(243, 239, 231, 0.16)",
    mainBkg: "#1b1e20",
    nodeBkg: "#1b1e20",
    nodeBorder: "#f0aa78",
    nodeTextColor: "#f7f3ec",
    textColor: "#f7f3ec",
    lineColor: "#9aa0a3",
    edgeLabelBackground: "#111416",
    labelTextColor: "#cdd0cf",
    labelBackground: "#111416",
    clusterBkg: "#16191b",
    clusterBorder: "rgba(243, 239, 231, 0.14)",
    titleColor: "#f0aa78",
    actorBkg: "#1b1e20",
    actorBorder: "#f0aa78",
    actorTextColor: "#f7f3ec",
    actorLineColor: "#9aa0a3",
    signalColor: "#cdd0cf",
    signalTextColor: "#f7f3ec",
    labelBoxBkgColor: "#1b1e20",
    labelBoxBorderColor: "#f0aa78",
    noteBkgColor: "#16191b",
    noteTextColor: "#f7f3ec",
    noteBorderColor: "#f0aa78",
    activationBkgColor: "#25292c",
    activationBorderColor: "#f0aa78",
  },
  themeCSS: mermaidThemeCSS,
  flowchart: {
    curve: "basis",
    padding: 16,
    htmlLabels: false,
    /**
     * useMaxWidth:true emits width="100%" which breaks foreignObject
     * edge-label placement when the SVG is CSS-scaled. Pixel width +
     * max-width:100% in CSS keeps labels on their edges.
     */
    useMaxWidth: false,
    nodeSpacing: 48,
    rankSpacing: 52,
  },
  sequence: {
    actorMargin: 28,
    messageMargin: 36,
    mirrorActors: false,
  },
};

/** Playwright needs Outfit while baking SVG. Must be an array (isomorphic iterates it). */
export const mermaidCssUrls = [
  "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&display=swap",
];
