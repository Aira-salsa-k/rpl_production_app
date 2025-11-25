import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSupabaseWithAuth } = useAuth();

  const fetchDeliveries = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi');
      }

      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          id, delivery_date, status, total_value, notes, created_at, updated_at,
          delivery_items (
            id, quantity_delivered, unit_price, total_price, is_returned, return_quantity, return_reason,
            store_id ( id, name, address ),
            cake_id ( id, name )
          )
        `)
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (err) {
      console.error('Fetch deliveries error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    loading,
    refetch: fetchDeliveries
  };
};