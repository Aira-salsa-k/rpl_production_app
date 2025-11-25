// import { useState } from 'react';
// import { MapPin, Trash2, RefreshCw, Edit3, History, Package, Filter, PlusCircle, Save, X, Check } from 'lucide-react';
// import { formatRupiah } from '../../utils/formatters';
// import { ROUTES } from '../../utils/constants';
// import { groupDistributionsByKiosk, calculateKioskSummary } from '../../utils/distributionHelpers';

// const DistributionList = ({ 
//   distributions, 
//   kiosks, 
//   cakes, 
//   onReconcileItem,
//   onBulkReconcile,
//   onShowKioskDetail,
//   onToggleKioskStatus,
//   onSaveEdit,
//   filterArea,
//   setFilterArea,
//   filterMonth,
//   setFilterMonth,
//   isSubmitting
// }) => {
//   const [editingDistId, setEditingDistId] = useState(null);
//   const [editItems, setEditItems] = useState([]);
//   const [expandedCards, setExpandedCards] = useState(new Set());

//   const kioskGroups = groupDistributionsByKiosk(distributions)
//     .filter(group => {
//       if (!group.kiosk) return false;
//       if (filterArea !== 'Semua' && group.kiosk.area !== filterArea) return false;
      
//       if (filterMonth) {
//         const hasActiveInMonth = group.activeDistributions?.some(dist => 
//           dist.distribution_date?.substring(0, 7) === filterMonth
//         ) || false;
        
//         const hasCompletedInMonth = group.completedDistributions?.some(dist => 
//           dist.distribution_date?.substring(0, 7) === filterMonth
//         ) || false;
        
//         if (!hasActiveInMonth && !hasCompletedInMonth) return false;
//       }
//       return true;
//     });

//   const handleStartEdit = (dist) => {
//     setEditingDistId(dist.id);
//     const flatItems = dist.distribution_items.map(i => ({
//       id: i.id,
//       cake_id: i.cake_id.id,
//       cake_name: i.cake_id.name,
//       quantity_sent: i.quantity_sent,
//       price_at_distribution: i.price_at_distribution
//     }));
//     setEditItems(flatItems);
//   };

//   const handleCancelEdit = () => {
//     setEditingDistId(null);
//     setEditItems([]);
//   };

//   const handleEditItemChange = (idx, field, value) => {
//     const updated = [...editItems];
//     if (field === 'quantity_sent') {
//       updated[idx][field] = parseInt(value) || 0;
//     } else if (field === 'cake_id') {
//       const selectedCake = cakes.find(c => c.id === value);
//       updated[idx][field] = value;
//       updated[idx].cake_name = selectedCake?.name || '';
//     } else {
//       updated[idx][field] = value;
//     }
//     setEditItems(updated);
//   };

//   const handleRemoveEditItem = (idx) => {
//     const updated = [...editItems];
//     updated.splice(idx, 1);
//     setEditItems(updated);
//   };

//   const handleAddEditItem = () => {
//     setEditItems([...editItems, {
//       id: null,
//       cake_id: '',
//       cake_name: '',
//       quantity_sent: 0,
//       price_at_distribution: 0
//     }]);
//   };

//   const handleSaveEdit = async () => {
//     if (editItems.some(i => !i.cake_id || i.quantity_sent <= 0)) {
//       alert("Pastikan semua item memiliki jenis kue dan jumlah > 0");
//       return;
//     }

//     try {
//       await onSaveEdit(editingDistId, editItems);
//       setEditingDistId(null);
//       setEditItems([]);
//     } catch (error) {
//       console.error('Error saving edit:', error);
//     }
//   };

//   const toggleCardExpand = (distId) => {
//     const newExpanded = new Set(expandedCards);
//     if (newExpanded.has(distId)) {
//       newExpanded.delete(distId);
//     } else {
//       newExpanded.add(distId);
//     }
//     setExpandedCards(newExpanded);
//   };

