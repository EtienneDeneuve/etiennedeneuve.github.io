import assert from "node:assert/strict";
import { rehypeLocalizeHeadingAnchors } from "../../lib/rehype-localize-heading-anchors.ts";
import type { Root } from "hast";
import { VFile } from "vfile";

function treeWithAnchor(): Root {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "h2",
        properties: { id: "section" },
        children: [
          { type: "text", value: "Titre" },
          {
            type: "element",
            tagName: "a",
            properties: {
              className: ["heading-anchor"],
              href: "#section",
              ariaHidden: true,
              tabIndex: -1,
            },
            children: [{ type: "text", value: "#" }],
          },
        ],
      },
    ],
  };
}

function run(file: VFile) {
  const tree = treeWithAnchor();
  rehypeLocalizeHeadingAnchors()(tree, file);
  const link = (tree.children[0] as { children: Array<{ properties?: Record<string, unknown> }> })
    .children[1]!;
  return link.properties ?? {};
}

{
  const file = new VFile({ path: "src/content/blog/foo.md" });
  file.data = { astro: { frontmatter: { language: "fr" } } };
  const props = run(file);
  assert.equal(props.ariaLabel, "Lien vers cette section");
  assert.equal(props.ariaHidden, undefined);
  assert.equal(props.tabIndex, undefined);
}

{
  const file = new VFile({ path: "src/content/blog/foo-en.md" });
  file.data = { astro: { frontmatter: { language: "en" } } };
  const props = run(file);
  assert.equal(props.ariaLabel, "Link to this section");
}

{
  const file = new VFile({ path: "/tmp/2026-10-09-ia-accelere-code-ci-doit-suivre-en.md" });
  const props = run(file);
  assert.equal(
    props.ariaLabel,
    "Link to this section",
    "path -en.md falls back without frontmatter"
  );
}

console.log("rehype-localize-heading-anchors: ok");
