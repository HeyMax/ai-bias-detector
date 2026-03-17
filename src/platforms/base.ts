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
    new DoubaoAdapter(),
    new DeepSeekAdapter(),
    new YuanbaoAdapter(),
    new QianwenAdapter(),
    new KimiAdapter(),
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

/* ================================================================== */
/*  豆包 (Doubao by ByteDance)                                         */
/* ================================================================== */

class DoubaoAdapter implements PlatformAdapter {
  readonly name: Platform = 'doubao';
  readonly responseSelector = '[class*="assistant-message"], [class*="receive-message"], [data-role="assistant"], [class*="bot-message"]';

  matchesUrl(url: string): boolean {
    return url.includes('doubao.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('[class*="markdown"], [class*="message-content"]');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="发消息"], textarea[placeholder*="输入"]')
      ?? document.querySelector<HTMLDivElement>('[role="textbox"], [contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    setInputValue(input, text);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="发送"], button[class*="send"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  DeepSeek                                                           */
/* ================================================================== */

class DeepSeekAdapter implements PlatformAdapter {
  readonly name: Platform = 'deepseek';
  readonly responseSelector = '[class*="assistant-message"], [data-role="assistant"], [class*="ds-markdown"]';

  matchesUrl(url: string): boolean {
    return url.includes('chat.deepseek.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('[class*="markdown"], [class*="message-content"]');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea')
      ?? document.querySelector<HTMLDivElement>('[role="textbox"], [contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    setInputValue(input, text);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="发送"], button[aria-label*="Send"], button[class*="send"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  腾讯元宝 (Tencent Yuanbao)                                         */
/* ================================================================== */

class YuanbaoAdapter implements PlatformAdapter {
  readonly name: Platform = 'yuanbao';
  readonly responseSelector = '[class*="assistant-message"], [class*="ai-message"], [data-role="assistant"], [class*="bot-content"]';

  matchesUrl(url: string): boolean {
    return url.includes('yuanbao.tencent.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('[class*="markdown"], [class*="message-content"]');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="输入"]')
      ?? document.querySelector<HTMLDivElement>('[contenteditable="true"], [role="textbox"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    setInputValue(input, text);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="发送"], button[class*="send"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  通义千问 (Tongyi Qianwen by Alibaba)                               */
/* ================================================================== */

class QianwenAdapter implements PlatformAdapter {
  readonly name: Platform = 'qianwen';
  readonly responseSelector = '[class*="assistant-message"], [data-role="assistant"], [class*="answer-content"], [class*="bot-message"]';

  matchesUrl(url: string): boolean {
    return url.includes('tongyi.aliyun.com') || url.includes('qianwen.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('[class*="markdown"], [class*="message-content"]');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="千问"], textarea[name*="千问"]')
      ?? document.querySelector<HTMLDivElement>('[role="textbox"], [contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    setInputValue(input, text);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="发送"], button[class*="send"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  Kimi (by Moonshot AI)                                              */
/* ================================================================== */

class KimiAdapter implements PlatformAdapter {
  readonly name: Platform = 'kimi';
  readonly responseSelector = '[class*="assistant-message"], [data-message-role="assistant"], [class*="bot-message"], [class*="segment-"]';

  matchesUrl(url: string): boolean {
    return url.includes('kimi.moonshot.cn') || url.includes('kimi.com');
  }

  extractText(el: Element): string {
    const markdown = el.querySelector('[class*="markdown"], [class*="message-content"]');
    return (markdown ?? el).textContent?.trim() ?? '';
  }

  getInputElement() {
    return document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="尽管问"]')
      ?? document.querySelector<HTMLDivElement>('[role="textbox"], [contenteditable="true"]');
  }

  sendMessage(text: string): void {
    const input = this.getInputElement();
    if (!input) return;
    setInputValue(input, text);
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label*="发送"], button[class*="send"], button[type="submit"]',
      );
      btn?.click();
    }, 200);
  }
}

/* ================================================================== */
/*  Shared utilities                                                   */
/* ================================================================== */

function setInputValue(
  input: HTMLTextAreaElement | HTMLDivElement,
  text: string,
): void {
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
}
