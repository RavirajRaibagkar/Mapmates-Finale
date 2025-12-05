'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Mail, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  admin_notes: string | null;
}

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
  const [tableExists, setTableExists] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.warn('Contact messages table not found. Run contact-us-schema.sql');
          setTableExists(false);
          setMessages([]);
          return;
        }
        throw error;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Don't show error toast if table doesn't exist
      if (!(error as any)?.message?.includes('relation')) {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await (supabase as any)
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Status updated to ${status}`);
      fetchMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Mail className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tableExists) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <Mail className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Contact Messages Table Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The contact_messages table hasn't been created yet.
          </p>
          <div className="bg-white rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-2">To fix this:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to Supabase → SQL Editor</li>
              <li>Copy the contents of <code className="bg-gray-100 px-2 py-1 rounded">contact-us-schema.sql</code></li>
              <li>Paste and run the SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Contact Messages</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'new' ? 'primary' : 'ghost'}
            onClick={() => setFilter('new')}
          >
            New ({messages.filter(m => m.status === 'new').length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'in_progress' ? 'primary' : 'ghost'}
            onClick={() => setFilter('in_progress')}
          >
            In Progress ({messages.filter(m => m.status === 'in_progress').length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'resolved' ? 'primary' : 'ghost'}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({messages.filter(m => m.status === 'resolved').length})
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{message.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(message.status)}`}>
                      {getStatusIcon(message.status)}
                      {message.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold">{message.name}</span>
                    <span>{message.email}</span>
                    <span>{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.message}</p>

              <div className="flex gap-2">
                {message.status !== 'in_progress' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(message.id, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                )}
                {message.status !== 'resolved' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus(message.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                )}
                {message.status === 'resolved' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(message.id, 'new')}
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