//   return (
//     <div className="lg:col-span-8 space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-200 gap-3">
//         <div className="flex items-center gap-2 text-gray-600">
//           <Filter size={18} />
//           <span className="font-bold text-sm">Filter:</span>
//         </div>
//         <div className="flex gap-3 w-full sm:w-auto">
//           <input 
//             type="month" 
//             value={filterMonth} 
//             onChange={e => setFilterMonth(e.target.value)} 
//             className="py-2 px-3 border rounded-lg text-sm" 
//           />
//           <select 
//             value={filterArea} 
//             onChange={e => setFilterArea(e.target.value)} 
//             className="px-3 py-2 border rounded-lg text-sm bg-white"
//           >
//             <option value="Semua">Semua Area</option>
//             {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
//           </select>
//         </div>
//       </div>

//       {kioskGroups.map((group) => {
//       const kiosk = group.kiosk;
//       const activeDists = group.activeDistributions || [];
//       const completedDists = group.completedDistributions || [];
//       const summary = calculateKioskSummary(group);
//       const hasActiveItems = summary.hasActive;

//       // Ambil distribusi aktif pertama (asumsi hanya satu distribusi aktif per kiosk)
//       const activeDistribution = activeDists[0];

//       return (
//         <div key={kiosk.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
//           !hasActiveItems ? 'border-green-200 ring-1 ring-green-100 bg-green-50' : 
//           !kiosk?.is_active ? 'border-red-200 ring-1 ring-red-100 bg-red-50' : 
//           'border-l-4 border-l-blue-400 border-gray-200 bg-white'
//         }`}>
            
//             {/* Kiosk Header */}
//             <div className="p-6">
//               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-3">
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wider">
//                       {kiosk?.area}
//                     </span>
//                     <h3 className="font-bold text-xl text-gray-900">
//                       {kiosk?.name}
//                     </h3>
                    
//                     <button
//                       onClick={() => onShowKioskDetail(kiosk)}
//                       className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
//                       title="Lihat detail kios"
//                     >
//                       <MapPin size={16} />
//                       <span>Detail</span>
//                     </button>

//                     {!kiosk?.is_active && (
//                       <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
//                         NON-AKTIF
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className="space-y-2">
//                     <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
//                       {kiosk?.contact_person && (
//                         <span className="flex items-center gap-2">
//                           <span className="bg-gray-100 p-1 rounded">👤</span>
//                           {kiosk.contact_person}
//                         </span>
//                       )}
//                       {kiosk?.phone_number && (
//                         <span className="flex items-center gap-2">
//                           <span className="bg-gray-100 p-1 rounded">📞</span>
//                           {kiosk.phone_number}
//                         </span>
//                       )}
//                     </div>
                    
//                     {kiosk?.address && (
//                       <div className="text-sm text-gray-600 flex items-start gap-2">
//                         <MapPin size={16} className="mt-0.5 flex-shrink-0" />
//                         <span>{kiosk.address}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-4 mt-4">
//                     {hasActiveItems && (
//                       <>
//                         <div className="flex items-center gap-2 text-sm">
//                           <Package size={16} className="text-blue-400" />
//                           <span>{summary.totalActiveItems} item aktif</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <span className="text-blue-600 font-bold">{summary.totalActiveQuantity} pcs</span>
//                           <span className="text-gray-500">titipan</span>
//                         </div>
//                       </>
//                     )}
//                     {summary.hasCompleted && (
//                       <div className="flex items-center gap-2 text-sm">
//                         <History size={16} className="text-green-400" />
//                         <span>{completedDists.length} setoran selesai</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex flex-col items-end gap-3">
//                   {summary.totalCompletedBill > 0 && (
//                     <div className="text-right">
//                       <div className="text-xs uppercase font-semibold text-gray-500 mb-1">
//                         Total Tertagih
//                       </div>
//                       <div className="text-2xl font-bold text-green-600">
//                         {formatRupiah(summary.totalCompletedBill)}
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex gap-2">
//                     {kiosk?.is_active && hasActiveItems && !editingDistId && (
//                       <button 
//                         onClick={() => handleStartEdit(activeDists[0])}
//                         className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition-colors"
//                       >
//                         <Edit3 size={16}/>
//                         Edit Penitipan
//                       </button>
//                     )}
                    
//                     {hasActiveItems && kiosk?.is_active && !editingDistId && (
//                       <button 
//                         onClick={() => onBulkReconcile(activeDists[0])}
//                         disabled={isSubmitting}
//                         className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-green-700 transition-colors disabled:bg-gray-400"
//                       >
//                         <RefreshCw size={16}/> Setor Semua
//                       </button>
//                     )}
//                   </div>

