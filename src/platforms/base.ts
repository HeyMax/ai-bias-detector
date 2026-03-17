/**
 * Platform adapter interface.  Each supported AI chat platform
 * implements this to handle DOM-specific extraction and injection.
 */

import type { Platform } from '../types/index.js';

export interface PlatformAdapter {
  readonly name: Platform;

  /** CSS selector that matches the container of a single AI response */
  readonly responseSelector: string;

  /** Returns true if the current URL belongs to this platform */
  matchesUrl(url: string): boolean;

  /** Extract plain text from an AI response DOM element */
  extractText(el: Element): string;

  /** Find the text input / composer element for prompt injection */
  getInputElement(): HTMLTextAreaElement | HTMLDivElement | null;

  /** Programmatically send a message in the chat */
  sendMessage(text: string): void;
}

export function createAdapter(url: string): PlatformAdapter | null {
  const adapters: PlatformAdapter[] = [
    new ChatGPTAdapter(),
    new GeminiAdapter(),
    new PerplexityAdapter(),
    new ClaudeAdapter(),
  ];
  return adapters.find(a => a.matchesUrl(url)) ?? null;
}

/* ================================================================== */
/*  ChatGPT                                                            */
/* ================================================================== */

class ChatGPTAdapter implements PlatformAdapter {
  readonly name: Platform = 'chatgpt';
  readonly responseSelector = '[data-message-author-role="assistant"]';

  matchesUrl(url: string): boolean {
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('.markdown');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('#prompt-textarea')
      ?? document.querySelector<HTMLDivElement>('[contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;

    if (input instanceof HTMLTextAreaElement) {
      const nativeSet = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype, 'value',
      )?.set;
      nativeSet?.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        '[data-testid="send-button"], button[aria-label="Send prompt"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  Gemini                                                             */
/* ================================================================== */

class GeminiAdapter implements PlatformAdapter {
  readonly name: Platform = 'gemini';
  readonly responseSelector = '.model-response-text, .response-container';

  matchesUrl(url: string): boolean {
    return url.includes('gemini.google.com');
  }

  extractText(el: Element): string {
    return el.textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLDivElement>('.ql-editor, [contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    input.textContent = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Send message"], .send-button',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  Perplexity                                                         */
/* ================================================================== */

class PerplexityAdapter implements PlatformAdapter {
  readonly name: Platform = 'perplexity';
  readonly responseSelector = '[class*="prose"], .markdown-content';

  matchesUrl(url: string): boolean {
    return url.includes('perplexity.ai');
  }

  extractText(el: Element): string {
    return el.textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    const nativeSet = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype, 'value',
    )?.set;
    nativeSet?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Submit"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  Claude                                                             */
/* ================================================================== */

class ClaudeAdapter implements PlatformAdapter {
  readonly name: Platform = 'claude';
  readonly responseSelector = '[data-is-streaming], .font-claude-message';

  matchesUrl(url: string): boolean {
    return url.includes('claude.ai');
  }

  extractText(el: Element): string {
    return el.textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLDivElement>(
      '[contenteditable="true"].ProseMirror, [contenteditable="true"]',
    );
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    input.textContent = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Send Message"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}
