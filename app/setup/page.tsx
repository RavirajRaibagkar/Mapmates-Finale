'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const sqlContent = `-- This is a placeholder. Open supabase-setup.sql in your editor to get the full SQL`;

  const copySQL = () => {
    // In a real scenario, you'd copy the actual SQL content
    navigator.clipboard.writeText('Open mapmates/supabase-setup.sql and copy its contents');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      number: 1,
      title: 'Open Supabase SQL Editor',
      description: 'Click the button below to open your Supabase SQL Editor',
      action: (
        <a
          href="https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/sql/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
        >
          Open SQL Editor <ExternalLink className="w-5 h-5" />
        </a>
      )
    },
    {
      number: 2,
      title: 'Copy the SQL Setup Script WITH SAMPLE DATA',
      description: 'Open the file mapmates/supabase-setup-with-data.sql in your code editor and copy ALL its contents (Ctrl+A, Ctrl+C)',
      action: (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">✨ Use this file for instant setup with sample data:</p>
          <code className="text-sm bg-gray-800 text-green-400 px-3 py-2 rounded block mb-2">
            mapmates/supabase-setup-with-data.sql
          </code>
          <p className="text-xs text-gray-600">This includes 10 sample places in Pune + 3 games!</p>
        </div>
      )
    },
    {
      number: 3,
      title: 'Paste and Run in Supabase',
      description: 'Paste the SQL into the Supabase SQL Editor and click "Run" (or press Ctrl+Enter)',
      action: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
            <span>Paste the SQL</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
            <span>Click "Run" button</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
            <span>Wait for "Success" message</span>
          </div>
        </div>
      )
    },
    {
      number: 4,
      title: 'Enable Realtime',
      description: 'Go to Database → Replication and enable realtime for these tables',
      action: (
        <div className="space-y-2">
          <a
            href="https://supabase.com/dashboard/project/ofvvzoebexkmacfgmdlo/database/replication"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all text-sm"
          >
            Open Replication Settings <ExternalLink className="w-4 h-4" />
          </a>
          <div className="text-sm text-gray-600 mt-2">
            Enable for: <code className="bg-gray-100 px-2 py-1 rounded">messages</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">connections</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">announcements</code>
          </div>
        </div>
      )
    },
    {
      number: 5,
      title: 'Test Your Setup',
      description: 'Verify everything is working',
      action: (
        <a
          href="/test"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
        >
          Run Diagnostic Test <ExternalLink className="w-5 h-5" />
        </a>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            MapMates Setup
          </h1>
          <p className="text-xl text-gray-600">
            Follow these 5 simple steps to get your app running
          </p>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-800 mb-2">Why am I seeing this?</h3>
            <p className="text-yellow-700">
              Your Supabase database is empty. You need to run the SQL setup script to create all the tables, 
              policies, and indexes. This is a one-time setup that takes about 2 minutes.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  {step.action}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="mt-12 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-800 mb-2">After Setup</h3>
              <p className="text-green-700 mb-4">
                Once you complete these steps, you'll be able to:
              </p>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Sign up and create your account
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  See the interactive map with your location
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Connect with nearby users
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Discover and submit places
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Earn and spend Mapos
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
          >
            Go to Login Page
          </a>
          <a
            href="/test"
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Test Setup Status
          </a>
        </div>
      </div>
    </div>
  );
}