//                   <div className={`px-4 py-2 rounded-lg border ${
//                     !hasActiveItems ? 'bg-green-100 border-green-300 text-green-800' :
//                     !kiosk?.is_active ? 'bg-red-100 border-red-300 text-red-800' :
//                     'bg-blue-100 border-blue-300 text-blue-800'
//                   }`}>
//                     <div className="text-sm font-bold text-center">
//                       {!hasActiveItems ? 'SELESAI' : 
//                       !kiosk?.is_active ? 'NON-AKTIF' : 'AKTIF'}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* EDIT MODE */}
//             {editingDistId && editingDistribution && (
//               <div className="border-y border-yellow-300 bg-yellow-50/50">
//                 <div className="p-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Edit3 size={20} className="text-yellow-600" />
//                     <h4 className="font-semibold text-yellow-800 text-lg">Edit Data Penitipan</h4>
//                     <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
//                       Mode Edit
//                     </span>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="text-gray-600 border-b border-yellow-300">
//                         <tr>
//                           <th className="px-4 py-3 text-left font-semibold bg-yellow-100/50">Jenis Kue</th>
//                           <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Jumlah Titip</th>
//                           <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Harga Satuan</th>
//                           <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Aksi</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {editItems.map((item, idx) => (
//                           <tr 
//                             key={idx} 
//                             className="border-b border-yellow-200/50 hover:bg-yellow-50/30 transition-colors"
//                           >
//                             <td className="px-4 py-3">
//                               {item.id ? (
//                                 <div>
//                                   <span className="font-semibold text-gray-900 block">{item.cake_name}</span>
//                                   <span className="text-xs text-gray-500 mt-1">Data tersimpan</span>
//                                 </div>
//                               ) : (
//                                 <select 
//                                   value={item.cake_id} 
//                                   onChange={(e) => handleEditItemChange(idx, 'cake_id', e.target.value)}
//                                   className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
//                                 >
//                                   <option value="">-- Pilih Jenis Kue --</option>
//                                   {cakes.map(c => (
//                                     <option key={c.id} value={c.id}>{c.name}</option>
//                                   ))}
//                                 </select>
//                               )}
//                             </td>
//                             <td className="px-4 py-3 text-center">
//                               <div className="flex justify-center">
//                                 <input 
//                                   type="number" 
//                                   value={item.quantity_sent}
//                                   onChange={(e) => handleEditItemChange(idx, 'quantity_sent', e.target.value)}
//                                   min="0"
//                                   className="w-24 text-center border border-yellow-300 rounded-lg py-2 px-3 font-bold text-indigo-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
//                                   placeholder="0"
//                                 />
//                               </div>
//                             </td>
//                             <td className="px-4 py-3 text-center text-gray-600">
//                               {formatRupiah(item.price_at_distribution)}
//                             </td>
//                             <td className="px-4 py-3 text-center">
//                               <button 
//                                 onClick={() => handleRemoveEditItem(idx)}
//                                 className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
//                                 title="Hapus item"
//                               >
//                                 <Trash2 size={18}/>
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-yellow-200">
//                     <button 
//                       onClick={handleAddEditItem} 
//                       className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors"
//                     >
//                       <PlusCircle size={18}/> Tambah Jenis Kue Lain
//                     </button>
                    
