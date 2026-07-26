/**
 * PhishShield AI — Storage Adapter
 * Provides a unified interface for data persistence.
 * Uses Chrome Storage API when available, falls back to localStorage for development.
 */

const isChromeExtension =
  typeof chrome !== 'undefined' &&
  typeof chrome.storage !== 'undefined' &&
  typeof chrome.storage.local !== 'undefined';

/**
 * Get data from storage
 */
export async function getFromStorage<T>(key: string): Promise<T | null> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result: Record<string, T>) => {
        resolve(result[key] ?? null);
      });
    });
  }

  try {
    const value = localStorage.getItem(`phishShield_${key}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

/**
 * Set data in storage
 */
export async function setInStorage<T>(key: string, value: T): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  try {
    localStorage.setItem(`phishShield_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('[PhishShield] Storage write error:', e);
  }
}

/**
 * Remove data from storage
 */
export async function removeFromStorage(key: string): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }

  localStorage.removeItem(`phishShield_${key}`);
}

/**
 * Clear all PhishShield data from storage
 */
export async function clearStorage(): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }

  // Only clear PhishShield keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('phishShield_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
