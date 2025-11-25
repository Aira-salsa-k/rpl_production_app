// import { useState, useEffect } from 'react';
// import { useStore } from '../../store/appStore';
// import { useAuth } from '../../contexts/AuthContext';


// const unitConversionMap = {
//   // ======================================================================
//   // Kategori 'g' (gram)
//   // Gunakan unit dasar 'g' di database untuk:
//   // Tepung, Gula Pasir, Gula Halus, Mentega, Baking Soda,
//   // Baking Powder, Vanili (bubuk), Kelapa (parut),
//   // Kacang Hijau, Susu Kental Manis, Sabun Cuci (batang)
//   // ======================================================================
//   g: [
//     { name: 'gram (g)', factor: 1 },
//     { name: 'ons (100g)', factor: 100 },
//     { name: 'kilogram (kg)', factor: 1000 },
//     // Kemasan Spesifik
//     { name: 'bungkus (200g)', factor: 200 }, // e.g., Mentega
//     { name: 'bungkus (250g)', factor: 250 }, // e.g., Kacang Hijau
//     { name: 'bungkus (500g)', factor: 500 }, // e.g., Gula Halus
//     { name: 'kaleng SKM (370g)', factor: 370 },
//     { name: 'botol kecil (45g)', factor: 45 }, // e.g., Baking Powder
//     { name: 'botol sedang (80g)', factor: 80 }, // e.g., Baking Soda
//     { name: 'sak (25kg)', factor: 25000 }, // e.g., Tepung, Gula
//     { name: 'sak (50kg)', factor: 50000 }, // e.g., Tepung, Gula
//   ],

//   // ======================================================================
//   // Kategori 'ml' (mililiter)
//   // Gunakan unit dasar 'ml' di database untuk:
//   // Minyak (Goreng/Tanah), Air Kelapa, Vanili (cair),
//   // Sabun Cuci (cair)
//   // ======================================================================
//   ml: [
//     { name: 'mililiter (ml)', factor: 1 },
//     { name: 'liter (L)', factor: 1000 },
//     // Kemasan Spesifik
//     { name: 'botol vanili (60ml)', factor: 60 },
//     { name: 'pouch sabun (750ml)', factor: 750 },
//     { name: 'gen (5L)', factor: 5000 }, // e.g., Minyak
//   ],

//   // ======================================================================
//   // Kategori 'pcs' (pieces / butir / lembar)
//   // Gunakan unit dasar 'pcs' di database untuk:
//   // Telur, Kelapa (utuh), Kertas Kue (lembaran/cup)
//   // ======================================================================
//   pcs: [
//     { name: 'pcs / butir / lembar', factor: 1 },
//     { name: 'lusin (12 pcs)', factor: 12 },
//     { name: 'tray telur (30 pcs)', factor: 30 },
//     { name: 'pak kertas (50 pcs)', factor: 50 },
//     { name: 'rol kertas (100 pcs)', factor: 100 },
//     { name: 'peti telur (150 pcs)', factor: 150 },
//   ],
// };

// // --- SALIN SAMPAI SINI ---

// export default function Ingredients() {
//   const [ingredientPurchases, setIngredientPurchases] = useState([]);
//   const [name, setName] = useState('');
//   const [unit, setUnit] = useState('');
//   const [currentStock, setCurrentStock] = useState('');
//   const [editingId, setEditingId] = useState(null);
//   const [activeTab, setActiveTab] = useState('ingredients');
  
//   // --- STATE FORM PEMBELIAN YANG DIUBAH ---
//   const [selectedIngredient, setSelectedIngredient] = useState('');
//   const [purchaseQuantity, setPurchaseQuantity] = useState('');
//   const [purchaseUnit, setPurchaseUnit] = useState(''); // BARU: Untuk menyimpan unit pembelian (misal 'kg')
//   const [totalCost, setTotalCost] = useState(''); // UBAH: dari pricePerUnit ke totalCost
//   const [availableUnits, setAvailableUnits] = useState([]); // BARU: Untuk dropdown unit
//   // --- END STATE FORM PEMBELIAN ---


