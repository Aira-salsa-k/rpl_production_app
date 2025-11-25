import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDistributions = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSupabaseWithAuth } = useAuth();

  const fetchDistributions = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi');
      }

      const { data, error } = await supabase
        .from('distributions')
        .select(`
          id, distribution_date, kiosk_id, user_id,
          kiosks ( id, name, area, address, detailed_address, gmaps_link, contact_person, phone_number, notes, is_active ),
          distribution_items (
            id, quantity_sent, quantity_sold, quantity_damaged_at_location,
            price_at_distribution, withdrawal_date,
            cake_id ( id, name )
          )
        `)
        .eq('user_id', user.id)
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      setDistributions(data || []);
    } catch (err) {
      console.error('Fetch distributions error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  return {
    distributions,
    loading,
    refetch: fetchDistributions
  };
};