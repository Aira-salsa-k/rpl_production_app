// // components/Distribution/KioskCard.js
// import { useState } from 'react';
// import { 
//   MapPin, Phone, ChevronDown, ChevronUp, Package, History, 
//   Edit3, RefreshCw, Save, X, Trash2, PlusCircle, AlertCircle 
// } from 'lucide-react';
// import { formatRupiah } from '../../utils/formatters';

// export default function KioskCard({ 
//   group, 
//   cakes, 
//   onStartEdit, 
//   onCancelEdit, 
//   onSaveEdit, 
//   onEditItemChange,
//   onAddEditItem, 
//   onRemoveEditItem,
//   onReconcileItem,
//   onBulkReconcile,
//   isEditing, 
//   editItems, 
//   isSubmitting 
// }) {
//   const { kiosk, activeDistributions, completedDistributions } = group;
  
//   // State untuk Dropdown
//   const [showActive, setShowActive] = useState(true);
//   const [showHistory, setShowHistory] = useState(false);

//   // Hitung Summary Cepat untuk Header
//   const totalActiveItems = activeDistributions.reduce((sum, d) => sum + d.distribution_items.length, 0);
//   const totalActiveQty = activeDistributions.reduce((sum, d) => 
//     sum + d.distribution_items.reduce((q, i) => q + i.quantity_sent, 0), 0
//   );
  
//   // Hitung total uang yg sudah disetor (dari history)
//   const totalRevenue = completedDistributions.reduce((sum, d) => 
//     sum + d.distribution_items.reduce((m, i) => m + (i.total_price || 0), 0), 0
//   );

//   return (
//     <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
//       !kiosk.is_active ? 'border-red-200 bg-red-50/30' : 
//       totalActiveItems > 0 ? 'border-blue-200 border-l-4 border-l-blue-500' : 'border-gray-200'
//     }`}>
      
//       {/* --- BAGIAN 1: HEADER UTAMA (Informasi Kios & Summary) --- */}
//       <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
//         {/* Kiri: Info Kios */}
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-2">
//             <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider border border-gray-200">
//               {kiosk.area}
//             </span>
//             <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
//               {kiosk.name}
//               {!kiosk.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Non-Aktif</span>}
//             </h3>
//           </div>
          
//           <div className="flex flex-wrap gap-4 text-sm text-gray-500">
//             {kiosk.contact_person && (
//               <div className="flex items-center gap-1.5">
//                 <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
//                   <span className="text-xs">👤</span>
//                 </div>
//                 {kiosk.contact_person}
//               </div>
//             )}
//             {kiosk.phone_number && (
//               <div className="flex items-center gap-1.5">
//                 <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
//                   <Phone size={12} />
//                 </div>
//                 {kiosk.phone_number}
//               </div>
//             )}
//              {kiosk.address && (
//               <div className="flex items-center gap-1.5">
//                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
//                   <MapPin size={12} />
//                 </div>
//                 <span className="truncate max-w-[200px]">{kiosk.address}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Kanan: Quick Stats & Actions */}
//         <div className="flex flex-col items-end gap-3">
//           <div className="flex gap-4 text-right">
//              <div>
//                 <p className="text-xs text-gray-500 uppercase font-semibold">Titipan Aktif</p>
//                 <p className={`font-bold text-lg ${totalActiveQty > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
//                   {totalActiveQty} <span className="text-sm font-normal text-gray-500">pcs</span>
//                 </p>
//              </div>
//              <div className="pl-4 border-l border-gray-200">
//                 <p className="text-xs text-gray-500 uppercase font-semibold">Total Omset</p>
//                 <p className="font-bold text-lg text-green-600">{formatRupiah(totalRevenue)}</p>
//              </div>
//           </div>

//           {/* Action Buttons (Hanya muncul jika ada barang aktif) */}
//           {totalActiveItems > 0 && !isEditing && kiosk.is_active && (
//             <div className="flex gap-2 mt-1">
//               <button 
//                 onClick={() => onStartEdit(activeDistributions[0])}
//                 className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors"
//               >
//                 <Edit3 size={14} /> Edit
//               </button>
//               <button 
//                 onClick={() => onBulkReconcile(activeDistributions[0])}
//                 disabled={isSubmitting}
//                 className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-1 transition-colors disabled:bg-gray-400"
//               >
//                 <RefreshCw size={14} /> Setor Semua
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- BAGIAN 2: DATA PENITIPAN (DROPDOWN) --- */}
//       <div className="border-t border-gray-200">
//         <button 
//           onClick={() => setShowActive(!showActive)}
//           className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
//         >
//           <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
//             <Package size={16} className="text-blue-500" />
//             Data Penitipan (Berjalan)
//             {totalActiveQty > 0 && (
//               <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
//                 {totalActiveQty} pcs
//               </span>
//             )}
//           </div>
//           {showActive ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
//         </button>

