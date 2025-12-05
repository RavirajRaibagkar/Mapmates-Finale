'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [status, setStatus] = useState<any>({
    supabase: 'checking...',
    session: 'checking...',
    tables: 'checking...',
    error: null
  });

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const supabase = createClient();
    
    try {
      // Check Supabase connection
      setStatus((prev: any) => ({ ...prev, supabase: '✅ Connected' }));

      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setStatus((prev: any) => ({ ...prev, session: `❌ ${sessionError.message}` }));
      } else {
        setStatus((prev: any) => ({ 
          ...prev, 
          session: session ? `✅ Logged in as ${session.user.email}` : '⚠️ Not logged in' 
        }));
      }

      // Check if tables exist
      const { data: profiles, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('count')
        .limit(1);

      if (profileError) {
        setStatus((prev: any) => ({ 
          ...prev, 
          tables: `❌ Tables not found: ${profileError.message}`,
          error: profileError
        }));
      } else {
        setStatus((prev: any) => ({ ...prev, tables: '✅ Tables exist' }));
      }

    } catch (error: any) {
      setStatus((prev: any) => ({ 
        ...prev, 
        error: error.message 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
          MapMates Setup Check
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <p className="text-gray-700">{status.supabase}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Authentication</h2>
            <p className="text-gray-700">{status.session}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Database Tables</h2>
            <p className="text-gray-700">{status.tables}</p>
          </div>

          {status.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold mb-2">Error Details:</h3>
              <pre className="text-sm text-red-700 overflow-auto">
                {JSON.stringify(status.error, null, 2)}
              </pre>
            </div>
          )}

          <div className="pt-4">
            <h3 className="font-semibold mb-2 text-red-600">⚠️ ACTION REQUIRED:</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-yellow-800 mb-2">You need to set up the database!</p>
              <p className="text-yellow-700 text-sm">The 406 error means your database tables don't exist yet.</p>
            </div>
            <h3 className="font-semibold mb-2">Follow These Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open <a href="https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo" target="_blank" className="text-blue-600 underline">your Supabase project</a></li>
              <li>Click <strong>"SQL Editor"</strong> in the left sidebar</li>
              <li>Click <strong>"New Query"</strong></li>
              <li>Open <code className="bg-gray-100 px-2 py-1 rounded">mapmates/supabase-setup.sql</code> in your code editor</li>
              <li>Copy ALL the contents (Ctrl+A, Ctrl+C)</li>
              <li>Paste into Supabase SQL Editor</li>
              <li>Click <strong>"Run"</strong> (or Ctrl+Enter)</li>
              <li>Wait for "Success" message</li>
              <li>Come back here and click "Recheck Status"</li>
            </ol>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={checkSetup}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Recheck Status
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
            >
              Go to Login
            </a>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">💡 Quick Setup Guide:</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Supabase Setup:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Open <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
              <li>Select your project: <code className="bg-blue-100 px-1 rounded">ofvvzoebexkmacfgmdlo</code></li>
              <li>Go to SQL Editor → New Query</li>
              <li>Run the <code className="bg-blue-100 px-1 rounded">supabase-setup.sql</code> file</li>
            </ul>
            <p className="mt-2"><strong>2. Enable Realtime:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Go to Database → Replication</li>
              <li>Enable for: messages, connections, announcements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
