import { Plus, Trash2, Settings, Save, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';

const DistributionForm = ({ 
  selectedArea,
  setSelectedArea,
  selectedKioskId,
  setSelectedKioskId,
  items,
  setItems,
  manualCakeId,
  setManualCakeId,
  manualQty,
  setManualQty,
  handleAddManualItem,
  handleCreateDistribution,
  getCakePrice,
  kiosks,
  cakes,
  distDate,
  setDistDate,
  onShowPriceManager,
  isSubmitting
}) => {
  const filteredKiosksForInput = kiosks.filter(k => k.is_active && (selectedArea ? k.area === selectedArea : true));

  // Hitung total nilai
  const totalValue = items.reduce((sum, item) => {
    return sum + (item.quantity * getCakePrice(item.cake_id));
  }, 0);

  // Cek stok
  const checkStockAvailability = (cakeId, quantity) => {
    const cake = cakes.find(c => c.id === cakeId);
    return cake ? cake.current_stock >= quantity : false;
  };

  return (
    <div className="lg:col-span-4">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-6">
        <div className="border-b pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus size={18} className="text-stone-600"/> Titipan Baru
          </h2>
        </div>
        
        <form onSubmit={handleCreateDistribution} className="space-y-4">
          {/* Area Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">1. Area</label>
            <select 
              value={selectedArea} 
              onChange={e => { 
                setSelectedArea(e.target.value); 
                setSelectedKioskId(''); 
                setItems([]); 
              }} 
              className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Pilih Area --</option>
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Kios Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">2. Kios</label>
            <select 
              value={selectedKioskId} 
              onChange={e => setSelectedKioskId(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              required
              disabled={!selectedArea}
            >
              <option value="">-- Pilih Kios --</option>
              {filteredKiosksForInput.map(k => (
                <option key={k.id} value={k.id}>
                  {k.name} - {k.area}
                </option>
              ))}
            </select>
            {!selectedArea && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                Pilih area terlebih dahulu
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={distDate} 
                onChange={e => setDistDate(e.target.value)} 
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                required 
              />
              {/* <button
                type="button"
                onClick={() => onShowPriceManager(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1 transition-colors"
                title="Kelola harga harian"
              >
                <Settings size={14} />
              </button> */}
            </div>
            {/* <div className="text-xs text-gray-500 mt-1">
              Harga berdasarkan: {new Date(distDate).toLocaleDateString('id-ID')}
            </div> */}
          </div>

          <hr className="border-gray-100 my-2" />

          {/* Items Section */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase">3. Daftar Kue</label>
              <span className="text-xs text-gray-500">
                {items.filter(i => i.source === 'history').length} history, 
                {items.filter(i => i.source === 'template').length} template,
                {items.filter(i => i.source === 'manual').length} manual
              </span>
            </div>

            {/* Manual Item Addition */}
            <div className="flex gap-2 mb-3">
              <select 
                value={manualCakeId} 
                onChange={e => setManualCakeId(e.target.value)} 
                className="flex-1 px-2 py-2 border rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500"
                disabled={cakes.length === 0}
              >
                <option value="">+ Tambah Manual</option>
                {cakes.map(c => (
                  <option key={c.id} value={c.id} disabled={!checkStockAvailability(c.id, 1)}>
                    {c.name} {!checkStockAvailability(c.id, 1) && '(Stok habis)'}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                value={manualQty} 
                onChange={e => setManualQty(e.target.value)} 
                placeholder="Qty" 
                className="w-16 px-2 py-2 border rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500 text-center"
                min="1"
                disabled={!manualCakeId}
              />
              <button 
                type="button" 
                onClick={handleAddManualItem} 
                className="bg-gray-800 text-white px-3 rounded-lg hover:bg-black text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={!manualCakeId || !manualQty}
              >
                +
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Belum ada item. Pilih kios untuk menampilkan template/history, atau tambah manual.
                </div>
              ) : (
                items.map((item) => {
                  const isStockSufficient = checkStockAvailability(item.cake_id, item.quantity);
                  const itemPrice = getCakePrice(item.cake_id);
                  const itemTotal = item.quantity * itemPrice;
                  
                  return (
                    <div key={item.tempId} className={`flex justify-between items-center bg-white px-3 py-2 rounded text-sm border shadow-sm ${
                      isStockSufficient ? 'border-gray-200' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className={`font-medium ${!isStockSufficient ? 'text-red-600' : ''}`}>
                            {item.cake_name}
                            {!isStockSufficient && (
                              <span className="text-xs text-red-500 ml-1">(Stok tidak cukup)</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {itemPrice === (cakes.find(c => c.id === item.cake_id)?.price_per_piece || 0) ? (
                              <span className="text-gray-500">Default</span>
                            ) : (
                              <span className="text-green-600 font-medium">Harga Khusus</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.source === 'history' ? 'bg-blue-100 text-blue-600' : 
                            item.source === 'template' ? 'bg-orange-100 text-orange-600' : 
                            'bg-green-100 text-green-600'
                          }`}>
                            {item.source === 'history' ? 'History' : item.source === 'template' ? 'Template' : 'Manual'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stok: {cakes.find(c => c.id === item.cake_id)?.current_stock || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${!isStockSufficient ? 'text-red-600' : ''}`}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-green-600 font-bold whitespace-nowrap">
                          Rp {itemTotal.toLocaleString()}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setItems(items.filter(i => i.tempId !== item.tempId))} 
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Summary */}
            {items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Total Nilai:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatRupiah(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>Total Item: {items.length} jenis</span>
                  <span>Total Quantity: {items.reduce((sum, item) => sum + item.quantity, 0)} pcs</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || items.length === 0} 
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16}/> 
                Simpan Titipan Baru
              </>
            )}
          </button>

          {/* Validation Messages */}
          {items.length === 0 && (
            <p className="text-center text-sm text-orange-600">
              Tambahkan minimal satu item kue untuk menyimpan titipan
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default DistributionForm;