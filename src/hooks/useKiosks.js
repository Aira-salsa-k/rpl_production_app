import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useKiosks = () => {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSupabaseWithAuth } = useAuth();

  const fetchKiosks = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi');
      }

      const { data, error } = await supabase
        .from('kiosks')
        .select(`
          *,
          kiosk_consignment_templates (
            cake_id, default_quantity,
            cakes ( name, price_per_piece ) 
          )
        `)
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setKiosks(data || []);
    } catch (err) {
      console.error('Fetch kiosks error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKiosks();
  }, []);

  return {
    kiosks,
    loading,
    refetch: fetchKiosks
  };
};