//   const { 
//     ingredients, 
//     loading: { ingredients: loading },
//     fetchIngredients,
//     updateIngredient,
//     addIngredient,
//     deleteIngredient
//   } = useStore();
  
//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     const supabaseClient = getSupabaseWithAuth();
//     fetchIngredients(supabaseClient);
//     fetchPurchases(supabaseClient);
//   }, [fetchIngredients, getSupabaseWithAuth]);

//  const fetchPurchases = async (supabaseClient) => {
//   const { data, error } = await supabaseClient
//     .from('ingredient_purchases')
//     .select(`
//       id,
//       purchase_date,
//       quantity,
//       price_per_unit,
//       total_cost,
//       ingredients(name)
//     `)
//     .order('purchase_date', { ascending: false });

//   if (error) {
//     console.error('Error fetching purchases:', error);
//   } else {
//     setIngredientPurchases(data);
//   }
// };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const supabaseClient = getSupabaseWithAuth();
    
//     if (editingId) {
//       // Update existing ingredient
//       const { error } = await supabaseClient
//         .from('ingredients')
//         .update({ name, unit, current_stock: parseInt(currentStock) })
//         .eq('id', editingId);
        
//       if (error) {
//         console.error('Error updating ingredient:', error);
//       } else {
//         updateIngredient({ id: editingId, name, unit, current_stock: parseInt(currentStock) });
//         setEditingId(null);
//         setName('');
//         setUnit('');
//         setCurrentStock('');
//       }
//     } else {
//       // Create new ingredient
//       const { data, error } = await supabaseClient
//         .from('ingredients')
//         .insert([{ name, unit, current_stock: parseInt(currentStock) }])
//         .select()
//         .single();
        
//       if (error) {
//         console.error('Error adding ingredient:', error);
//       } else {
//         addIngredient(data);
//         setName('');
//         setUnit('');
//         setCurrentStock('');
//       }
//     }
//   };

//   const handleEdit = (ingredient) => {
//     setName(ingredient.name);
//     setUnit(ingredient.unit);
//     setCurrentStock(ingredient.current_stock);
//     setEditingId(ingredient.id);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) return;
    
//     const supabaseClient = getSupabaseWithAuth();
//     const { error } = await supabaseClient
//       .from('ingredients')
//       .delete()
//       .eq('id', id);
      
//     if (error) {
//       console.error('Error deleting ingredient:', error);
//     } else {
//       deleteIngredient(id);
//     }
//   };

//   // BARU: Fungsi helper saat user memilih bahan baku
//   const handleIngredientChange = (ingredientId) => {
//     setSelectedIngredient(ingredientId);
    
//     // Cari bahan baku di state
//     const ingredient = ingredients.find(ing => ing.id === ingredientId);
    
//     if (ingredient) {
//       // Dapatkan unit dasar (misal 'g', 'ml')
//       const baseUnit = ingredient.unit; 
      
//       // Cek di map konversi kita, unit apa saja yang tersedia
//       const units = unitConversionMap[baseUnit] || [{ name: baseUnit, factor: 1 }];
      
//       setAvailableUnits(units); // Set state untuk dropdown baru
//       setPurchaseUnit(units[0].factor); // Otomatis pilih unit pertama (biasanya unit dasar)
//     } else {
//       setAvailableUnits([]);
//       setPurchaseUnit('');
//     }
//   };


//   // UBAH TOTAL: Ini adalah inti logikanya
//   const handlePurchaseSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedIngredient || !purchaseQuantity || !purchaseUnit || !totalCost) {
//       alert('Harap isi semua field pembelian');
//       return;
//     }
    
//     try {
//       const supabaseClient = getSupabaseWithAuth();

//       // --- INI DIA LOGIKA KONVERSINYA ---
//       const quantity = parseInt(purchaseQuantity);
//       const cost = parseFloat(totalCost);
//       const conversionFactor = parseFloat(purchaseUnit); // 'purchaseUnit' kini menyimpan faktor (misal 1000 untuk 'kg')
      
