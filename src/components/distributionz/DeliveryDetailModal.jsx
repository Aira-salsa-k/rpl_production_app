import { X } from 'lucide-react';
import { formatRupiah, formatDate } from '../../utils/formatters';

const DeliveryDetailModal = ({ delivery, onClose, onConfirmDelivery }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Detail Pengantaran</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                  <span className="font-medium">{formatDate(delivery.delivery_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    delivery.status === 'delivered' ? 'text-green-600' : 
                    delivery.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {delivery.status === 'delivered' ? 'Terkirim' : 
                     delivery.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Nilai:</span>
                  <span className="font-bold text-green-600">{formatRupiah(delivery.total_value)}</span>
                </div>
              </div>
            </div>
            
            {delivery.notes && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Catatan</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{delivery.notes}</p>
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
                {delivery.delivery_items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="font-medium">{item.store_id.name}</div>
                      <div className="text-xs text-gray-500">{item.store_id.address}</div>
                    </td>
                    <td className="px-4 py-2">{item.cake_id.name}</td>
                    <td className="px-4 py-2 text-center">{item.quantity_delivered}</td>
                    <td className="px-4 py-2 text-center">{formatRupiah(item.unit_price)}</td>
                    <td className="px-4 py-2 text-center font-bold">{formatRupiah(item.total_price)}</td>
                    <td className="px-4 py-2 text-center">
                      {item.is_returned ? (
                        <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                          Retur: {item.return_quantity}pcs
                        </span>
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

          {delivery.status === 'pending' && (
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => onConfirmDelivery(delivery.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Konfirmasi Pengantaran
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailModal;