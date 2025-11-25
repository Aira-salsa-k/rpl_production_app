import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, Calendar, Filter, Check, X, RefreshCw, MapPin, Package } from 'lucide-react';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();
    
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        id, delivery_date, status, total_value, notes, created_at, updated_at,
        delivery_items (
          id, quantity_delivered, unit_price, total_price, is_returned, return_quantity, return_reason,
          store_id ( id, name, address, gmaps_link ),
          cake_id ( id, name )
        )
      `)
      .order('delivery_date', { ascending: false });

    if (!error) {
      setDeliveries(data || []);
    }
    setLoading(false);
  };

  const handleConfirmDelivery = async (deliveryId) => {
    if (!confirm('Konfirmasi pengantaran sudah selesai?')) return;

    try {
      const supabase = getSupabaseWithAuth();
      const { error } = await supabase.rpc('confirm_delivery', {
        p_delivery_id: deliveryId
      });

      if (error) throw error;

      alert('Pengantaran dikonfirmasi!');
      fetchDeliveries();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Gagal mengkonfirmasi pengantaran: ' + error.message);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filterStatus === 'all') return true;
    return delivery.status === filterStatus;
  });

  if (loading) {
    return <div className="p-8 text-center flex flex-col items-center justify-center"><RefreshCw className="animate-spin mb-2"/> Memuat Data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Pengantaran</h1>
            <p className="text-gray-500 text-sm">Sistem pengantaran dan penitipan kue</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="delivered">Terkirim</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Pengantaran - {new Date(delivery.delivery_date).toLocaleDateString('id-ID')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status === 'delivered' ? 'Terkirim' : 
                         delivery.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14}/> 
                        {new Date(delivery.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14}/>
                        {delivery.delivery_items?.length || 0} items
                      </span>
                      <span className="flex items-center gap-1 font-bold text-green-600">
                        Total: {formatRupiah(delivery.total_value)}
                      </span>
                    </div>
                    
                    {delivery.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {delivery.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {delivery.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmDelivery(delivery.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={16} />
                        Konfirmasi
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedDelivery(delivery)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Items Preview */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Items Pengantaran:</h4>
                <div className="grid gap-3">
                  {delivery.delivery_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.cake_id.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {item.store_id.name} - {item.store_id.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.quantity_delivered} pcs</div>
                        <div className="text-sm text-green-600 font-bold">
                          {formatRupiah(item.total_price)}
                        </div>
                        {item.is_returned && (
                          <div className="text-xs text-red-600">
                            Retur: {item.return_quantity}pcs
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Truck className="mx-auto text-gray-200 mb-3" size={48}/>
              <p className="text-gray-400 font-medium">Tidak ada data pengantaran.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Detail Pengantaran</h2>
                <button 
                  onClick={() => setSelectedDelivery(null)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informasi Pengantaran</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">
                        {new Date(selectedDelivery.delivery_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        selectedDelivery.status === 'delivered' ? 'text-green-600' : 
                        selectedDelivery.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedDelivery.status === 'delivered' ? 'Terkirim' : 
                         selectedDelivery.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Nilai:</span>
                      <span className="font-bold text-green-600">
                        {formatRupiah(selectedDelivery.total_value)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedDelivery.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Catatan</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedDelivery.notes}
                    </p>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-gray-700 mb-3">Detail Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Kios</th>
                      <th className="px-4 py-2 text-left">Kue</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-center">Harga</th>
                      <th className="px-4 py-2 text-center">Total</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDelivery.delivery_items?.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.store_id.name}</div>
                          <div className="text-xs text-gray-500">{item.store_id.address}</div>
                          {item.store_id.gmaps_link && (
                            <a 
                              href={item.store_id.gmaps_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Lihat di Maps
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-2">{item.cake_id.name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity_delivered}</td>
                        <td className="px-4 py-2 text-center">{formatRupiah(item.unit_price)}</td>
                        <td className="px-4 py-2 text-center font-bold">{formatRupiah(item.total_price)}</td>
                        <td className="px-4 py-2 text-center">
                          {item.is_returned ? (
                            <div className="text-red-600 text-xs">
                              <div>Retur: {item.return_quantity}pcs</div>
                              {item.return_reason && (
                                <div className="text-gray-500">({item.return_reason})</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
                              Terkirim
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedDelivery.status === 'pending' && (
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => handleConfirmDelivery(selectedDelivery.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Konfirmasi Pengantaran
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}