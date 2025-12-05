'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Connection, Message, Place } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Send, MapPin, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { spendMapos } from '@/lib/api/mapos';

export default function ChatPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userMapos, setUserMapos] = useState(0);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showPlaceShare, setShowPlaceShare] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection.id);
      subscribeToMessages(selectedConnection.id);
    }
  }, [selectedConnection]);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUserId(session.user.id);
    fetchConnections(session.user.id);
    fetchUserMapos(session.user.id);
    fetchPlaces();
  };

  const fetchUserMapos = async (uid: string) => {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('mapos')
      .eq('id', uid)
      .single();
    if (data) setUserMapos(data.mapos);
  };

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false })
      .limit(20);
    if (data) setPlaces(data as Place[]);
  };

  const fetchConnections = async (uid: string) => {
    // Fetch connections where user is user1
    const { data: connections1 } = await (supabase as any)
      .from('connections')
      .select('*, other_user:profiles!connections_user2_id_fkey(*)')
      .eq('user1_id', uid)
      .eq('status', 'accepted');

    // Fetch connections where user is user2
    const { data: connections2 } = await (supabase as any)
      .from('connections')
      .select('*, other_user:profiles!connections_user1_id_fkey(*)')
      .eq('user2_id', uid)
      .eq('status', 'accepted');

    // Combine both directions
    const allConnections = [
      ...(connections1 || []),
      ...(connections2 || [])
    ];

    // Remove duplicates based on other_user.id
    const uniqueConnections = allConnections.reduce((acc: Connection[], current: Connection) => {
      const otherUserId = current.other_user?.id;
      const exists = acc.find(conn => conn.other_user?.id === otherUserId);
      if (!exists && otherUserId) {
        acc.push(current);
      }
      return acc;
    }, []);

    setConnections(uniqueConnections as Connection[]);
  };

  const fetchMessages = async (connectionId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as Message[]);
  };

  const subscribeToMessages = (connectionId: string) => {
    const channel = supabase
      .channel(`messages:${connectionId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => {
            // Prevent duplicates
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const unlockChat = async () => {
    if (!selectedConnection) return;
    
    if (userMapos < 20) {
      toast.error('Not enough Mapos! You need 20 Mapos to unlock chat.');
      return;
    }

    try {
      await spendMapos(userId, 20, 'Unlock chat');
      
      await (supabase as any)
        .from('connections')
        .update({ unlocked_at: new Date().toISOString() })
        .eq('id', selectedConnection.id);

      setSelectedConnection({
        ...selectedConnection,
        unlocked_at: new Date().toISOString()
      });

      setUserMapos(prev => prev - 20);
      toast.success('Chat unlocked!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || newMessage.trim();
    if (!messageContent || !selectedConnection) return;

    const { error } = await supabase.from('messages').insert({
      connection_id: selectedConnection.id,
      sender_id: userId,
      content: messageContent
    } as any);

    if (error) {
      toast.error('Failed to send message');
      return;
    }

    setNewMessage('');
    setShowPlaceShare(false);
  };

  const sharePlace = (place: Place) => {
    const placeMessage = `📍 Check out this place: ${place.name}\n${place.description}\nRating: ${place.rating}⭐`;
    sendMessage(placeMessage);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Connections List */}
          <div className="bg-white rounded-2xl shadow-lg p-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Connections</h2>
            <div className="space-y-2">
              {connections.map((conn) => (
                <motion.button
                  key={conn.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedConnection(conn)}
                  className={`w-full p-4 rounded-xl text-left transition-colors ${
                    selectedConnection?.id === conn.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{conn.other_user?.avatar_emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {conn.other_user?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        Level {conn.other_user?.level}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg flex flex-col">
            {selectedConnection ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedConnection.other_user?.avatar_emoji}</span>
                      <div>
                        <p className="font-bold text-gray-800">
                          {selectedConnection.other_user?.username}
                        </p>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                    {selectedConnection.unlocked_at && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowPlaceShare(!showPlaceShare)}
                      >
                        <MapPin className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Place Share Panel */}
                {showPlaceShare && (
                  <div className="border-b p-4 bg-gray-50 max-h-48 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Share a Place</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {places.slice(0, 6).map((place) => (
                        <button
                          key={place.id}
                          onClick={() => sharePlace(place)}
                          className="text-left p-2 bg-white rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <p className="font-semibold text-sm truncate">{place.name}</p>
                          <p className="text-xs text-gray-500">{place.rating}⭐</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages or Unlock Screen */}
                {!selectedConnection.unlocked_at ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Chat Locked
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Unlock this chat for 20 Mapos to start messaging with {selectedConnection.other_user?.username}
                      </p>
                      <div className="bg-purple-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-700">
                          Your Mapos: <span className="font-bold text-purple-600">{userMapos} 💎</span>
                        </p>
                      </div>
                      <Button 
                        onClick={unlockChat}
                        disabled={userMapos < 20}
                        className="w-full"
                      >
                        Unlock Chat (20 💎)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                              msg.sender_id === userId
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p>{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        />
                        <Button onClick={() => sendMessage()}>
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a connection to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