//         {showActive && (
//           <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
//             {/* MODE EDIT FORM */}
//             {isEditing ? (
//               <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
//                  <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-bold text-yellow-800 flex items-center gap-2">
//                         <Edit3 size={16}/> Mode Edit Stok
//                     </h4>
//                     <button onClick={onCancelEdit} className="text-gray-500 hover:text-gray-700"><X size={18}/></button>
//                  </div>
                 
//                  <div className="space-y-2 mb-4">
//                     {editItems.map((item, idx) => (
//                       <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-yellow-200">
//                         <select 
//                           className="flex-1 text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
//                           value={item.cake_id}
//                           onChange={(e) => onEditItemChange(idx, 'cake_id', e.target.value)}
//                           disabled={!!item.id} // Disable jika item lama (optional)
//                         >
//                            <option value="">Pilih Kue</option>
//                            {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                         </select>
//                         <input 
//                           type="number"
//                           className="w-20 text-sm border-gray-300 rounded text-center font-bold"
//                           value={item.quantity_sent}
//                           onChange={(e) => onEditItemChange(idx, 'quantity_sent', e.target.value)}
//                         />
//                         <button onClick={() => onRemoveEditItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
//                             <Trash2 size={16}/>
//                         </button>
//                       </div>
//                     ))}
//                     <button onClick={onAddEditItem} className="text-sm text-indigo-600 font-medium flex items-center gap-1 mt-2">
//                         <PlusCircle size={14}/> Tambah Item
//                     </button>
//                  </div>

//                  <div className="flex justify-end gap-2">
//                     <button onClick={onCancelEdit} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50">Batal</button>
//                     <button 
//                         onClick={onSaveEdit} 
//                         disabled={isSubmitting}
//                         className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
//                     >
//                         <Save size={14}/> Simpan
//                     </button>
//                  </div>
//               </div>
//             ) : (
//               /* MODE VIEW TABLE */
//               activeDistributions.length > 0 ? (
//                 <div className="overflow-x-auto border rounded-lg">
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-gray-50 text-gray-500 font-medium border-b">
//                       <tr>
//                         <th className="px-4 py-2">Tanggal</th>
//                         <th className="px-4 py-2">Produk</th>
//                         <th className="px-4 py-2 text-center">Jml Titip</th>
//                         <th className="px-4 py-2 text-right">Estimasi Total</th>
//                         <th className="px-4 py-2 text-center">Aksi</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y">
//                       {activeDistributions.map(dist => 
//                         dist.distribution_items.map((item) => (
//                           <tr key={item.id} className="hover:bg-gray-50">
//                             <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
//                               {new Date(dist.distribution_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
//                             </td>
//                             <td className="px-4 py-2 font-medium text-gray-900">{item.cake_id?.name}</td>
//                             <td className="px-4 py-2 text-center">
//                                 <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs">
//                                     {item.quantity_sent}
//                                 </span>
//                             </td>
//                             <td className="px-4 py-2 text-right text-gray-600">
//                               {formatRupiah(item.quantity_sent * item.price_at_distribution)}
//                             </td>
//                             <td className="px-4 py-2 text-center">
//                               <button 
//                                 onClick={() => onReconcileItem(item, dist)}
//                                 className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-100"
//                               >
//                                 Setor
//                               </button>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-6 text-gray-400 text-sm flex flex-col items-center">
//                     <Package className="mb-2 opacity-50"/>
//                     Tidak ada penitipan aktif saat ini.
//                 </div>
//               )
//             )}
//           </div>
//         )}
//       </div>

//       {/* --- BAGIAN 3: DATA HOSTODY / RIWAYAT (DROPDOWN) --- */}
//       <div className="border-t border-gray-200">
//         <button 
//           onClick={() => setShowHistory(!showHistory)}
//           className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
//         >
//           <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
//             <History size={16} className="text-green-500" />
//             Riwayat Penjualan & Setoran
//             {completedDistributions.length > 0 && (
//                 <span className="text-xs text-gray-400 font-normal ml-1">({completedDistributions.length} transaksi)</span>
//             )}
//           </div>
//           {showHistory ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
//         </button>

//         {showHistory && (
//           <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
//             {completedDistributions.length > 0 ? (
//                <div className="space-y-3">
//                  {completedDistributions.map(dist => (
//                    <div key={dist.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
//                       <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
//                           <div>
//                              <span className="text-xs text-gray-500 block">Tgl Setor</span>
//                              <span className="font-medium text-sm">
//                                 {new Date(dist.updated_at || dist.distribution_date).toLocaleDateString('id-ID', {
//                                     weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
//                                 })}
//                              </span>
//                           </div>
//                           <div className="text-right">
//                              <span className="text-xs text-gray-500 block">Total Disetor</span>
//                              <span className="font-bold text-green-600">
//                                 {formatRupiah(dist.distribution_items.reduce((acc, i) => acc + (i.total_price || 0), 0))}
//                              </span>
//                           </div>
//                       </div>
                      
