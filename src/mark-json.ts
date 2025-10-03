import type { RootNode, SectionNode, ParagraphNode, ParagraphMark, MarkRule } from "./definitions";

function fromMarkdown(text: string): RootNode {
  const { frontmatter, content } = splitFrontmatter(text);

  let metadata: Partial<RootNode> = {};
  if (frontmatter.trim()) {
    metadata = parseFrontmatter(frontmatter) as Partial<RootNode>;
  }

  const root: RootNode = {
    type: 'root',
    title: metadata.title ?? '',
    author: metadata.author ?? '',
    language: metadata.language ?? '',
    translator: metadata.translator ?? '',
    date: metadata.date ? String(metadata.date) : '',
    content: []
  };

  const lines = content.split('\n').filter(line => line.trim() !== '');
  const sectionStack: SectionNode[] = [];

  for (const line of lines) {
    if (line[0] === '#') {
      let depth = 0;
      while (line[depth] === '#') depth++;
      const title = line.slice(depth).trim();

      if (depth === 1) {
        root.title = title;
        sectionStack.length = 0;
      } else {
        const newSection: SectionNode = {
          type: 'section',
          title,
          depth: depth - 1,
          content: []
        };

        while (sectionStack.length && sectionStack[sectionStack.length - 1]!.depth >= newSection.depth) {
          sectionStack.pop();
        }

        const parent = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1]! : root;
        parent.content.push(newSection);

        sectionStack.push(newSection);
      }
    } else {
      const paragraph = parseParagraph(line);

      const parent = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1]! : root;
      parent.content.push(paragraph);
    }
  }

  return root;
}

function splitFrontmatter(markdownContent: string): { frontmatter: string; content: string } {
  const start = markdownContent.indexOf('---\n');
  if (start !== 0) return { frontmatter: '', content: markdownContent };

  const end = markdownContent.indexOf('\n---', start + 4);
  if (end === -1) return { frontmatter: '', content: markdownContent };

  const frontmatter = markdownContent.slice(start + 4, end).trim();
  const content = markdownContent.slice(end + 4).trimStart();

  return { frontmatter, content };
}


function parseFrontmatter(frontmatter: string): Record<string, string> {
  const metadata: Record<string, string> = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep > -1) {
      const key = line.slice(0, sep).trim();
      const value = line.slice(sep + 1).trim();
      if (key) metadata[key] = value;
    }
  }

  return metadata;
}


function parseParagraph(text: string): ParagraphNode {
  let content = '';
  const marks: ParagraphMark[] = [];

  let buffer = '';
  let inside: MarkRule | null = null;

  for (let i = 0; i < text.length; i++) {
    const remaining = text.slice(i);

    if (inside) {
      const { delimiter } = inside;
      if (remaining.startsWith(delimiter)) {
        const start = content.length;
        content += buffer;
        const end = content.length;

        marks.push({
          type: inside.type as ParagraphMark['type'],
          start,
          end
        });

        buffer = '';
        inside = null;
        i += delimiter.length - 1;
        continue;
      } else {
        buffer += text[i];
        continue;
      }
    }

    const foundRule = markRules.find(rule => remaining.startsWith(rule.delimiter));
    if (foundRule) {
      inside = foundRule;
      buffer = '';
      i += foundRule.delimiter.length - 1;
    } else {
      content += text[i];
    }
  }

  if (inside) {
    content += inside.delimiter + buffer;
  }

  return {
    type: 'paragraph',
    content,
    marks
  };
}

const markRules: MarkRule[] = [
  {
    type: 'emphasis',
    delimiter: '*',
  },
  {
    type: 'emphasis',
    delimiter: '_',
  }
];

export { fromMarkdown }
