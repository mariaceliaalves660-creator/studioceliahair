import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseEnabled } from '../integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// LocalStorage Helper Functions
const STORAGE_KEY = 'studioceliahair_data';

export const saveToLocalStorage = (key: string, data: any) => {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[key] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allData[key] !== undefined ? allData[key] : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Hook for syncing data with Supabase and localStorage
 * Falls back to localStorage if Supabase is not configured
 */
export function useSupabaseSync<T>(
  tableName: string,
  defaultValue: T,
  storageKey: string
) {
  const [data, setData] = useState<T>(() => loadFromLocalStorage(storageKey, defaultValue));
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(isSupabaseEnabled());

  // Load initial data
  useEffect(() => {
    loadData();
  }, [tableName]);

  const loadData = async () => {
    setIsLoading(true);
    
    if (isSupabaseEnabled() && supabase) {
      try {
        console.log(`📡 Loading ${tableName} from Supabase...`);
        const { data: supabaseData, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error loading ${tableName} from Supabase:`, error);
          // Fallback to localStorage
          const localData = loadFromLocalStorage(storageKey, defaultValue);
          setData(localData);
          setIsOnline(false);
        } else {
          console.log(`✅ Loaded ${supabaseData?.length || 0} items from ${tableName}`);
          setData(supabaseData as T);
          // Also save to localStorage as backup
          saveToLocalStorage(storageKey, supabaseData);
          setIsOnline(true);
        }
      } catch (err) {
        console.error(`Exception loading ${tableName}:`, err);
        const localData = loadFromLocalStorage(storageKey, defaultValue);
        setData(localData);
        setIsOnline(false);
      }
    } else {
      // Use localStorage only
      console.log(`💾 Using localStorage for ${tableName}`);
      const localData = loadFromLocalStorage(storageKey, defaultValue);
      setData(localData);
      setIsOnline(false);
    }
    
    setIsLoading(false);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isSupabaseEnabled() || !supabase) return;

    console.log(`🔄 Subscribing to realtime updates for ${tableName}...`);
    
    const channel: RealtimeChannel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`🔔 Realtime update for ${tableName}:`, payload.eventType);
          
          // Reload data on any change
          loadData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${tableName} realtime updates`);
          setIsOnline(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${tableName}`);
          setIsOnline(false);
        }
      });

    return () => {
      console.log(`🔌 Unsubscribing from ${tableName}`);
      supabase.removeChannel(channel);
    };
  }, [tableName]);

  // Add item
  const addItem = useCallback(async (item: any) => {
    if (isSupabaseEnabled() && supabase) {
      try {
        console.log(`➕ Adding item to ${tableName} in Supabase...`);
        const { error } = await supabase
          .from(tableName)
          .insert([item]);

        if (error) {
          console.error(`Error adding to ${tableName}:`, error);
          // Fallback to localStorage
          const currentData = Array.isArray(data) ? [...data, item] : [item];
          setData(currentData as T);
          saveToLocalStorage(storageKey, currentData);
        } else {
          console.log(`✅ Added to ${tableName} successfully`);
          // Data will be updated via realtime subscription
        }
      } catch (err) {
        console.error(`Exception adding to ${tableName}:`, err);
        // Fallback to localStorage
        const currentData = Array.isArray(data) ? [...data, item] : [item];
        setData(currentData as T);
        saveToLocalStorage(storageKey, currentData);
      }
    } else {
      // Use localStorage only
      const currentData = Array.isArray(data) ? [...data, item] : [item];
      setData(currentData as T);
      saveToLocalStorage(storageKey, currentData);
    }
  }, [data, tableName, storageKey]);

  // Update item
  const updateItem = useCallback(async (item: any) => {
    if (isSupabaseEnabled() && supabase) {
      try {
        console.log(`✏️ Updating item in ${tableName}...`);
        const { error } = await supabase
          .from(tableName)
          .update(item)
          .eq('id', item.id);

        if (error) {
          console.error(`Error updating ${tableName}:`, error);
          // Fallback to localStorage
          const currentData = Array.isArray(data) 
            ? (data as any[]).map(d => d.id === item.id ? item : d)
            : item;
          setData(currentData as T);
          saveToLocalStorage(storageKey, currentData);
        } else {
          console.log(`✅ Updated ${tableName} successfully`);
          // Data will be updated via realtime subscription
        }
      } catch (err) {
        console.error(`Exception updating ${tableName}:`, err);
        // Fallback to localStorage
        const currentData = Array.isArray(data) 
          ? (data as any[]).map(d => d.id === item.id ? item : d)
          : item;
        setData(currentData as T);
        saveToLocalStorage(storageKey, currentData);
      }
    } else {
      // Use localStorage only
      const currentData = Array.isArray(data) 
        ? (data as any[]).map(d => d.id === item.id ? item : d)
        : item;
      setData(currentData as T);
      saveToLocalStorage(storageKey, currentData);
    }
  }, [data, tableName, storageKey]);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    if (isSupabaseEnabled() && supabase) {
      try {
        console.log(`🗑️ Deleting item from ${tableName}...`);
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`Error deleting from ${tableName}:`, error);
          // Fallback to localStorage
          const currentData = Array.isArray(data) 
            ? (data as any[]).filter(d => d.id !== id)
            : data;
          setData(currentData as T);
          saveToLocalStorage(storageKey, currentData);
        } else {
          console.log(`✅ Deleted from ${tableName} successfully`);
          // Data will be updated via realtime subscription
        }
      } catch (err) {
        console.error(`Exception deleting from ${tableName}:`, err);
        // Fallback to localStorage
        const currentData = Array.isArray(data) 
          ? (data as any[]).filter(d => d.id !== id)
          : data;
        setData(currentData as T);
        saveToLocalStorage(storageKey, currentData);
      }
    } else {
      // Use localStorage only
      const currentData = Array.isArray(data) 
        ? (data as any[]).filter(d => d.id !== id)
        : data;
      setData(currentData as T);
      saveToLocalStorage(storageKey, currentData);
    }
  }, [data, tableName, storageKey]);

  return {
    data,
    setData,
    isLoading,
    isOnline,
    addItem,
    updateItem,
    deleteItem,
    reload: loadData,
  };
}

// Hook to check connection status
export function useSupabaseStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isSupabaseEnabled());

  useEffect(() => {
    if (!isSupabaseEnabled() || !supabase) {
      setIsConnected(false);
      return;
    }

    // Test connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('products').select('count').limit(1);
        setIsConnected(!error);
        
        if (error) {
          console.warn('⚠️ Supabase configured but not connected:', error.message);
        } else {
          console.log('✅ Supabase connected successfully!');
        }
      } catch (err) {
        setIsConnected(false);
        console.error('❌ Supabase connection test failed:', err);
      }
    };

    testConnection();
    
    // Retest every 30 seconds
    const interval = setInterval(testConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isConfigured };
}
