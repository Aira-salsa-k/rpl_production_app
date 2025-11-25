import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DailyPriceManager = ({ date, onClose, cakes }) => {
  const [priceData, setPriceData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSupabaseWithAuth } = useAuth();
  
  useEffect(() => {
    loadDailyPrices();
  }, [date, cakes]);

  const loadDailyPrices = async () => {
    const supabase = getSupabaseWithAuth();
    const { data } = await supabase
      .from('daily_prices')
      .select('cake_id, selling_price')
      .eq('price_date', date);
    
    const pricesMap = {};
    data?.forEach(item => {
      pricesMap[item.cake_id] = item.selling_price;
    });
    
    const initialData = {};
    cakes.forEach(cake => {
      initialData[cake.id] = pricesMap[cake.id] !== undefined 
        ? pricesMap[cake.id] 
        : cake.price_per_piece;
    });
    
    setPriceData(initialData);
  };

  const handlePriceChange = (cakeId, newPrice) => {
    const numericValue = parseFloat(newPrice);
    setPriceData(prev => ({
      ...prev,
      [cakeId]: isNaN(numericValue) ? '' : numericValue
    }));
  };

  const savePrices = async () => {
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi. Silakan login kembali.');
      }

      const priceEntries = cakes.map(cake => {
        const inputPrice = priceData[cake.id];
        const selling_price = inputPrice !== undefined && inputPrice !== '' && inputPrice > 0
          ? parseFloat(inputPrice)
          : cake.price_per_piece;
        
        return {
          user_id: user.id,
          cake_id: cake.id,
          price_date: date,
          selling_price: selling_price
        };
      });

      const { error } = await supabase
        .from('daily_prices')
        .upsert(priceEntries, {
          onConflict: 'user_id,cake_id,price_date'
        });

      if (error) throw error;
      
      alert('Harga harian berhasil disimpan!');
      onClose();
    } catch (err) {
      console.error('Save prices error:', err);
      alert('Gagal menyimpan harga: ' + (err.message || 'Terjadi kesalahan tidak diketahui'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefault = () => {
    const defaultPrices = {};
    cakes.forEach(cake => {
      defaultPrices[cake.id] = cake.price_per_piece;
    });
    setPriceData(defaultPrices);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Harga Harian - {new Date(date).toLocaleDateString('id-ID')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Atur harga khusus untuk tanggal ini. Kosongkan untuk menggunakan harga default.
            </p>
            <button
              onClick={resetToDefault}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset ke Harga Default
            </button>
          </div>

          <div className="space-y-3">
            {cakes.map(cake => (
              <div key={cake.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{cake.name}</div>
                  <div className="text-sm text-gray-500">
                    Harga default: Rp {cake.price_per_piece?.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={priceData[cake.id] || ''}
                    onChange={(e) => handlePriceChange(cake.id, e.target.value)}
                    className="w-32 px-3 py-2 border rounded text-right font-medium"
                    min="0"
                    step="1000"
                    placeholder={cake.price_per_piece?.toString()}
                  />
                  {priceData[cake.id] && priceData[cake.id] !== cake.price_per_piece && (
                    <span className="text-xs text-green-600 font-medium">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-6">
            <button
              onClick={savePrices}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Harga Harian'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPriceManager;