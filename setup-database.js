#!/usr/bin/env node

/**
 * MapMates Database Setup Script
 * This script will automatically set up your Supabase database
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MapMates Database Setup\n');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Please make sure you have:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Found Supabase credentials');
console.log(`📍 URL: ${SUPABASE_URL}\n`);

// Read SQL file
const sqlPath = path.join(__dirname, 'supabase-setup.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('❌ Error: supabase-setup.sql not found');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');
console.log('✅ Found SQL setup file');
console.log(`📄 Size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

console.log('⚠️  IMPORTANT: This script cannot execute SQL directly.');
console.log('You need to run the SQL manually in Supabase.\n');

console.log('📋 COPY THIS SQL AND RUN IT IN SUPABASE:\n');
console.log('1. Open: https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new');
console.log('2. Copy the SQL from: mapmates/supabase-setup.sql');
console.log('3. Paste it into the SQL Editor');
console.log('4. Click "Run" or press Ctrl+Enter');
console.log('5. Wait for "Success" message\n');

console.log('💡 TIP: The SQL file is ready in your editor!');
console.log('Just copy it and paste into Supabase SQL Editor.\n');

// Create a simplified SQL for quick testing
const quickTestSQL = `
-- Quick test to check if tables exist
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as profiles_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'places') as places_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') as messages_exists;
`;

console.log('🧪 To verify setup, run this SQL in Supabase:');
console.log(quickTestSQL);

console.log('\n✨ After running the SQL, your app will work!\n');
