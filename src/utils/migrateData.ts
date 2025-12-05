import { supabase } from '../integrations/supabase/client';

/**
 * Script to migrate all localStorage data to Supabase
 * Run this once after setting up Supabase
 */

const STORAGE_KEY = 'studioceliahair_data';

interface MigrationResult {
  table: string;
  success: boolean;
  count: number;
  error?: string;
}

export async function migrateLocalStorageToSupabase(): Promise<MigrationResult[]> {
  if (!supabase) {
    return [{
      table: 'all',
      success: false,
      count: 0,
      error: 'Supabase not configured. Please set up .env file first.'
    }];
  }

  const results: MigrationResult[] = [];
  
  try {
    // Load all data from localStorage
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    console.log('📦 Starting migration from localStorage to Supabase...');
    console.log('📊 Data found:', Object.keys(allData));

    // Define table mappings
    const tableMappings: Record<string, string> = {
      products: 'products',
      services: 'services',
      clients: 'clients',
      staff: 'staff',
      sales: 'sales',
      appointments: 'appointments',
      expenses: 'expenses',
      cashierSessions: 'cashier_sessions',
      orders: 'orders',
      courses: 'courses',
      students: 'students',
      hairQuotes: 'hair_quotes',
      loyaltyRewards: 'loyalty_rewards',
      pointRedemptions: 'point_redemptions',
      serviceCategories: 'service_categories',
    };

    // Migrate each table
    for (const [localKey, tableName] of Object.entries(tableMappings)) {
      const data = allData[localKey];
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`⏭️ Skipping ${tableName} (no data)`);
        continue;
      }

      try {
        console.log(`📤 Migrating ${tableName}...`);
        
        // Convert to array if not already
        const dataArray = Array.isArray(data) ? data : [data];
        
        // Insert data
        const { error, count } = await supabase
          .from(tableName)
          .insert(dataArray);

        if (error) {
          console.error(`❌ Error migrating ${tableName}:`, error);
          results.push({
            table: tableName,
            success: false,
            count: 0,
            error: error.message
          });
        } else {
          console.log(`✅ Migrated ${dataArray.length} items to ${tableName}`);
          results.push({
            table: tableName,
            success: true,
            count: dataArray.length
          });
        }
      } catch (err) {
        console.error(`❌ Exception migrating ${tableName}:`, err);
        results.push({
          table: tableName,
          success: false,
          count: 0,
          error: String(err)
        });
      }
    }

    console.log('✅ Migration completed!');
    console.log('📊 Results:', results);
    
    return results;
  } catch (err) {
    console.error('❌ Migration failed:', err);
    return [{
      table: 'all',
      success: false,
      count: 0,
      error: String(err)
    }];
  }
}

/**
 * Create a backup of localStorage data before migration
 */
export function backupLocalStorage(): string {
  try {
    const allData = localStorage.getItem(STORAGE_KEY);
    const backup = {
      timestamp: new Date().toISOString(),
      data: allData
    };
    
    const backupString = JSON.stringify(backup, null, 2);
    
    // Create downloadable file
    const blob = new Blob([backupString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studioceliahair_backup_${Date.now()}.json`;
    link.click();
    
    console.log('✅ Backup created successfully!');
    return backupString;
  } catch (err) {
    console.error('❌ Backup failed:', err);
    throw err;
  }
}

/**
 * Restore data from backup file
 */
export function restoreFromBackup(backupData: string): boolean {
  try {
    const backup = JSON.parse(backupData);
    localStorage.setItem(STORAGE_KEY, backup.data);
    console.log('✅ Data restored from backup!');
    return true;
  } catch (err) {
    console.error('❌ Restore failed:', err);
    return false;
  }
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = migrateLocalStorageToSupabase;
  (window as any).backupLocalData = backupLocalStorage;
  (window as any).restoreBackup = restoreFromBackup;
  
  console.log(`
  🔧 Migration Tools Available:
  
  1. Fazer backup antes de migrar:
     backupLocalData()
  
  2. Migrar dados para Supabase:
     migrateToSupabase()
  
  3. Restaurar de backup (se necessário):
     restoreBackup(backupString)
  `);
}
