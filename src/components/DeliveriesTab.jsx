// components/DeliveriesTab.jsx
import { useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import DeliveryDetailModal from './DeliveryDetailModal';
import DeliveryFormModal from './DeliveryFormModal';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function DeliveriesTab({ 
  deliveries, 
  onConfirmDelivery, 
  onViewDelivery,
  selectedDelivery,
  showDeliveryModal,
  onCloseDeliveryModal,
  onCreateDelivery,
  cakes // Hanya butuh cakes, tidak butuh stores untuk external delivery
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filterStatus === 'all') return true;
    return delivery.status === filterStatus;
  });

  return (
    <div className="animate-fadeIn">
      {/* HEADER DENGAN TOMBOL BUAT PENGANTARAN BARU */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Truck size={20} /> Data Pengantaran
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Sistem pengiriman pesanan langsung ke customer
            </p>
          </div>
          
          <div className="flex gap-2">
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
            
            {/* TOMBOL BUAT PENGANTARAN BARU */}
            <button
              onClick={() => setShowDeliveryForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Buat Pengantaran Baru
            </button>
          </div>
        </div>
      </div>
      
      {/* TABLE DATA PENGANTARAN */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Nilai</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Items</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {new Date(delivery.delivery_date).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{delivery.customer_name || delivery.store_id?.name || 'External Customer'}</div>
                  {delivery.customer_phone && (
                    <div className="text-xs text-gray-500">{delivery.customer_phone}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {delivery.status === 'delivered' ? 'Terkirim' : 
                    delivery.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600">
                  {formatRupiah(delivery.total_value)}
                </td>
                <td className="px-4 py-3 text-center">
                  {delivery.delivery_items?.length || 0} items
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onViewDelivery(delivery)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                  >
                    Lihat Detail
                  </button>
                  {delivery.status === 'pending' && (
                    <button
                      onClick={() => onConfirmDelivery(delivery.id)}
                      className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Konfirmasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDeliveries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Truck className="mx-auto mb-2 text-gray-300" size={48} />
            <p>Belum ada data pengantaran.</p>
            <button
              onClick={() => setShowDeliveryForm(true)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Buat Pengantaran Pertama
            </button>
          </div>
        )}
      </div>

      {/* Delivery Detail Modal */}
      {showDeliveryModal && selectedDelivery && (
        <DeliveryDetailModal 
          delivery={selectedDelivery}
          onClose={onCloseDeliveryModal}
          onConfirmDelivery={onConfirmDelivery}
        />
      )}

      {/* Delivery Form Modal */}
      {showDeliveryForm && (
        <DeliveryFormModal 
          onClose={() => setShowDeliveryForm(false)}
          onSubmit={onCreateDelivery}
          cakes={cakes}
        />
      )}
    </div>
  );
}