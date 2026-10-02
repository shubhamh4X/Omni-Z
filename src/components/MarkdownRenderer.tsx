import React from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

function renderContentWithMath(rawText: string): string {
  const mathPlaceholders: string[] = [];

  // 1. Extract block math $$...$$
  let text = rawText.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      const placeholder = `@@@MATH_BLOCK_${mathPlaceholders.length}@@@`;
      mathPlaceholders.push(`<div class="my-3 overflow-x-auto py-1 text-center">${rendered}</div>`);
      return placeholder;
    } catch {
      return _match;
    }
  });

  // 2. Extract inline math $...$
  text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, math) => {
    // Avoid currency numbers like $100 or $5.50
    if (/^\s*\d+(\.\d+)?\s*$/.test(math)) {
      return match;
    }
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      const placeholder = `@@@MATH_INLINE_${mathPlaceholders.length}@@@`;
      mathPlaceholders.push(rendered);
      return `${prefix}${placeholder}`;
    } catch {
      return match;
    }
  });

  // 3. Parse Markdown
  let html = marked.parse(text, { async: false, breaks: true }) as string;

  // 4. Restore rendered math HTML
  mathPlaceholders.forEach((mathHtml, idx) => {
    const blockKey = `@@@MATH_BLOCK_${idx}@@@`;
    const inlineKey = `@@@MATH_INLINE_${idx}@@@`;
    html = html.replace(`<p>${blockKey}</p>`, mathHtml);
    html = html.replace(blockKey, mathHtml);
    html = html.replace(inlineKey, mathHtml);
  });

  return html;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split content by code blocks to render CodeBlock components natively
  const parts: Array<{ type: 'text' | 'code'; value: string; language?: string }> = [];

  const codeRegex = /```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      value: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-3 leading-relaxed text-[#e3e3e3]">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              language={part.language || 'text'}
              code={part.value}
            />
          );
        }

        const rawHtml = renderContentWithMath(part.value);

        return (
          <div
            key={index}
            className="prose prose-invert max-w-none text-[#e3e3e3] prose-p:my-2 prose-p:leading-relaxed prose-headings:text-[#e3e3e3] prose-headings:font-semibold prose-a:text-[#8ab4f8] prose-a:underline hover:prose-a:text-[#a8c7fa] prose-ul:my-2 prose-li:my-0.5 prose-table:border-collapse prose-th:border prose-th:border-[#3c4043] prose-th:p-2 prose-th:bg-[#1e1f20] prose-td:border prose-td:border-[#2d2f33] prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-[#8ab4f8] prose-blockquote:bg-[#1e1f20] prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r prose-code:text-[#e3e3e3] prose-code:bg-[#282a2c] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        );
      })}
    </div>
  );
};
