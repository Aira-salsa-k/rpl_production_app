import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDailyPrices = () => {
  const [dailyPrices, setDailyPrices] = useState({});
  const { getSupabaseWithAuth } = useAuth();

  const fetchDailyPrices = async (date, cakes) => {
    if (!date) return;
    
    const supabase = getSupabaseWithAuth();
    const { data } = await supabase
      .from('daily_prices')
      .select('cake_id, selling_price')
      .eq('price_date', date);
    
    const pricesMap = {};
    data?.forEach(item => {
      pricesMap[item.cake_id] = item.selling_price;
    });
    
    const combinedPrices = {};
    cakes.forEach(cake => {
      combinedPrices[cake.id] = pricesMap[cake.id] !== undefined 
        ? pricesMap[cake.id] 
        : cake.price_per_piece;
    });
    
    setDailyPrices(combinedPrices);
  };

  return {
    dailyPrices,
    fetchDailyPrices
  };
};