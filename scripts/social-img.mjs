//@ts-check
import nodeHtmlToImage from "node-html-to-image";
import * as uuid from "uuid";
import { format, parseJSON } from "date-fns";
import { ContentScript } from "@frontmatter/extensibility";
import fs from "fs";
import path from "path";
import { encode } from "html-entities";

const html = fs.readFileSync(path.resolve("./scripts/social-banner.html")).toString();

const setDate = (date) => {
  return format(date, "MMM dd, yyyy");
};

const contentScriptArgs = ContentScript.getArguments();
if (contentScriptArgs) {
  const { workspacePath, frontMatter } = contentScriptArgs;
  if (workspacePath && frontMatter) {
    if (frontMatter.title && frontMatter.lastModified) {
      const encodedTitle = encode(frontMatter.title);
      const parsedHtml = html
        .replace(`{title}`, encodedTitle)
        .replace(`{updateDate}`, setDate(parseJSON(frontMatter.lastModified)));
      const fileName = `${uuid.v4()}.png`;
      // @ts-ignore

      nodeHtmlToImage({
        output: `${workspacePath}/public/assets/social/${fileName}`,
        html: parsedHtml,
      })
        .then(() =>
          ContentScript.updateFrontMatter({
            preview: `/assets/social/${fileName}`,
          })
        )
        .catch(() => ContentScript.done(`preview: /assets/social/${fileName}`));
    } else {
      console.error("missing data");
    }
  }
}
