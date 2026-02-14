/**
 * Supabase 连接测试
 * 在浏览器控制台运行这个函数来测试连接
 */
import { createClient } from '@supabase/supabase-js';

export async function testSupabaseConnection() {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log('=== Supabase Connection Test ===');
  console.log('URL:', url);
  console.log('Key (first 20 chars):', key ? key.substring(0, 20) + '...' : 'NOT FOUND');
  console.log('Key type:', key?.startsWith('sb_publishable_') ? 'Publishable Key (new)' :
               key?.startsWith('eyJ') ? 'Anon Key (legacy)' : 'Unknown format');

  if (!url || !key) {
    console.error('❌ Missing URL or Key! Check your .env.local file');
    return { success: false, error: 'Missing configuration' };
  }

  try {
    const supabase = createClient(url, key);

    // Test 1: Simple query to check connection
    console.log('\nTest 1: Querying sessions table...');
    const { data, error } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Query failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Connection successful!');
    console.log('Query result:', data);

    // Test 2: Insert test event
    console.log('\nTest 2: Inserting test event...');
    const { data: insertData, error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: 'test-user-' + Date.now(),
        session_id: null,
        event_type: 'connection_test',
        event_data: { test: true, timestamp: new Date().toISOString() },
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Insert successful!', insertData);

    return { success: true, data: { query: data, insert: insertData } };

  } catch (err) {
    console.error('❌ Connection error:', err);
    return { success: false, error: String(err) };
  }
}

// Auto-run in development
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  console.log('💡 Run testSupabaseConnection() in console to test Supabase connection');
}
