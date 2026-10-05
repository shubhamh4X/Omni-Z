import React from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { CodeBlock } from './CodeBlock';

marked.setOptions({
  gfm: true,
  breaks: true,
});

interface MarkdownRendererProps {
  content: string;
}

function formatAndCleanMarkdown(rawText: string): string {
  let text = rawText;

  const unitRegex = /\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?\s*(?:\\text\{\s*[^}]+\s*\}|(?:ms|s|sec|min|hr|fps|hz|khz|mhz|ghz|ns|μs|us|tps|tokens?|req|rpm|rps)\b))\s*\$/gi;
  text = text.replace(unitRegex, (_m, content) => {
    return content.replace(/\\text\{\s*([^}]+)\s*\}/g, ' $1 ').replace(/\s+/g, ' ').trim();
  });

  text = text.replace(/\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?%?\s*(?:\\text\{[-–—]+\}|[-–—]|to)\s*[~><=±\+\-]?\s*\d+(?:\.\d+)?\\?%?)\s*\$/g, (_m, content) => {
    return content.replace(/\\text\{[-–—]+\}/g, '–').replace(/\\%/g, '%').trim();
  });

  text = text.replace(/\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?(?:%|x|X))\s*\$/gi, '$1');

  text = text.replace(/\$([~><=±\+\-]\s*\d+(?:\.\d+)?%?)/g, '$1');

  text = text.replace(/([~><=±\+\-]?\d+(?:\.\d+)?%?)\s*\\text\{[-–—]+\}\s*(\d+(?:\.\d+)?\\?%?)/g, '$1–$2');

  text = text.replace(/\\?\$(\d+(?:\.\d+)?)\s*\\text\{[-–—]+\}\s*\\?\$(\d+(?:\.\d+)?)/g, '$$$1 – $$$2');
  text = text.replace(/\\\$(\d+(?:\.\d+)?)/g, '$$$1');

  text = text.replace(/\\text\{[-–—]+\}/g, '–');
  text = text.replace(/\\text\{\s*([a-zA-Z\s]+)\s*\}/g, ' $1 ');

  text = text.replace(/\\%/g, '%');

  text = text.replace(/(\n\|[^\n]+\|\n)(?=[^|\n])/g, '$1\n\n');
  text = text.replace(/([^|\n]\n)(\|[^\n]+\|\n)/g, '$1\n$2');

  text = text.replace(/\n{4,}/g, '\n\n');

  return text;
}

function renderContentWithMath(rawText: string): string {

  let text = formatAndCleanMarkdown(rawText);

  const mathPlaceholders: string[] = [];
  const currencyPlaceholders: string[] = [];

  const currencyRegex = /\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion)\b(?!\s*(?:ms|fps|hz|s|sec|min|hr|tps|tokens?)))?(?:\s*(?:-|–|—|to)\s*\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion)\b(?!\s*(?:ms|fps|hz|s|sec|min|hr|tps|tokens?)))?)?/gi;
  text = text.replace(currencyRegex, (match) => {
    if (/\b(?:ms|fps|hz|khz|mhz|ghz|ns|μs|us|tps|tokens?|req|rpm|rps)\b/i.test(match)) {
      return match;
    }
    const placeholder = `@@@CURRENCY_${currencyPlaceholders.length}@@@`;
    currencyPlaceholders.push(match);
    return placeholder;
  });

  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      if (rendered.includes('katex-error')) {
        return _match;
      }
      const placeholder = `@@@MATH_BLOCK_${mathPlaceholders.length}@@@`;
      mathPlaceholders.push(`<div class="my-5 overflow-x-auto py-3 px-4 bg-[#18191b] rounded-xl border border-[#2d2f33] text-center text-[#e3e3e3] shadow-xs">${rendered}</div>`);
      return placeholder;
    } catch {
      return _match;
    }
  });

  const proseWords = /\b(the|and|or|of|to|in|for|with|is|are|was|were|be|been|have|has|had|do|does|did|can|could|should|would|will|shall|may|might|must|this|that|these|those|from|which|about|there|their|where|using|because)\b/i;
  const mathIndicators = /[\\=_^+\-*/<>{}\[\]\(\)]|\b(alpha|beta|gamma|delta|pi|sigma|theta|omega|lambda|mu|phi|psi|sum|int|frac|sqrt|times|approx|neq|leq|geq|in|to|partial|nabla|infty)\b|^[a-zA-Z]$/;

  text = text.replace(/(^|[^\\])\$([^\$\n]{1,120}?)\$/g, (match, prefix, math) => {
    const trimmed = math.trim();

    if (proseWords.test(trimmed) || !mathIndicators.test(trimmed)) {
      return match;
    }

    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
      });
      if (rendered.includes('katex-error')) {
        return match;
      }
      const placeholder = `@@@MATH_INLINE_${mathPlaceholders.length}@@@`;
      mathPlaceholders.push(rendered);
      return `${prefix}${placeholder}`;
    } catch {
      return match;
    }
  });

  let html = marked.parse(text, { async: false }) as string;

  mathPlaceholders.forEach((mathHtml, idx) => {
    const blockKey = `@@@MATH_BLOCK_${idx}@@@`;
    const inlineKey = `@@@MATH_INLINE_${idx}@@@`;
    html = html.replace(`<p>${blockKey}</p>`, mathHtml);
    html = html.replace(blockKey, mathHtml);
    html = html.replace(inlineKey, mathHtml);
  });

  currencyPlaceholders.forEach((currVal, idx) => {
    const currKey = `@@@CURRENCY_${idx}@@@`;
    html = html.replaceAll(currKey, currVal);
  });

  return html;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {

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
    <div className="space-y-4 text-[#e3e3e3]">
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
            className="omniz-content"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        );
      })}
    </div>
  );
};
