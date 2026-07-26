import { useState, useEffect, useCallback } from 'react';
import type { ScanResult, DashboardStats } from '../types';
import { getFromStorage, setInStorage } from '../services/storageAdapter';
import { scanHistoryData, dashboardStats as initialDashboardStats } from '../data/dummyData';

export function useScanData() {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<DashboardStats>(initialDashboardStats);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedHistory = await getFromStorage<ScanResult[]>('scanHistory');
      
      // If we have stored history, use it. Otherwise, use dummy data but save it to storage first.
      if (storedHistory && storedHistory.length > 0) {
        setHistory(storedHistory);
      } else {
        setHistory(scanHistoryData);
        await setInStorage('scanHistory', scanHistoryData);
      }

      // Calculate stats based on history if real, else use initial
      if (storedHistory && storedHistory.length > 0) {
        const total = storedHistory.length;
        const threats = storedHistory.filter(s => s.riskLevel === 'dangerous').length;
        const safe = storedHistory.filter(s => s.riskLevel === 'safe').length;
        const suspicious = storedHistory.filter(s => s.riskLevel === 'suspicious').length;
        
        setStats({
          totalScans: total,
          threatsBlocked: threats,
          safeWebsites: safe,
          highRiskWebsites: threats + suspicious // Combine dangerous and suspicious for high risk metric in stats if needed
        });
      } else {
         setStats(initialDashboardStats);
      }

    } catch (error) {
      console.error('Failed to load scan data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for storage changes from the extension background script
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.scanHistory) {
          setHistory(changes.scanHistory.newValue || []);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    } else {
      // Polling for local development fallback
      const interval = setInterval(() => {
          const raw = localStorage.getItem('phishShield_scanHistory');
          if (raw) {
              try {
                  const parsed = JSON.parse(raw);
                  // Basic check to see if length changed to trigger re-render
                  if (parsed.length !== history.length) {
                     loadData();
                  }
              } catch (e) {
                 // ignore
              }
          }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loadData, history.length]);

  const clearHistory = async () => {
    await setInStorage('scanHistory', []);
    setHistory([]);
  };

  const deleteScan = async (id: string) => {
    const newHistory = history.filter(scan => scan.id !== id);
    setHistory(newHistory);
    await setInStorage('scanHistory', newHistory);
  };

  return { history, stats, isLoading, clearHistory, deleteScan, refresh: loadData };
}
