import { useState, useEffect } from 'react';
import { getFromStorage, setInStorage } from '../services/storageAdapter';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const item = await getFromStorage<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await setInStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}
