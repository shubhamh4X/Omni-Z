import React from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { CodeBlock } from './CodeBlock';

// Configure marked with GFM (GitHub Flavored Markdown) and natural line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

interface MarkdownRendererProps {
  content: string;
}

/**
 * Sanitizes pseudo-LaTeX glitches, bogus metric dollar signs, and normalizes
 * markdown table spacing without mangling natural text or legitimate currency.
 */
function formatAndCleanMarkdown(rawText: string): string {
  let text = rawText;

  // 1. Clean latency/metric units with bogus dollar signs:
  // e.g. "$380 ms $", "($380 ms $)", "$380\text{ ms}$", "$400 ms$", "$850 ms$"
  const unitRegex = /\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?\s*(?:\\text\{\s*[^}]+\s*\}|(?:ms|s|sec|min|hr|fps|hz|khz|mhz|ghz|ns|μs|us|tps|tokens?|req|rpm|rps)\b))\s*\$/gi;
  text = text.replace(unitRegex, (_m, content) => {
    return content.replace(/\\text\{\s*([^}]+)\s*\}/g, ' $1 ').replace(/\s+/g, ' ').trim();
  });

  // 2. Clean pseudo-LaTeX ranges with \text{-} or percentages:
  // e.g. "$25\text{-}38\%$", "$20–35%$", "$+6-11%$", "$+6–11%$"
  text = text.replace(/\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?%?\s*(?:\\text\{[-–—]+\}|[-–—]|to)\s*[~><=±\+\-]?\s*\d+(?:\.\d+)?\\?%?)\s*\$/g, (_m, content) => {
    return content.replace(/\\text\{[-–—]+\}/g, '–').replace(/\\%/g, '%').trim();
  });

  // 3. Clean single percentages or multipliers wrapped in $:
  text = text.replace(/\$\s*([~><=±\+\-]?\s*\d+(?:\.\d+)?(?:%|x|X))\s*\$/gi, '$1');

  // 4. Clean orphaned single $ before signed numbers/ranges: e.g. "$+6–11%" -> "+6–11%"
  text = text.replace(/\$([~><=±\+\-]\s*\d+(?:\.\d+)?%?)/g, '$1');

  // 5. Clean pseudo-LaTeX percentage & dimensionless ranges without outer $ (e.g. 25\text{-}38%)
  text = text.replace(/([~><=±\+\-]?\d+(?:\.\d+)?%?)\s*\\text\{[-–—]+\}\s*(\d+(?:\.\d+)?\\?%?)/g, '$1–$2');

  // 6. Clean pseudo-LaTeX currency ranges (e.g. \$15\text{-}\$50 -> $15 – $50)
  text = text.replace(/\\?\$(\d+(?:\.\d+)?)\s*\\text\{[-–—]+\}\s*\\?\$(\d+(?:\.\d+)?)/g, '$$$1 – $$$2');
  text = text.replace(/\\\$(\d+(?:\.\d+)?)/g, '$$$1');

  // 7. Remove any remaining stray \text{-} or text tags anywhere in text
  text = text.replace(/\\text\{[-–—]+\}/g, '–');
  text = text.replace(/\\text\{\s*([a-zA-Z\s]+)\s*\}/g, ' $1 ');

  // 8. Clean escaped percent signs in text
  text = text.replace(/\\%/g, '%');

  // 9. Ensure tables have blank lines before and after so GFM parses them properly
  text = text.replace(/(\n\|[^\n]+\|\n)(?=[^|\n])/g, '$1\n\n');
  text = text.replace(/([^|\n]\n)(\|[^\n]+\|\n)/g, '$1\n$2');

  // 10. Normalize multiple consecutive blank lines
  text = text.replace(/\n{4,}/g, '\n\n');

  return text;
}

/**
 * Protects currency amounts ($15, $50, $15-$50, $100K, etc.) and safely parses
 * actual LaTeX equations without mangling normal English prose.
 */
function renderContentWithMath(rawText: string): string {
  // First sanitize any raw glitches
  let text = formatAndCleanMarkdown(rawText);

  const mathPlaceholders: string[] = [];
  const currencyPlaceholders: string[] = [];

  // 1. Protect currency patterns (e.g. $15, $50, $15-$50, $15 - $50, $10.50, $100k, $2B)
  const currencyRegex = /\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion)\b(?!\s*(?:ms|fps|hz|s|sec|min|hr|tps|tokens?)))?(?:\s*(?:-|–|—|to)\s*\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion)\b(?!\s*(?:ms|fps|hz|s|sec|min|hr|tps|tokens?)))?)?/gi;
  text = text.replace(currencyRegex, (match) => {
    if (/\b(?:ms|fps|hz|khz|mhz|ghz|ns|μs|us|tps|tokens?|req|rpm|rps)\b/i.test(match)) {
      return match;
    }
    const placeholder = `@@@CURRENCY_${currencyPlaceholders.length}@@@`;
    currencyPlaceholders.push(match);
    return placeholder;
  });

  // 2. Extract block math $$...$$
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

  // 3. Extract inline math: only if it contains legitimate math symbols and NOT plain English sentences
  const proseWords = /\b(the|and|or|of|to|in|for|with|is|are|was|were|be|been|have|has|had|do|does|did|can|could|should|would|will|shall|may|might|must|this|that|these|those|from|which|about|there|their|where|using|because)\b/i;
  const mathIndicators = /[\\=_^+\-*/<>{}\[\]\(\)]|\b(alpha|beta|gamma|delta|pi|sigma|theta|omega|lambda|mu|phi|psi|sum|int|frac|sqrt|times|approx|neq|leq|geq|in|to|partial|nabla|infty)\b|^[a-zA-Z]$/;

  text = text.replace(/(^|[^\\])\$([^\$\n]{1,120}?)\$/g, (match, prefix, math) => {
    const trimmed = math.trim();
    // If it contains natural prose words or lacks math indicators, leave it untouched
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

  // 4. Parse Markdown with marked
  let html = marked.parse(text, { async: false }) as string;

  // 5. Restore rendered math HTML
  mathPlaceholders.forEach((mathHtml, idx) => {
    const blockKey = `@@@MATH_BLOCK_${idx}@@@`;
    const inlineKey = `@@@MATH_INLINE_${idx}@@@`;
    html = html.replace(`<p>${blockKey}</p>`, mathHtml);
    html = html.replace(blockKey, mathHtml);
    html = html.replace(inlineKey, mathHtml);
  });

  // 6. Restore protected currency values
  currencyPlaceholders.forEach((currVal, idx) => {
    const currKey = `@@@CURRENCY_${idx}@@@`;
    html = html.replaceAll(currKey, currVal);
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
