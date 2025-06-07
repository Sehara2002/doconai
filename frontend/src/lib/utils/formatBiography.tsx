import React from "react";

interface FormattingOptions {
  // Rich text formatting
  enableBold?: boolean;
  enableItalic?: boolean;
  enableCode?: boolean;
  enableUnderline?: boolean;
  
  // Structure formatting
  enableBullets?: boolean;
  enableNumberedLists?: boolean;
  enableHeadings?: boolean;
  
  // Custom patterns
  customPatterns?: Array<{
    pattern: RegExp;
    component: (content: string, key: string) => React.ReactNode;
  }>;
  
  // CSS classes
  codeClassName?: string;
  bulletClassName?: string;
  headingClassName?: string;
  paragraphClassName?: string;
}

const DEFAULT_OPTIONS: FormattingOptions = {
  enableBold: true,
  enableItalic: true,
  enableCode: true,
  enableUnderline: false,
  enableBullets: true,
  enableNumberedLists: true,
  enableHeadings: true,
  codeClassName: "bg-gray-100 px-1 rounded text-sm font-mono",
  bulletClassName: "ml-4 list-disc",
  headingClassName: "mt-3 font-semibold",
  paragraphClassName: "mt-3",
  customPatterns: []
};

function parseRichText(text: string, options: FormattingOptions): React.ReactNode[] {
  const patterns: Array<{
    regex: RegExp;
    handler: (match: RegExpMatchArray, key: string) => React.ReactNode;
  }> = [];

  // Build regex patterns based on enabled options
  if (options.enableBold) {
    patterns.push({
      regex: /\*\*(.+?)\*\*/g,
      handler: (match, key) => <strong key={key}>{match[1]}</strong>
    });
  }

  if (options.enableItalic) {
    patterns.push({
      regex: /\*(.+?)\*/g,
      handler: (match, key) => <em key={key}>{match[1]}</em>
    });
    patterns.push({
      regex: /_(.+?)_/g,
      handler: (match, key) => <em key={key}>{match[1]}</em>
    });
  }

  if (options.enableCode) {
    patterns.push({
      regex: /`(.+?)`/g,
      handler: (match, key) => (
        <code key={key} className={options.codeClassName}>
          {match[1]}
        </code>
      )
    });
  }

  if (options.enableUnderline) {
    patterns.push({
      regex: /__(.+?)__/g,
      handler: (match, key) => <u key={key}>{match[1]}</u>
    });
  }

  // Add custom patterns
  options.customPatterns?.forEach(({ pattern, component }) => {
    patterns.push({
      regex: pattern,
      handler: (match, key) => component(match[1] || match[0], key)
    });
  });

  // Combine all patterns into one regex
  const combinedPattern = new RegExp(
    patterns.map(p => `(${p.regex.source})`).join('|'),
    'g'
  );

  const parts: React.ReactNode[] = [];
  const matches = Array.from(text.matchAll(combinedPattern));
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchIndex = match.index!;
    
    // Add text before this match
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, matchIndex)}
        </span>
      );
    }

    // Find which pattern matched and apply its handler
    for (let i = 0; i < patterns.length; i++) {
      if (match[i + 1] !== undefined) {
        const patternMatch = match[0].match(patterns[i].regex);
        if (patternMatch) {
          parts.push(patterns[i].handler(patternMatch, `format-${matchIndex}-${i}`));
          break;
        }
      }
    }

    lastIndex = matchIndex + match[0].length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-final-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}

export function formatText(text: string, userOptions: Partial<FormattingOptions> = {}): JSX.Element[] {
  // Merge user options with defaults
  const options: FormattingOptions = { ...DEFAULT_OPTIONS, ...userOptions };
  
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let elementIndex = 0;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Handle numbered lists (1. 2. 3. etc.)
    if (options.enableNumberedLists && /^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={`numbered-${elementIndex++}`} className="ml-4 list-decimal">
          {parseRichText(content, options)}
        </li>
      );
      continue;
    }

    // Handle bullet points
    if (options.enableBullets && line.startsWith('* ')) {
      const content = line.replace(/^\*\s/, '');
      elements.push(
        <li key={`bullet-${elementIndex++}`} className={options.bulletClassName}>
          {parseRichText(content, options)}
        </li>
      );
      continue;
    }

    // Handle headings (# ## ### etc.)
    if (options.enableHeadings && line.startsWith('#')) {
      const headingMatch = line.match(/^(#{1,6})\s(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        
        elements.push(
          <HeadingTag key={`heading-${elementIndex++}`} className={options.headingClassName}>
            {parseRichText(content, options)}
          </HeadingTag>
        );
        continue;
      }
    }

    // Handle section headings (Title: content)
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const title = line.substring(0, colonIndex).trim();
      const content = line.substring(colonIndex + 1).trim();
      
      if (title && content) {
        elements.push(
          <p key={`section-${elementIndex++}`} className={options.paragraphClassName}>
            <strong>{title}:</strong> {parseRichText(content, options)}
          </p>
        );
        continue;
      }
    }

    // Handle regular paragraphs
    elements.push(
      <p key={`paragraph-${elementIndex++}`} className={options.paragraphClassName}>
        {parseRichText(line, options)}
      </p>
    );
  }

  return elements;
}

// Preset configurations for common use cases
export const presets = {
  minimal: {
    enableBold: true,
    enableItalic: true,
    enableCode: false,
    enableBullets: true,
    enableHeadings: false
  },
  
  markdown: {
    enableBold: true,
    enableItalic: true,
    enableCode: true,
    enableUnderline: false,
    enableBullets: true,
    enableNumberedLists: true,
    enableHeadings: true
  },
  
  documentation: {
    enableBold: true,
    enableItalic: true,
    enableCode: true,
    enableBullets: true,
    enableNumberedLists: true,
    enableHeadings: true,
    codeClassName: "bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono text-sm",
    headingClassName: "mt-4 mb-2 font-bold text-lg border-b border-gray-200 pb-1"
  }
};

// Example usage functions
export function formatMarkdown(text: string): JSX.Element[] {
  return formatText(text, presets.markdown);
}

export function formatDocumentation(text: string): JSX.Element[] {
  return formatText(text, presets.documentation);
}

export function formatWithCustomPatterns(text: string): JSX.Element[] {
  return formatText(text, {
    customPatterns: [
      {
        pattern: /\[\[(.+?)\]\]/g, // [[highlight]]
        component: (content, key) => (
          <mark key={key} className="bg-yellow-200 px-1 rounded">
            {content}
          </mark>
        )
      },
      {
        pattern: /\{\{(.+?)\}\}/g, // {{badge}}
        component: (content, key) => (
          <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {content}
          </span>
        )
      }
    ]
  });
}