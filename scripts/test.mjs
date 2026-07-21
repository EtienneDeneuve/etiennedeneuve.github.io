import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath, filePath, frontMatter, answers } = ContentScript.getArguments();

ContentScript.done("The content returned for your notification.");
