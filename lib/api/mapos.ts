import { createClient } from '@/lib/supabase/client';

export const addMapos = async (userId: string, amount: number, reason: string) => {
  const supabase = createClient();
  
  // Add transaction
  const { error: txError } = await (supabase as any).from('transactions').insert({
    user_id: userId,
    amount,
    type: 'earn',
    reason
  });

  if (txError) throw txError;

  // Update user mapos
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('mapos')
    .eq('id', userId)
    .single();

  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({ mapos: (profile?.mapos || 0) + amount })
    .eq('id', userId);

  if (updateError) throw updateError;
};

export const spendMapos = async (userId: string, amount: number, reason: string) => {
  const supabase = createClient();
  
  // Check balance
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('mapos')
    .eq('id', userId)
    .single();

  if (!profile || profile.mapos < amount) {
    throw new Error('Insufficient Mapos');
  }

  // Add transaction
  const { error: txError } = await (supabase as any).from('transactions').insert({
    user_id: userId,
    amount,
    type: 'spend',
    reason
  });

  if (txError) throw txError;

  // Update user mapos
  const { error: updateError } = await (supabase as any)
    .from('profiles')
    .update({ mapos: profile.mapos - amount })
    .eq('id', userId);

  if (updateError) throw updateError;
};

export const getTransactionHistory = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
