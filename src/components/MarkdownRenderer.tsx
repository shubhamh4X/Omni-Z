import React from 'react';
import { marked } from 'marked';
import katex from 'katex';
import { CodeBlock } from './CodeBlock';

// Configure marked with GFM (GitHub Flavored Markdown)
marked.setOptions({
  gfm: true,
  breaks: false,
});

interface MarkdownRendererProps {
  content: string;
}

/**
 * Normalizes and formats AI output into clean, structured Markdown with distinct
 * sections, healthy spacing, and clean bulleted definitions.
 */
function formatAndCleanMarkdown(rawText: string): string {
  let text = rawText;

  // 1. Clean up weird pseudo-LaTeX escapes like \$15\text{-}\$50 -> $15-$50
  text = text.replace(/\\\$(\d+(?:\.\d+)?)\\text\{[-–—]\}\\\$(\d+(?:\.\d+)?)/g, '$$$1 - $$$2');
  text = text.replace(/\\\$(\d+(?:\.\d+)?)/g, '$$$1');

  // 2. Ensure tables have blank lines before and after so they don't stick to surrounding text
  text = text.replace(/(\n\|[^\n]+\|\n)(?=[^|\n])/g, '$1\n\n');
  text = text.replace(/([^|\n]\n)(\|[^\n]+\|\n)/g, '$1\n$2');

  // 3. Elevate numbered main sections like "3. Impact on Ecosystem Stakeholders"
  // into prominent markdown headers (###) with double newlines
  text = text.replace(/(?:^|\n)([0-9]+\.\s+[A-Z][^\n]{3,65})(?=\n|$)/g, '\n\n### $1\n\n');

  // 4. Elevate sub-category title lines (e.g. "Transaction Authentication & Cryptography", "Application Security & Anti-Bot Infrastructure")
  // that precede bold terms or bullets into sub-headers (####)
  text = text.replace(/(?:^|\n)([A-Z][A-Za-z0-9\s&/\-–]{3,60}[A-Za-z0-9])\n+(?=(?:\*|-|\b[0-9]+\.|\*\*[A-Z]|[A-Z][A-Za-z0-9\s\.\(\)\/\-]+:))/g, '\n\n#### $1\n\n');

  // 5. Convert definition lines like "Cardholders: ...", "Merchants: ...", "EMV Chips: ...", "3D Secure 2.0 (3DS2): ..."
  // or "**Term:** ..." into distinct, beautifully spaced bullet items
  text = text.replace(/(?:^|\n)(?:[-*]\s*)?(?:\*\*)?([A-Za-z0-9][A-Za-z0-9\s\.\(\)\/\-–]{1,55}):(?:\*\*)?\s*([^\n]+)/g, (match, term, desc) => {
    // Avoid mangling protocol prefixes like http: or https:
    if (/^https?$/i.test(term)) return match;
    return `\n\n* **${term.trim()}:** ${desc.trim()}`;
  });

  // 6. Normalize multiple consecutive blank lines to standard clean double-newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}

/**
 * Protects currency amounts ($15, $50, $15-$50, $100K, etc.) and safely parses
 * actual LaTeX equations without mangling normal English prose.
 */
function renderContentWithMath(rawText: string): string {
  // First clean and structure the document
  let text = formatAndCleanMarkdown(rawText);

  const mathPlaceholders: string[] = [];
  const currencyPlaceholders: string[] = [];

  // 1. Protect currency patterns (e.g. $15, $50, $15-$50, $15 - $50, $10.50, $100k, $2B)
  const currencyRegex = /\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion))?(?:\s*(?:-|–|—|to)\s*\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?:\s*(?:k|m|b|t|thousand|million|billion|trillion))?)?/gi;
  text = text.replace(currencyRegex, (match) => {
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
      const placeholder = `@@@MATH_BLOCK_${mathPlaceholders.length}@@@`;
      mathPlaceholders.push(`<div class="my-5 overflow-x-auto py-3 px-4 bg-[#18191b] rounded-xl border border-[#2d2f33] text-center text-[#e3e3e3] shadow-xs">${rendered}</div>`);
      return placeholder;
    } catch {
      return _match;
    }
  });

  // 3. Extract inline math: only if it contains legitimate math symbols and NOT plain English sentences
  const englishWords = /\b(the|and|or|of|to|in|for|with|is|are|was|were|be|been|have|has|had|do|does|did|can|could|should|would|will|shall|may|might|must|per|loss|costs|fees|transaction|bank|merchants|cardholders|merchandise|shipping|gateway|overhead|account|funds|fraudulent|charges|requires|defense|depth|model|flow|chips|stripe|magnetic|transition|reduced|physical|counterfeit|protocol|facilitates|behavioral|evaluate|anomalous|replaces|surrogate|tokens|exfiltrated|useless|infrastructure)\b/i;
  const mathIndicators = /[\\=_^+\-*/<>{}\[\]\(\)]|\b(alpha|beta|gamma|delta|pi|sigma|theta|omega|lambda|mu|phi|psi|sum|int|frac|sqrt|times|approx|neq|leq|geq|in|to)\b/;

  text = text.replace(/(^|[^\\])\$([^\$\n]{1,120}?)\$/g, (match, prefix, math) => {
    const trimmed = math.trim();
    // If it contains plain English words or lacks math symbols, leave it untouched
    if (englishWords.test(trimmed) || !mathIndicators.test(trimmed)) {
      return match;
    }

    try {
      const rendered = katex.renderToString(trimmed, {
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
