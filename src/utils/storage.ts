/**
 * localStorage utility functions for LuckJack game state persistence
 * Handles serialization, deserialization, and error recovery
 */

/**
 * Saves data to localStorage with JSON serialization
 * Handles QuotaExceededError gracefully by logging a warning
 * 
 * @param key - The localStorage key
 * @param data - The data to save (will be JSON serialized)
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`localStorage quota exceeded for key "${key}". Data not saved.`);
    } else {
      console.error(`Failed to save to localStorage for key "${key}":`, error);
    }
  }
}

/**
 * Loads data from localStorage with JSON parsing
 * Returns defaultValue if key doesn't exist or parsing fails
 * 
 * @param key - The localStorage key
 * @param defaultValue - The value to return if loading fails
 * @returns The loaded data or defaultValue
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    
    // Key doesn't exist
    if (item === null) {
      return defaultValue;
    }
    
    // Parse and return
    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`Corrupted data in localStorage for key "${key}". Using default value.`);
    } else {
      console.error(`Failed to load from localStorage for key "${key}":`, error);
    }
    return defaultValue;
  }
}

/**
 * Removes an item from localStorage
 * Fails silently if the key doesn't exist or localStorage is unavailable
 * 
 * @param key - The localStorage key to remove
 */
export function clearLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear localStorage for key "${key}":`, error);
  }
}