//                     <div className="flex gap-2">
//                       <button 
//                         onClick={handleCancelEdit}
//                         className="px-4 py-2 text-gray-600 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                       >
//                         <X size={16} className="inline mr-1" />
//                         Batal
//                       </button>
//                       <button 
//                         onClick={handleSaveEdit}
//                         disabled={isSubmitting}
//                         className="px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
//                       >
//                         {isSubmitting ? (
//                           <>
//                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                             Menyimpan...
//                           </>
//                         ) : (
//                           <>
//                             <Save size={16}/>
//                             Simpan Perubahan
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Active Distributions - Hanya tampil jika tidak sedang edit */}
//             {hasActiveItems && !editingDistId && (
//               <div className="border-t">
//                 <div className="p-6">
//                   <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
//                     <Package size={20} />
//                     Penitipan Aktif
//                     <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
//                       {summary.totalActiveItems} item
//                     </span>
//                   </h4>
                  
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 text-gray-600 border-b">
//                         <tr>
//                           <th className="px-6 py-4 font-semibold text-left">Item Kue</th>
//                           <th className="px-6 py-4 font-semibold text-center bg-gray-100">Harga @</th>
//                           <th className="px-6 py-4 font-semibold text-center bg-blue-50 text-blue-700">Titip</th>
//                           <th className="px-6 py-4 font-semibold text-center">Aksi</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {activeDists.flatMap(dist => 
//                           dist.distribution_items.map((item) => (
//                             <tr key={item.id} className="hover:bg-gray-50 transition-colors">
//                               <td className="px-6 py-4">
//                                 <div className="font-semibold text-gray-900">{item.cake_id?.name}</div>
//                                 <div className="text-xs text-gray-500 mt-1">
//                                   Mulai: {new Date(dist.distribution_date).toLocaleDateString('id-ID')}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4 text-center text-gray-500 bg-gray-50">
//                                 {formatRupiah(item.price_at_distribution)}
//                               </td>
//                               <td className="px-6 py-4 text-center font-bold bg-blue-50 text-blue-800">
//                                 {item.quantity_sent}
//                               </td>
//                               <td className="px-6 py-4 text-center">
//                                 <button 
//                                   onClick={() => onReconcileItem(item, dist)} 
//                                   disabled={isSubmitting}
//                                   className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 flex items-center gap-1 mx-auto transition-all disabled:bg-gray-400"
//                                 >
//                                   <RefreshCw size={14}/> Setor
//                                 </button>
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Completed Distributions */}
//             {summary.hasCompleted && (
//               <div className="border-t">
//                 <div className="p-6">
//                   <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
//                     <History size={20} className="text-green-600" />
//                     Riwayat Setoran ({completedDists.length})
//                   </h4>
                  
//                   <div className="space-y-4">
//                     {completedDists.map((dist, index) => {
//                       const totalBill = dist.distribution_items.reduce((sum, item) => 
//                         sum + (item.quantity_sold * item.price_at_distribution), 0
//                       );
                      
//                       return (
//                         <div key={dist.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <span className="font-semibold text-gray-700">
//                                 Setoran {index + 1}
//                               </span>
//                               <span className="text-sm text-gray-500">
//                                 {new Date(dist.distribution_date).toLocaleDateString('id-ID')}
//                               </span>
//                             </div>
//                             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
//                               Total: {formatRupiah(totalBill)}
//                             </span>
//                           </div>
                          
//                           <div className="bg-white rounded-lg border border-green-100 overflow-hidden">
//                             <table className="w-full text-sm">
//                               <thead className="bg-green-100 text-green-900 border-b border-green-200">
//                                 <tr>
//                                   <th className="px-4 py-3 text-left font-semibold">Kue</th>
//                                   <th className="px-4 py-3 text-center font-semibold">Titip</th>
//                                   <th className="px-4 py-3 text-center font-semibold">Laku</th>
//                                   <th className="px-4 py-3 text-center font-semibold">Rusak</th>
//                                   <th className="px-4 py-3 text-right font-semibold">Tagihan</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {dist.distribution_items.map((item) => {
//                                   const itemBill = item.quantity_sold * item.price_at_distribution;
//                                   return (
//                                     <tr key={item.id} className="border-b border-green-50 last:border-b-0">
//                                       <td className="px-4 py-3">
//                                         <div className="font-medium text-gray-900">{item.cake_id?.name}</div>
//                                       </td>
//                                       <td className="px-4 py-3 text-center text-blue-700 font-semibold">
//                                         {item.quantity_sent}
//                                       </td>
//                                       <td className="px-4 py-3 text-center text-green-600 font-semibold">
//                                         {item.quantity_sold}
//                                       </td>
//                                       <td className="px-4 py-3 text-center text-red-500">
//                                         {item.quantity_damaged_at_location}
//                                       </td>
//                                       <td className="px-4 py-3 text-right font-semibold text-gray-800">
//                                         {formatRupiah(itemBill)}
//                                       </td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
       

       

//       {kioskGroups.length === 0 && (
//         <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
//           <Package className="mx-auto text-gray-200 mb-3" size={48}/>
//           <p className="text-gray-400 font-medium">Tidak ada data distribusi.</p>
//           <p className="text-gray-400 text-sm mt-2">
//             {filterArea !== 'Semua' ? `Untuk area ${filterArea}` : ''}
//             {filterMonth ? ` bulan ${filterMonth}` : ''}
//           </p>
//         </div>
//       )}

      
//     </div>
//   );
// };