//       // Hitung semuanya ke unit dasar
//       const quantityInBaseUnit = quantity * conversionFactor;
//       const pricePerBaseUnit = cost / quantityInBaseUnit;
//       // --- SELESAI KONVERSI ---
      
//       // 1. Insert ke catatan pembelian
//       const { error: purchaseError } = await supabaseClient
//         .from('ingredient_purchases')
//         .insert([{
//           ingredient_id: selectedIngredient,
//           quantity: quantityInBaseUnit,       // Kirim yang sudah dikonversi
//           price_per_unit: pricePerBaseUnit, // Kirim yang sudah dikonversi
//           total_cost: cost
//         }]);
        
//       if (purchaseError) throw purchaseError;
      
//       // 2. Update stok di tabel ingredients
//       const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
//       const newStock = (ingredient?.current_stock || 0) + quantityInBaseUnit; // Tambahkan stok yang sudah dikonversi
      
//       const { error: updateError } = await supabaseClient
//         .from('ingredients')
//         .update({ current_stock: newStock })
//         .eq('id', selectedIngredient);
        
//       if (updateError) throw updateError;
      
//       // 3. Update state lokal
//       updateIngredient({ ...ingredient, current_stock: newStock });
      
//       // 4. Reset form
//       setSelectedIngredient('');
//       setPurchaseQuantity('');
//       setPurchaseUnit('');
//       setTotalCost('');
//       setAvailableUnits([]);
//       fetchPurchases(supabaseClient); // Refresh daftar pembelian

//     } catch (error) {
//       console.error('Error recording purchase:', error);
//       alert('Error recording purchase: ' + error.message);
//     }
//   };

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Bahan Baku</h1>
      
//       <div className="mb-6 border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8">
//           <button
//             onClick={() => setActiveTab('ingredients')}
//             className={`${
//               activeTab === 'ingredients'
//                 ? 'border-indigo-500 text-indigo-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//           >
//             Bahan Baku
//           </button>
//           <button
//             onClick={() => setActiveTab('purchases')}
//             className={`${
//               activeTab === 'purchases'
//                 ? 'border-indigo-500 text-indigo-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//           >
//             Log Pembelian Bahan Baku
//           </button>
//         </nav>
//       </div>
      
//       {activeTab === 'ingredients' && (
//         <>
//           <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//             <h2 className="text-xl font-semibold mb-4">
//               {editingId ? 'Edit Bahan Baku' : 'Tambah Data Bahan Baku'}
//             </h2>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan Baku</label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
//                 <input
//                   type="text"
//                   value={unit}
//                   onChange={(e) => setUnit(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Stok saat ini</label>
//                 <input
//                   type="number"
//                   value={currentStock}
//                   onChange={(e) => setCurrentStock(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   required
//                 />
//               </div>
              
//               <button
//                 type="submit"
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 {editingId ? 'Perbarui Bahan Baku' : 'Tambah Bahan Baku'}
//               </button>
              
//               {editingId && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setEditingId(null);
//                     setName('');
//                     setUnit('');
//                     setCurrentStock('');
//                   }}
//                   className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </form>
//           </div>
          
//           <div className="bg-white shadow-md rounded-lg overflow-hidden">
//             <h2 className="text-xl font-semibold p-6">List Data Bahan Baku</h2>
            
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan Baku</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
//                     <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {ingredients.map((ingredient) => (
//                     <tr key={ingredient.id}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.unit}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.current_stock}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <button
//                           onClick={() => handleEdit(ingredient)}
//                           className="text-indigo-600 hover:text-indigo-900 mr-3"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(ingredient.id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
            
//             {ingredients.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 No ingredients found. Add an ingredient to get started.
//               </div>
//             )}
//           </div>
//         </>
//       )}
      
//       {activeTab === 'purchases' && (
//         <div className="space-y-8">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-4">Input Data Pembelian Bahan Baku</h2>
            
