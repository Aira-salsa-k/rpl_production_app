// components/DeliveryFormModal.jsx
import { useState } from 'react';
import { X, Plus, Trash2, MapPin, Package, User, Phone } from 'lucide-react';

export default function DeliveryFormModal({ onClose, onSubmit, cakes }) {
  const [formData, setFormData] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
    items: [{ cake_id: '', quantity: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('Gagal membuat pengantaran: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { cake_id: '', quantity: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleItemChange = (itemIndex, field, value) => {
    const newItems = [...formData.items];
    newItems[itemIndex][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Hitung total sementara
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      if (item.cake_id && item.quantity) {
        const cake = cakes.find(c => c.id === item.cake_id);
        if (cake) {
          return total + (cake.price_per_piece * parseInt(item.quantity));
        }
      }
      return total;
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Buat Pengantaran Baru</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tanggal Pengantaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Pengantaran *
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Informasi Customer */}
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} />
                Informasi Customer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Customer *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Nama lengkap customer"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon *
                  </label>
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 absolute ml-3" />
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg"
                      placeholder="08xxx"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Alamat Pengantaran *
                </label>
                <textarea
                  value={formData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Alamat lengkap untuk pengantaran..."
                  required
                />
              </div>
            </div>

            {/* Items yang Dikirim */}
            <div className="border-2 border-dashed border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={18} />
                  Items yang Dikirim
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  Tambah Item
                </button>
              </div>

              {formData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-3 items-start p-3 bg-white rounded-lg border border-green-100 mb-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Jenis Kue *
                      </label>
                      <select
                        value={item.cake_id}
                        onChange={(e) => handleItemChange(itemIndex, 'cake_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        required
                      >
                        <option value="">-- Pilih Kue --</option>
                        {cakes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Stok: {c.current_stock}, Harga: Rp {c.price_per_piece?.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Jumlah *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(itemIndex, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        min="1"
                        max={cakes.find(c => c.id === item.cake_id)?.current_stock || 0}
                        required
                      />
                      {item.cake_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Stok tersedia: {cakes.find(c => c.id === item.cake_id)?.current_stock || 0}
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(itemIndex)}
                      className="text-red-600 hover:text-red-800 p-2 mt-6"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* Total Harga */}
              {calculateTotal() > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Harga:</span>
                    <span className="text-lg font-bold text-green-600">
                      Rp {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Catatan untuk pengantaran, instruksi khusus, dll."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Membuat...' : (
                <>
                  <Plus size={16} />
                  Buat Pengantaran
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}