//                       {/* Item Detail in History */}
//                       <div className="space-y-1">
//                           {dist.distribution_items.map((item, idx) => (
//                               <div key={idx} className="flex justify-between text-xs text-gray-600">
//                                   <span>{item.cake_id?.name}</span>
//                                   <div className="flex gap-3">
//                                       <span className="text-green-600">Laku: {item.quantity_sold}</span>
//                                       <span className="text-red-400">Retur: {item.quantity_returned_good + item.quantity_damaged_at_location}</span>
//                                   </div>
//                               </div>
//                           ))}
//                       </div>
//                    </div>
//                  ))}
//                </div>
//             ) : (
//                 <div className="text-center py-6 text-gray-400 text-sm flex flex-col items-center">
//                     <History className="mb-2 opacity-50"/>
//                     Belum ada riwayat setoran.
//                 </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

/////////////////////v2

// components/Distribution/KioskCard.js
import { useState } from 'react';
import { 
  MapPin, Phone, ChevronDown, ChevronUp, Package, History, 
  Edit3, RefreshCw, Save, X, Trash2, PlusCircle 
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export default function KioskCard({ 
  group, 
  cakes, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onEditItemChange,
  onAddEditItem, 
  onRemoveEditItem,
  onReconcileItem,
  onBulkReconcile,
  isEditing, 
  editItems, 
  isSubmitting 
}) {
  const { kiosk, activeDistributions, completedDistributions } = group;
  
  // --- PERBAIKAN LOGIC TOGGLE DI SINI ---
  // Kita ganti 2 state boolean menjadi 1 state string.
  // Default 'active' agar saat load, Data Penitipan langsung terbuka.
  const [activeSection, setActiveSection] = useState('active'); 

  const toggleSection = (sectionName) => {
    // Jika diklik section yang sedang terbuka -> tutup (null)
    // Jika diklik section lain -> buka section itu (otomatis tutup yang lain)
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };
  // --------------------------------------

  // Hitung Summary Cepat untuk Header
  const totalActiveItems = activeDistributions.reduce((sum, d) => sum + d.distribution_items.length, 0);
  const totalActiveQty = activeDistributions.reduce((sum, d) => 
    sum + d.distribution_items.reduce((q, i) => q + i.quantity_sent, 0), 0
  );
  
  // Hitung total uang yg sudah disetor (dari history)
  const totalRevenue = completedDistributions.reduce((sum, d) => 
    sum + d.distribution_items.reduce((m, i) => m + (i.total_price || 0), 0), 0
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
      !kiosk.is_active ? 'border-red-200 bg-red-50/30' : 
      totalActiveItems > 0 ? 'border-blue-200 border-l-4 border-l-blue-500' : 'border-gray-200'
    }`}>
      
      {/* --- BAGIAN 1: HEADER UTAMA (Informasi Kios & Summary) --- */}
      <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
        {/* Kiri: Info Kios */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider border border-gray-200">
              {kiosk.area}
            </span>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              {kiosk.name}
              {!kiosk.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Non-Aktif</span>}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {kiosk.contact_person && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                {kiosk.contact_person}
              </div>
            )}
            {kiosk.phone_number && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Phone size={12} />
                </div>
                {kiosk.phone_number}
              </div>
            )}
             {kiosk.address && (
              <div className="flex items-center gap-1.5">
                 <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin size={12} />
                </div>
                <span className="truncate max-w-[200px]">{kiosk.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Kanan: Quick Stats & Actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-4 text-right">
             <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Titipan Aktif</p>
                <p className={`font-bold text-lg ${totalActiveQty > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {totalActiveQty} <span className="text-sm font-normal text-gray-500">pcs</span>
                </p>
             </div>
             <div className="pl-4 border-l border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Omset</p>
                <p className="font-bold text-lg text-green-600">{formatRupiah(totalRevenue)}</p>
             </div>
          </div>

          {/* Action Buttons (Hanya muncul jika ada barang aktif) */}
          {totalActiveItems > 0 && !isEditing && kiosk.is_active && (
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => onStartEdit(activeDistributions[0])}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button 
                onClick={() => onBulkReconcile(activeDistributions[0])}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center gap-1 transition-colors disabled:bg-gray-400"
              >
                <RefreshCw size={14} /> Setor Semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- BAGIAN 2: DATA PENITIPAN (DROPDOWN) --- */}
      <div className="border-t border-gray-200">
        <button 
          onClick={() => toggleSection('active')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${activeSection === 'active' ? 'bg-blue-50/50' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
            <Package size={16} className="text-blue-500" />
            Data Penitipan (Berjalan)
            {totalActiveQty > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {totalActiveQty} pcs
              </span>
            )}
          </div>
          {/* Cek activeSection */}
          {activeSection === 'active' ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>

        {/* Tampilkan konten HANYA JIKA activeSection === 'active' */}
        {activeSection === 'active' && (
          <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
            {/* MODE EDIT FORM */}
            {isEditing ? (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                        <Edit3 size={16}/> Mode Edit Stok
                    </h4>
                    <button onClick={onCancelEdit} className="text-gray-500 hover:text-gray-700"><X size={18}/></button>
                 </div>
                 
                 <div className="space-y-2 mb-4">
                    {editItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-yellow-200">
                        <select 
                          className="flex-1 text-sm border-gray-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
                          value={item.cake_id}
                          onChange={(e) => onEditItemChange(idx, 'cake_id', e.target.value)}
                          disabled={!!item.id} 
                        >
                           <option value="">Pilih Kue</option>
                           {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input 
                          type="number"
                          className="w-20 text-sm border-gray-300 rounded text-center font-bold"
                          value={item.quantity_sent}
                          onChange={(e) => onEditItemChange(idx, 'quantity_sent', e.target.value)}
                        />
                        <button onClick={() => onRemoveEditItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                    <button onClick={onAddEditItem} className="text-sm text-indigo-600 font-medium flex items-center gap-1 mt-2">
                        <PlusCircle size={14}/> Tambah Item
                    </button>
                 </div>

                 <div className="flex justify-end gap-2">
                    <button onClick={onCancelEdit} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-50">Batal</button>
                    <button 
                        onClick={onSaveEdit} 
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
                    >
                        <Save size={14}/> Simpan
                    </button>
                 </div>
              </div>
            ) : (
              /* MODE VIEW TABLE */
              activeDistributions.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                      <tr>
                        <th className="px-4 py-2">Tanggal</th>
                        <th className="px-4 py-2">Produk</th>
                        <th className="px-4 py-2 text-center">Jml Titip</th>
                        <th className="px-4 py-2 text-right">Estimasi Total</th>
                        <th className="px-4 py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {activeDistributions.map(dist => 
                        dist.distribution_items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                              {new Date(dist.distribution_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                            </td>
                            <td className="px-4 py-2 font-medium text-gray-900">{item.cake_id?.name}</td>
                            <td className="px-4 py-2 text-center">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs">
                                    {item.quantity_sent}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-right text-gray-600">
                              {formatRupiah(item.quantity_sent * item.price_at_distribution)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button 
                                onClick={() => onReconcileItem(item, dist)}
                                className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-100"
                              >
                                Setor
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm flex flex-col items-center">
                    <Package className="mb-2 opacity-50"/>
                    Tidak ada penitipan aktif saat ini.
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* --- BAGIAN 3: DATA RIWAYAT (DROPDOWN) --- */}
      <div className="border-t border-gray-200">
        <button 
          onClick={() => toggleSection('history')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${activeSection === 'history' ? 'bg-green-50/50' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
            <History size={16} className="text-green-500" />
            Riwayat Penjualan & Setoran
            {completedDistributions.length > 0 && (
                <span className="text-xs text-gray-400 font-normal ml-1">({completedDistributions.length} transaksi)</span>
            )}
          </div>
          {/* Cek activeSection */}
          {activeSection === 'history' ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>

        {/* Tampilkan konten HANYA JIKA activeSection === 'history' */}
        {activeSection === 'history' && (
          <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
            {completedDistributions.length > 0 ? (
               <div className="space-y-3">
                 {completedDistributions.map(dist => (
                   <div key={dist.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                          <div>
                             <span className="text-xs text-gray-500 block">Tgl Setor</span>
                             <span className="font-medium text-sm">
                                {new Date(dist.updated_at || dist.distribution_date).toLocaleDateString('id-ID', {
                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                })}
                             </span>
                          </div>
                          <div className="text-right">
                             <span className="text-xs text-gray-500 block">Total Disetor</span>
                             <span className="font-bold text-green-600">
                                {formatRupiah(dist.distribution_items.reduce((acc, i) => acc + (i.total_price || 0), 0))}
                             </span>
                          </div>
                      </div>
                      
                      {/* Item Detail in History */}
                      <div className="space-y-1">
                          {dist.distribution_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-600">
                                  <span>{item.cake_id?.name}</span>
                                  <div className="flex gap-3">
                                      <span className="text-green-600">Laku: {item.quantity_sold}</span>
                                      <span className="text-red-400">Retur: {item.quantity_returned_good + item.quantity_damaged_at_location}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
                <div className="text-center py-6 text-gray-400 text-sm flex flex-col items-center">
                    <History className="mb-2 opacity-50"/>
                    Belum ada riwayat setoran.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}