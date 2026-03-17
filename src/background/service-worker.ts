/**
 * Background service worker.
 * Handles cross-tab state, badge updates, and settings sync.
 */

import { DEFAULT_SETTINGS } from '../types/index.js';

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get('settings');
  if (!stored.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('settings').then(data => {
      sendResponse(data.settings ?? DEFAULT_SETTINGS);
    });
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.sync.set({ settings: message.settings }).then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
