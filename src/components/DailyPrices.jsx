import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Save, RefreshCw, X, DollarSign } from 'lucide-react';

export default function DailyPrices() {
  const [cakes, setCakes] = useState([]);
  const [dailyPrices, setDailyPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchCakes();
    fetchDailyPrices();
  }, [selectedDate]);

  const fetchCakes = async () => {
    const supabase = getSupabaseWithAuth();
    const { data } = await supabase
      .from('cakes')
      .select('id, name, price_per_piece, current_stock')
      .order('name');
    setCakes(data || []);
  };

  const fetchDailyPrices = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();
    
    const [pricesData, historyData] = await Promise.all([
      supabase
        .from('daily_prices')
        .select('cake_id, selling_price')
        .eq('price_date', selectedDate),
      
      supabase
        .from('daily_prices')
        .select('cake_id, selling_price, price_date')
        .order('price_date', { ascending: false })
        .limit(50)
    ]);

    const pricesMap = {};
    pricesData.data?.forEach(item => {
      pricesMap[item.cake_id] = item.selling_price;
    });
    setDailyPrices(pricesMap);
    setPriceHistory(historyData.data || []);
    setLoading(false);
  };

  const handlePriceChange = (cakeId, newPrice) => {
    setDailyPrices(prev => ({
      ...prev,
      [cakeId]: parseFloat(newPrice) || 0
    }));
  };

  const savePrices = async () => {
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const priceEntries = Object.entries(dailyPrices).map(([cake_id, selling_price]) => ({
        cake_id,
        price_date: selectedDate,
        selling_price
      }));

      const { error } = await supabase
        .from('daily_prices')
        .upsert(priceEntries, {
          onConflict: 'user_id,cake_id,price_date'
        });

      if (error) throw error;
      
      alert('Harga harian berhasil disimpan!');
      fetchDailyPrices();
    } catch (err) {
      alert('Gagal menyimpan harga: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCakePrice = (cakeId) => {
    return dailyPrices[cakeId] || cakes.find(c => c.id === cakeId)?.price_per_piece || 0;
  };

  const copyFromPreviousDay = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const supabase = getSupabaseWithAuth();
    const { data } = await supabase
      .from('daily_prices')
      .select('cake_id, selling_price')
      .eq('price_date', prevDateStr);

    if (data && data.length > 0) {
      const newPrices = {};
      data.forEach(item => {
        newPrices[item.cake_id] = item.selling_price;
      });
      setDailyPrices(newPrices);
      alert('Harga berhasil disalin dari hari sebelumnya!');
    } else {
      alert('Tidak ada harga untuk hari sebelumnya.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Harga Harian</h1>
            <p className="text-gray-500 text-sm">Atur harga jual kue berdasarkan tanggal</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <button
              onClick={copyFromPreviousDay}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Salin dari Kemarin
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Price Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Harga untuk {new Date(selectedDate).toLocaleDateString('id-ID')}
                </h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Memuat harga...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cakes.map(cake => (
                      <div key={cake.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{cake.name}</div>
                          <div className="text-sm text-gray-500">
                            Stok: {cake.current_stock} | Harga default: Rp {cake.price_per_piece?.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Harga Hari Ini</div>
                            <div className="font-bold text-green-600">
                              Rp {getCakePrice(cake.id)?.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Rp</span>
                            <input
                              type="number"
                              value={dailyPrices[cake.id] || ''}
                              onChange={(e) => handlePriceChange(cake.id, e.target.value)}
                              className="w-32 px-3 py-2 border rounded text-right font-medium"
                              min="0"
                              placeholder={cake.price_per_piece}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-6">
                  <button
                    onClick={savePrices}
                    disabled={isSubmitting || loading}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Harga'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-800">Riwayat Harga</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {priceHistory.slice(0, 10).map((price, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">
                          {cakes.find(c => c.id === price.cake_id)?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(price.price_date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          Rp {price.selling_price?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {priceHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                      <p>Belum ada riwayat harga</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}