// export default DistributionList;

import { useState } from 'react';
import { MapPin, Trash2, RefreshCw, Edit3, History, Package, Filter, PlusCircle, Save, X } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { ROUTES } from '../../utils/constants';
import { groupDistributionsByKiosk, calculateKioskSummary } from '../../utils/distributionHelpers';
import DistributionCard from './DistributionCard';

const DistributionList = ({ 
  distributions, 
  kiosks, 
  cakes, 
  onReconcileItem,
  onBulkReconcile,
  onShowKioskDetail,
  onToggleKioskStatus,
  onSaveEdit,
  filterArea,
  setFilterArea,
  filterMonth,
  setFilterMonth,
  isSubmitting
}) => {
  const [editingDistId, setEditingDistId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [kioskTabs, setKioskTabs] = useState({}); // { kioskId: 'active' | 'history' }

  const kioskGroups = groupDistributionsByKiosk(distributions)
    .filter(group => {
      if (!group.kiosk) return false;
      if (filterArea !== 'Semua' && group.kiosk.area !== filterArea) return false;
      
      if (filterMonth) {
        const hasActiveInMonth = group.activeDistributions?.some(dist => 
          dist.distribution_date?.substring(0, 7) === filterMonth
        ) || false;
        
        const hasCompletedInMonth = group.completedDistributions?.some(dist => 
          dist.distribution_date?.substring(0, 7) === filterMonth
        ) || false;
        
        if (!hasActiveInMonth && !hasCompletedInMonth) return false;
      }
      return true;
    });

  // Function to handle tab change for specific kiosk
  const handleKioskTabChange = (kioskId, tab) => {
    setKioskTabs(prev => ({
      ...prev,
      [kioskId]: tab
    }));
  };

  // Get current tab for a kiosk (default to 'active')
  const getKioskTab = (kioskId) => {
    return kioskTabs[kioskId] || 'active';
  };

  const handleStartEdit = (dist) => {
    setEditingDistId(dist.id);
    const flatItems = dist.distribution_items.map(i => ({
      id: i.id,
      cake_id: i.cake_id.id,
      cake_name: i.cake_id.name,
      quantity_sent: i.quantity_sent,
      price_at_distribution: i.price_at_distribution
    }));
    setEditItems(flatItems);
  };

  const handleCancelEdit = () => {
    setEditingDistId(null);
    setEditItems([]);
  };

  const handleEditItemChange = (idx, field, value) => {
    const updated = [...editItems];
    if (field === 'quantity_sent') {
      updated[idx][field] = parseInt(value) || 0;
    } else if (field === 'cake_id') {
      const selectedCake = cakes.find(c => c.id === value);
      updated[idx][field] = value;
      updated[idx].cake_name = selectedCake?.name || '';
    } else {
      updated[idx][field] = value;
    }
    setEditItems(updated);
  };

  const handleRemoveEditItem = (idx) => {
    const updated = [...editItems];
    updated.splice(idx, 1);
    setEditItems(updated);
  };

  const handleAddEditItem = () => {
    setEditItems([...editItems, {
      id: null,
      cake_id: '',
      cake_name: '',
      quantity_sent: 0,
      price_at_distribution: 0
    }]);
  };

  const handleSaveEdit = async () => {
    if (editItems.some(i => !i.cake_id || i.quantity_sent <= 0)) {
      alert("Pastikan semua item memiliki jenis kue dan jumlah > 0");
      return;
    }

    try {
      await onSaveEdit(editingDistId, editItems);
      setEditingDistId(null);
      setEditItems([]);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  return (
    <div className="lg:col-span-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-200 gap-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <span className="font-bold text-sm">Filter:</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <input 
            type="month" 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)} 
            className="py-2 px-3 border rounded-lg text-sm" 
          />
          <select 
            value={filterArea} 
            onChange={e => setFilterArea(e.target.value)} 
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="Semua">Semua Area</option>
            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {kioskGroups.map((group) => {
        const kiosk = group.kiosk;
        const activeDists = group.activeDistributions || [];
        const completedDists = group.completedDistributions || [];
        const summary = calculateKioskSummary(group);
        const hasActiveItems = summary.hasActive;
        
        const currentTab = getKioskTab(kiosk.id);
        const distributionsToShow = currentTab === 'active' ? activeDists : completedDists;
        const hasDataToShow = distributionsToShow.length > 0;

        return (
          <div key={kiosk.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
            !hasActiveItems ? 'border-green-200 ring-1 ring-green-100 bg-green-50' : 
            !kiosk?.is_active ? 'border-red-200 ring-1 ring-red-100 bg-red-50' : 
            'border-l-4 border-stone-200 border-gray-200 bg-white'
          }`}>
            
            {/* Kiosk Header */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">

                    
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-full tracking-wider">
                      {kiosk?.area}
                    </span>
                    <h3 className="font-bold text-xl text-gray-900">
                      {kiosk?.name}
                    </h3>
                    
                    <button
                      onClick={() => onShowKioskDetail(kiosk)}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                      title="Lihat detail kios"
                    >
                      <MapPin size={16} />
                      <span>Detail</span>
                    </button>

                    {!kiosk?.is_active && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                        NON-AKTIF
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {kiosk?.contact_person && (
                        <span className="flex items-center gap-2">
                          <span className="bg-gray-100 p-1 rounded">👤</span>
                          {kiosk.contact_person}
                        </span>
                      )}
                      {kiosk?.phone_number && (
                        <span className="flex items-center gap-2">
                          <span className="bg-gray-100 p-1 rounded">📞</span>
                          {kiosk.phone_number}
                        </span>
                      )}
                    </div>
                    
                    {kiosk?.address && (
                      <div className="text-sm text-gray-600 flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{kiosk.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    {currentTab === 'active' && hasActiveItems && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Package size={16} className="text-stone-400" />
                          <span>{summary.totalActiveItems} penitipan item aktif</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-900 font-bold">{summary.totalActiveQuantity} pcs</span>
                          <span className="text-gray-500">titipan</span>
                        </div>
                      </>
                    )}
                    {currentTab === 'history' && summary.hasCompleted && (
                      <div className="flex items-center gap-2 text-sm">
                        <History size={16} className="text-lime-00" />
                        <span>{completedDists.length} setoran selesai</span>
                      </div>
                    )}
                  </div>
                </div>

               

                <div className="flex flex-col items-end gap-3">
                  {currentTab === 'history' && summary.totalCompletedBill > 0 && (
                    <div className="text-right">
                      <div className="text-xs uppercase font-semibold text-gray-500 mb-1">
                        Total Tertagih
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatRupiah(summary.totalCompletedBill)}
                      </div>
                      
                    </div>
                  )}

                  {currentTab === 'active' && (
                    <div className="flex gap-2">
                        <div className={`px-4 py-2 rounded-lg border ${
                    !hasActiveItems ? 'bg-green-100 border-green-300 text-green-800' :
                    !kiosk?.is_active ? 'bg-red-100 border-red-300 text-red-800' :
                    'bg-lime-100 border-lime-300 text-lime-800'
                  }`}>
                    <div className="text-sm font-bold text-center">
                      {!hasActiveItems ? 'SELESAI' : 
                      !kiosk?.is_active ? 'NON-AKTIF' : 'AKTIF'}
                    </div>
                  </div>

                      {kiosk?.is_active && hasActiveItems && !editingDistId && activeDists.length > 0 && (
                        <button 
                          onClick={() => handleStartEdit(activeDists[0])}
                          className="flex items-center gap-2 bg-stone-400 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-yellow-700 transition-colors"
                        >
                          <Edit3 size={16}/>
                          Edit Penitipan
                        </button>
                      )}
                      
                      {hasActiveItems && kiosk?.is_active && !editingDistId && activeDists.length > 0 && (
                        <button 
                          onClick={() => onBulkReconcile(activeDists[0])}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-amber-600 transition-colors disabled:bg-gray-400"
                        >
                          <RefreshCw size={16}/> Setor Semua
                        </button>
                      )}
                    </div>
                  )}

                  

                  {/* Toggle Tab per Kiosk */}
                  <div className="bg-gray-100 p-1 rounded-lg">


                    <div className="flex">
                      <button
                        onClick={() => handleKioskTabChange(kiosk.id, 'active')}
                        className={`px-3 py-1 text-center font-semibold rounded-md transition-colors text-sm ${
                          currentTab === 'active'
                            ? 'bg-gray-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Package size={14} className="inline mr-1" />
                        Data Penitipan
                      </button>
                      <button
                        onClick={() => handleKioskTabChange(kiosk.id, 'history')}
                        className={`px-3 py-1 text-center font-semibold rounded-md transition-colors text-sm ${
                          currentTab === 'history'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <History size={14} className="inline mr-1" />
                        Riwayat
                      </button>
                    </div>
                  </div>

                 

                </div>
              </div>
            </div>

            {/* EDIT MODE - hanya untuk tab aktif */}
            {currentTab === 'active' && editingDistId && activeDists.find(dist => dist.id === editingDistId) && (
              <div className="border-y border-yellow-300 bg-yellow-50/50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Edit3 size={20} className="text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 text-lg">Edit Data Penitipan</h4>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                      Mode Edit
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-600 border-b border-yellow-300">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold bg-yellow-100/50">Jenis Kue</th>
                          <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Jumlah Titip</th>
                          <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Harga Satuan</th>
                          <th className="px-4 py-3 text-center font-semibold bg-yellow-100/50">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editItems.map((item, idx) => (
                          <tr 
                            key={idx} 
                            className="border-b border-yellow-200/50 hover:bg-yellow-50/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              {item.id ? (
                                <div>
                                  <span className="font-semibold text-gray-900 block">{item.cake_name}</span>
                                  <span className="text-xs text-gray-500 mt-1">Data tersimpan</span>
                                </div>
                              ) : (
                                <select 
                                  value={item.cake_id} 
                                  onChange={(e) => handleEditItemChange(idx, 'cake_id', e.target.value)}
                                  className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                                >
                                  <option value="">-- Pilih Jenis Kue --</option>
                                  {cakes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center">
                                <input 
                                  type="number" 
                                  value={item.quantity_sent}
                                  onChange={(e) => handleEditItemChange(idx, 'quantity_sent', e.target.value)}
                                  min="0"
                                  className="w-24 text-center border border-yellow-300 rounded-lg py-2 px-3 font-bold text-stone-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                                  placeholder="0"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {formatRupiah(item.price_at_distribution)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleRemoveEditItem(idx)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                                title="Hapus item"
                              >
                                <Trash2 size={18}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-yellow-200">
                    <button 
                      onClick={handleAddEditItem} 
                      className="flex items-center gap-2 text-stone-600 font-semibold text-sm hover:text-stone-800 transition-colors"
                    >
                      <PlusCircle size={18}/> Tambah Jenis Kue Lain
                    </button>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-600 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X size={16} className="inline mr-1" />
                        Batal
                      </button>
                      <button 
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-lime-500 text-white font-semibold text-sm rounded-lg hover:bg-lime-800 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={16}/>
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Cards - berdasarkan tab aktif kiosk */}
            {hasDataToShow ? (
              distributionsToShow.map((distribution) => (
                <DistributionCard
                  key={distribution.id}
                  distribution={distribution}
                  onEdit={currentTab === 'active' ? () => handleStartEdit(distribution) : null}
                  onSaveEdit={currentTab === 'active' ? handleSaveEdit : null}
                  onCancelEdit={currentTab === 'active' ? handleCancelEdit : null}
                  onReconcile={currentTab === 'active' ? (item, dist) => onReconcileItem(item, dist) : null}
                  isEditing={currentTab === 'active' && editingDistId === distribution.id}
                  editItems={editItems}
                  onEditItemChange={handleEditItemChange}
                  onRemoveEditItem={handleRemoveEditItem}
                  onAddEditItem={handleAddEditItem}
                  cakes={cakes}
                  showActions={currentTab === 'active'}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 border-t">
                {currentTab === 'active' ? 'Tidak ada data penitipan aktif' : 'Tidak ada data riwayat setoran'}
              </div>
            )}
          </div>
        );
      })}

      {kioskGroups.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Package className="mx-auto text-gray-200 mb-3" size={48}/>
          <p className="text-gray-400 font-medium">Tidak ada data distribusi.</p>
          <p className="text-gray-400 text-sm mt-2">
            {filterArea !== 'Semua' ? `Untuk area ${filterArea}` : ''}
            {filterMonth ? ` bulan ${filterMonth}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default DistributionList;