// src/hooks/useCakes.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useCakes = () => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSupabaseWithAuth } = useAuth();

  const fetchCakes = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi');
      }

      const { data, error } = await supabase
        .from('cakes')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCakes(data || []);
    } catch (err) {
      console.error('Fetch cakes error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  return {
    cakes,
    loading,
    refetch: fetchCakes
  };
};