//             {/* UBAH: onSubmit menunjuk ke fungsi baru */}
//             <form onSubmit={handlePurchaseSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bahan Baku</label>
//                 <select
//                   value={selectedIngredient}
//                   // UBAH: Gunakan handler baru kita
//                   onChange={(e) => handleIngredientChange(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   required
//                 >
//                   <option value="">Pilih Bahan Baku</option>
//                   {ingredients.map(ingredient => (
//                     // Tampilkan unit dasar agar user tidak bingung
//                     <option key={ingredient.id} value={ingredient.id}>
//                       {ingredient.name} ({ingredient.unit})
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               {/* UBAH: Grid sekarang 3 kolom */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Kuantitas Pembelian</label>
//                   <input
//                     type="number"
//                     value={purchaseQuantity}
//                     onChange={(e) => setPurchaseQuantity(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                     placeholder="1" 
//                   />
//                 </div>
                
//                 {/* BARU: Dropdown untuk Unit Pembelian */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Pembelian</label>
//                   <select
//                     value={purchaseUnit}
//                     onChange={(e) => setPurchaseUnit(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                     disabled={!selectedIngredient} // Tidak bisa diklik sebelum pilih bahan
//                   >
//                     <option value="">Pilih Satuan</option>
//                     {availableUnits.map(unit => (
//                       // Value-nya adalah FAKTOR KONVERSI, bukan namanya
//                       <option key={unit.name} value={unit.factor}>
//                         {unit.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* UBAH: Input untuk Total Biaya */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1"> Harga Bahan Baku ( per Satuan yang dipilih )</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={totalCost}
//                     onChange={(e) => setTotalCost(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                     placeholder="Rp. 250000"
//                   />
//                 </div>
//               </div>
              
//               <button
//                 type="submit"
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Tambah Data Pembelian Bahan Baku
//               </button>
//             </form>
//           </div>
          
//           <div className="bg-white shadow-md rounded-lg overflow-hidden">
//             <h2 className="text-xl font-semibold p-6">Log Pembelian Bahan Baku</h2>
            
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan Baku</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Per Satuan</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Bahan Baku</th>
//                     <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {ingredientPurchases.map((purchase) => (
//                     <tr key={purchase.id}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                        {purchase.ingredients?.name || 'Unknown'}

//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {new Date(purchase.purchase_date).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.quantity}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {purchase.price_per_unit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {purchase.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <button
//                           onClick={() => handleEdit(ingredient)}
//                           className="text-indigo-600 hover:text-indigo-900 mr-3"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(ingredient.id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
            
//             {ingredientPurchases.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 No purchase logs found.
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

const unitConversionMap = {
  g: [
    { name: 'gram (g)', factor: 1 },
    { name: 'ons (100g)', factor: 100 },
    { name: 'kilogram (kg)', factor: 1000 },
    { name: 'bungkus (200g)', factor: 200 },
    { name: 'bungkus (250g)', factor: 250 },
    { name: 'bungkus (500g)', factor: 500 },
    { name: 'kaleng SKM (370g)', factor: 370 },
    { name: 'botol kecil (45g)', factor: 45 },
    { name: 'botol sedang (80g)', factor: 80 },
    { name: 'sak (25kg)', factor: 25000 },
    { name: 'sak (50kg)', factor: 50000 },
  ],
  ml: [
    { name: 'mililiter (ml)', factor: 1 },
    { name: 'liter (L)', factor: 1000 },
    { name: 'botol vanili (60ml)', factor: 60 },
    { name: 'pouch sabun (750ml)', factor: 750 },
    { name: 'gen (5L)', factor: 5000 },
  ],
  pcs: [
    { name: 'pcs / butir / lembar', factor: 1 },
    { name: 'lusin (12 pcs)', factor: 12 },
    { name: 'tray telur (30 pcs)', factor: 30 },
    { name: 'pak kertas (50 pcs)', factor: 50 },
    { name: 'rol kertas (100 pcs)', factor: 100 },
    { name: 'peti telur (150 pcs)', factor: 150 },
  ],
};

export default function Ingredients() {
  const [ingredientPurchases, setIngredientPurchases] = useState([]);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [availableUnits, setAvailableUnits] = useState([]);

  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [originalPurchaseData, setOriginalPurchaseData] = useState(null);

  const { 
    ingredients, 
    loading: { ingredients: loading },
    fetchIngredients,
    updateIngredient,
    addIngredient,
    deleteIngredient
  } = useStore();
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    const supabaseClient = getSupabaseWithAuth();
    fetchIngredients(supabaseClient);
    fetchPurchases(supabaseClient);
  }, [fetchIngredients, getSupabaseWithAuth]);

  // FUNGSI UNTUK MENGAMBIL DATA PEMBELIAN
  const fetchPurchases = async (supabaseClient) => {
    const { data, error } = await supabaseClient
      .from('ingredient_purchases')
      .select(`
        id,
        purchase_date,
        quantity,
        price_per_unit,
        total_cost,
        ingredient_id,
        ingredients(name, unit)
      `)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
    } else {
      setIngredientPurchases(data);
    }
  };

  // FUNGSI UNTUK BAHAN BAKU
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const supabaseClient = getSupabaseWithAuth();
    
    if (editingId) {
      const { error } = await supabaseClient
        .from('ingredients')
        .update({ name, unit, current_stock: parseInt(currentStock) })
        .eq('id', editingId);
        
      if (error) {
        console.error('Error updating ingredient:', error);
      } else {
        updateIngredient({ id: editingId, name, unit, current_stock: parseInt(currentStock) });
        resetIngredientForm();
      }
    } else {
      const { data, error } = await supabaseClient
        .from('ingredients')
        .insert([{ name, unit, current_stock: parseInt(currentStock) }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding ingredient:', error);
      } else {
        addIngredient(data);
        resetIngredientForm();
      }
    }
  };

  const resetIngredientForm = () => {
    setEditingId(null);
    setName('');
    setUnit('');
    setCurrentStock('');
  };

  const handleEdit = (ingredient) => {
    setName(ingredient.name);
    setUnit(ingredient.unit);
    setCurrentStock(ingredient.current_stock);
    setEditingId(ingredient.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) return;
    
    const supabaseClient = getSupabaseWithAuth();
    const { error } = await supabaseClient
      .from('ingredients')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting ingredient:', error);
    } else {
      deleteIngredient(id);
    }
  };

  // FUNGSI UNTUK PEMBELIAN - EDIT
  const handleEditPurchase = (purchase) => {
    setEditingPurchaseId(purchase.id);
    setSelectedIngredient(purchase.ingredient_id);
    setTotalCost(purchase.total_cost);
    
    // Simpan data asli untuk perhitungan stok nanti
    setOriginalPurchaseData({
      quantity: purchase.quantity,
      ingredient_id: purchase.ingredient_id
    });

    // Set quantity dan unit berdasarkan konversi
    const ingredient = ingredients.find(ing => ing.id === purchase.ingredient_id);
    if (ingredient) {
      const baseUnit = ingredient.unit;
      const units = unitConversionMap[baseUnit] || [{ name: baseUnit, factor: 1 }];
      setAvailableUnits(units);
      
      // Cari unit yang sesuai dengan quantity
      const matchingUnit = units.find(u => purchase.quantity % u.factor === 0) || units[0];
      setPurchaseUnit(matchingUnit.factor.toString());
      setPurchaseQuantity((purchase.quantity / matchingUnit.factor).toString());
    }
  };

  // FUNGSI UNTUK PEMBELIAN - HAPUS
  const handleDeletePurchase = async (purchase) => {
    if (!window.confirm('Are you sure you want to delete this purchase record? This will also adjust the stock.')) return;
    
    try {
      const supabaseClient = getSupabaseWithAuth();

      // 1. Kurangi stok di tabel ingredients
      const ingredient = ingredients.find(ing => ing.id === purchase.ingredient_id);
      const newStock = (ingredient?.current_stock || 0) - purchase.quantity;
      
      const { error: updateError } = await supabaseClient
        .from('ingredients')
        .update({ current_stock: Math.max(0, newStock) }) // Pastikan stok tidak negatif
        .eq('id', purchase.ingredient_id);
        
      if (updateError) throw updateError;

      // 2. Hapus catatan pembelian
      const { error: deleteError } = await supabaseClient
        .from('ingredient_purchases')
        .delete()
        .eq('id', purchase.id);
        
      if (deleteError) throw deleteError;

      // 3. Update state lokal
      updateIngredient({ ...ingredient, current_stock: newStock });
      fetchPurchases(supabaseClient);

      alert('Purchase record deleted successfully!');

    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Error deleting purchase: ' + error.message);
    }
  };

  // FUNGSI UNTUK PEMBELIAN - PILIH BAHAN BAKU
  const handleIngredientChange = (ingredientId) => {
    setSelectedIngredient(ingredientId);
    
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    
    if (ingredient) {
      const baseUnit = ingredient.unit;
      const units = unitConversionMap[baseUnit] || [{ name: baseUnit, factor: 1 }];
      setAvailableUnits(units);
      setPurchaseUnit(units[0].factor.toString());
    } else {
      setAvailableUnits([]);
      setPurchaseUnit('');
    }
  };

  // FUNGSI UNTUK PEMBELIAN - SUBMIT (TAMBAH & EDIT)
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedIngredient || !purchaseQuantity || !purchaseUnit || !totalCost) {
      alert('Harap isi semua field pembelian');
      return;
    }
    
    try {
      const supabaseClient = getSupabaseWithAuth();

      const quantity = parseFloat(purchaseQuantity);
      const cost = parseFloat(totalCost);
      const conversionFactor = parseFloat(purchaseUnit);
      
      const quantityInBaseUnit = quantity * conversionFactor;
      const pricePerBaseUnit = cost / quantityInBaseUnit;

      if (editingPurchaseId) {
        // MODE EDIT: Update pembelian yang sudah ada
        await handlePurchaseUpdate(
          supabaseClient, 
          quantityInBaseUnit, 
          pricePerBaseUnit, 
          cost
        );
      } else {
        // MODE TAMBAH: Buat pembelian baru
        await handlePurchaseCreate(
          supabaseClient,
          quantityInBaseUnit,
          pricePerBaseUnit,
          cost
        );
      }
      
      // Reset form dan refresh data
      resetPurchaseForm();
      fetchPurchases(supabaseClient);

    } catch (error) {
      console.error('Error recording purchase:', error);
      alert('Error recording purchase: ' + error.message);
    }
  };

  // FUNGSI BANTU: UPDATE PEMBELIAN
  const handlePurchaseUpdate = async (supabaseClient, quantityInBaseUnit, pricePerBaseUnit, cost) => {
    // 1. Hitung selisih stok
    const stockDifference = quantityInBaseUnit - originalPurchaseData.quantity;
    
    // 2. Update stok di tabel ingredients
    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    let newStock = ingredient.current_stock;
    
    // Jika bahan baku berbeda, kurangi stok dari bahan lama dan tambah ke bahan baru
    if (selectedIngredient !== originalPurchaseData.ingredient_id) {
      // Kurangi stok dari bahan lama
      const oldIngredient = ingredients.find(ing => ing.id === originalPurchaseData.ingredient_id);
      const oldIngredientNewStock = (oldIngredient?.current_stock || 0) - originalPurchaseData.quantity;
      
      await supabaseClient
        .from('ingredients')
        .update({ current_stock: Math.max(0, oldIngredientNewStock) })
        .eq('id', originalPurchaseData.ingredient_id);
        
      updateIngredient({ ...oldIngredient, current_stock: oldIngredientNewStock });
      
      // Tambah stok ke bahan baru
      newStock = (ingredient?.current_stock || 0) + quantityInBaseUnit;
    } else {
      // Bahan baku sama, sesuaikan stok dengan selisih
      newStock = (ingredient?.current_stock || 0) + stockDifference;
    }
    
    await supabaseClient
      .from('ingredients')
      .update({ current_stock: Math.max(0, newStock) })
      .eq('id', selectedIngredient);
      
    updateIngredient({ ...ingredient, current_stock: newStock });

    // 3. Update data pembelian
    const { error: updateError } = await supabaseClient
      .from('ingredient_purchases')
      .update({
        ingredient_id: selectedIngredient,
        quantity: quantityInBaseUnit,
        price_per_unit: pricePerBaseUnit,
        total_cost: cost
      })
      .eq('id', editingPurchaseId);
      
    if (updateError) throw updateError;

    alert('Purchase updated successfully!');
  };

  // FUNGSI BANTU: BUAT PEMBELIAN BARU
  const handlePurchaseCreate = async (supabaseClient, quantityInBaseUnit, pricePerBaseUnit, cost) => {
    // 1. Insert ke catatan pembelian
    const { error: purchaseError } = await supabaseClient
      .from('ingredient_purchases')
      .insert([{
        ingredient_id: selectedIngredient,
        quantity: quantityInBaseUnit,
        price_per_unit: pricePerBaseUnit,
        total_cost: cost
      }]);
      
    if (purchaseError) throw purchaseError;
    
    // 2. Update stok di tabel ingredients
    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    const newStock = (ingredient?.current_stock || 0) + quantityInBaseUnit;
    
    const { error: updateError } = await supabaseClient
      .from('ingredients')
      .update({ current_stock: newStock })
      .eq('id', selectedIngredient);
      
    if (updateError) throw updateError;
    
    updateIngredient({ ...ingredient, current_stock: newStock });
    
    alert('Purchase recorded successfully!');
  };

  // FUNGSI BANTU: RESET FORM PEMBELIAN
  const resetPurchaseForm = () => {
    setSelectedIngredient('');
    setPurchaseQuantity('');
    setPurchaseUnit('');
    setTotalCost('');
    setAvailableUnits([]);
    setEditingPurchaseId(null);
    setOriginalPurchaseData(null);
  };

  // FUNGSI BANTU: BATAL EDIT PEMBELIAN
  const cancelEditPurchase = () => {
    resetPurchaseForm();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Bahan Baku</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`${
              activeTab === 'ingredients'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Bahan Baku
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`${
              activeTab === 'purchases'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Log Pembelian Bahan Baku
          </button>
        </nav>
      </div>
      
      {activeTab === 'ingredients' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Bahan Baku' : 'Tambah Data Bahan Baku'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok saat ini</label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
              >
                {editingId ? 'Perbarui Bahan Baku' : 'Tambah Bahan Baku'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetIngredientForm}
                  className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-6">List Data Bahan Baku</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan Baku</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.current_stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="text-yellow-800 hover:text-yellow-600 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {ingredients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No ingredients found. Add an ingredient to get started.
              </div>
            )}
          </div>
        </>
      )}
      
      {activeTab === 'purchases' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingPurchaseId ? 'Edit Data Pembelian Bahan Baku' : 'Input Data Pembelian Bahan Baku'}
            </h2>
            
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahan Baku</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                  required
                >
                  <option value="">Pilih Bahan Baku</option>
                  {ingredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuantitas Pembelian</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                    required
                    placeholder="1" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan Pembelian</label>
                  <select
                    value={purchaseUnit}
                    onChange={(e) => setPurchaseUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                    required
                    disabled={!selectedIngredient}
                  >
                    <option value="">Pilih Satuan</option>
                    {availableUnits.map(unit => (
                      <option key={unit.name} value={unit.factor}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingPurchaseId ? 'Total Harga Pembelian' : 'Total Harga'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500"
                    required
                    placeholder="250000"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                >
                  {editingPurchaseId ? 'Perbarui Pembelian' : 'Tambah Data Pembelian'}
                </button>
                
                {editingPurchaseId && (
                  <button
                    type="button"
                    onClick={cancelEditPurchase}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-6">Log Pembelian Bahan Baku</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Bahan Baku</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Per Satuan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredientPurchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.ingredients?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.purchase_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.quantity} {purchase.ingredients?.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.price_per_unit?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditPurchase(purchase)}
                          className="text-yellow-800 hover:text-yellow-600 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(purchase)}
                          className="text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {ingredientPurchases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No purchase logs found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}