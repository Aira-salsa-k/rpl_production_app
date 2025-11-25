import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Trash2, PlusCircle, Save, Package, History } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

const DistributionCard = ({ 
  distribution, 
  onEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onReconcile,
  isEditing = false,
  editItems = [],
  onEditItemChange,
  onRemoveEditItem,
  onAddEditItem,
  cakes = []
}) => {
  // --- PERUBAHAN UTAMA DI SINI ---
  // Kita gunakan satu variabel string, bukan object.
  // Nilainya: null (tutup semua), 'activeItems' (buka penitipan), atau 'history' (buka riwayat)
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (sectionName) => {
    // Jika section yang diklik sudah terbuka, maka tutup (jadi null)
    // Jika belum, maka set ke section tersebut (otomatis menutup yang lain)
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };
  // -------------------------------

  // Filter items berdasarkan status
  const activeItems = distribution.distribution_items.filter(item => !item.withdrawal_date);
  const completedItems = distribution.distribution_items.filter(item => item.withdrawal_date);

  const totalBill = distribution.distribution_items
    .filter(item => item.withdrawal_date)
    .reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               {/* Nama Kiosk (Optional jika diperlukan) */}
               {/* <h3 className="font-semibold text-gray-900 text-lg">{distribution.kiosks?.name}</h3> */}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="font-medium">Tanggal:</span>
                {new Date(distribution.distribution_date).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && activeItems.length > 0 && (
              <>
                <button
                  onClick={() => onEdit(distribution)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit distribusi"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onReconcile(distribution)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Setor semua"
                >
                  <Save size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODE AREA */}
      {isEditing && (
        <div className="p-4 border-b border-yellow-200 bg-yellow-50">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Edit3 size={18} className="text-yellow-600" />
                Edit Item Distribusi
              </h4>
              <button
                onClick={onAddEditItem}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <PlusCircle size={14} />
                Tambah Item
              </button>
            </div>
            
            <div className="space-y-3">
              {editItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-300">
                  <select
                    value={item.cake_id}
                    onChange={(e) => onEditItemChange(idx, 'cake_id', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Pilih Kue</option>
                    {cakes.map(cake => (
                      <option key={cake.id} value={cake.id}>{cake.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity_sent}
                    onChange={(e) => onEditItemChange(idx, 'quantity_sent', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-yellow-400"
                    min="1"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => onRemoveEditItem(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onSaveEdit}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Simpan Perubahan
              </button>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOGGLE SECTIONS AREA */}
      {!isEditing && (
        <div className="divide-y divide-gray-100">
          
          {/* === BAGIAN 1: DATA PENITIPAN === */}
          <div className="p-4">
            <button
              onClick={() => toggleSection('activeItems')}
              className={`flex justify-between items-center w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors ${activeSection === 'activeItems' ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Package size={18} className="text-blue-500" />
                <span className="font-semibold text-gray-900">
                  Data Penitipan Aktif
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {activeItems.length} item
                </span>
              </div>
              <div className="flex items-center gap-2">
                {activeItems.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {activeItems.reduce((sum, item) => sum + item.quantity_sent, 0)} pcs
                  </span>
                )}
                {/* Check Active Section di sini */}
                {activeSection === 'activeItems' ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>
            </button>

            {/* Render Konten hanya jika activeSection === 'activeItems' */}
            {activeSection === 'activeItems' && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                {activeItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Tidak ada penitipan aktif
                  </div>
                ) : (
                  activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.cake_id?.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Titip:</span> {item.quantity_sent} pcs
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Harga: {formatRupiah(item.price_at_distribution)}/pcs
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatRupiah(item.quantity_sent * item.price_at_distribution)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* === BAGIAN 2: DATA RIWAYAT === */}
          <div className="p-4">
            <button
              onClick={() => toggleSection('history')}
              className={`flex justify-between items-center w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors ${activeSection === 'history' ? 'bg-green-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <History size={18} className="text-green-500" />
                <span className="font-semibold text-gray-900">
                  Riwayat Setoran
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  {completedItems.length} item
                </span>
              </div>
              <div className="flex items-center gap-2">
                {completedItems.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Total: {formatRupiah(totalBill)}
                  </span>
                )}
                {/* Check Active Section di sini */}
                {activeSection === 'history' ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </div>
            </button>

            {/* Render Konten hanya jika activeSection === 'history' */}
            {activeSection === 'history' && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                {completedItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Belum ada riwayat setoran
                  </div>
                ) : (
                  completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">
                          {item.cake_id?.name}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            {formatRupiah(item.quantity_sold * item.price_at_distribution)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.withdrawal_date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-blue-700">{item.quantity_sent}</div>
                          <div className="text-gray-500">Titip</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{item.quantity_sold}</div>
                          <div className="text-gray-500">Laku</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-500">{item.quantity_damaged_at_location}</div>
                          <div className="text-gray-500">Rusak</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Harga:</span> {formatRupiah(item.price_at_distribution)}/pcs
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionCard;