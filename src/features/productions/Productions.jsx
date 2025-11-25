
// import { useState, useEffect } from 'react';
// import { useStore } from '../../store/appStore';
// import { useAuth } from '../../contexts/AuthContext';

// export default function Productions() {
//   const [productions, setProductions] = useState([]);
//   const [recipes, setRecipes] = useState([]);
//   const [cakes, setCakes] = useState([]);
//   const [ingredients, setIngredients] = useState([]);
//   const [recipeIngredients, setRecipeIngredients] = useState({});
  
//   const [selectedRecipe, setSelectedRecipe] = useState('');
//   const [batchCount, setBatchCount] = useState('');
//   const [expiredDate, setExpiredDate] = useState('');
  
//   // BARU: State loading khusus untuk form submission
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const { 
//     // Kita tidak perlu store di sini karena kita fetch manual
//   } = useStore();
  
//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     fetchData();
//   }, [getSupabaseWithAuth]); // dependensi sudah benar

//   const fetchData = async () => {
//     setLoading(true); // Pastikan loading di set di awal
//     const supabaseClient = getSupabaseWithAuth();
    
//     const [productionsData, recipesData, cakesData, ingredientsData] = await Promise.all([
//       supabaseClient
//         .from('productions')
//         .select(`
//           id, user_id, recipe_id, batch_count, total_output, total_cost, expired_date, production_date,
//           recipe_id (
//             id,
//             batch_yield,
//             cake_id ( name )
//           )
//         `)
//         .order('production_date', { ascending: false }),

//       supabaseClient
//         .from('recipes')
//         .select(`
//           id, user_id, cake_id, batch_yield,
//           cake_id ( name ),
//           recipe_ingredients (
//             quantity_needed,
//             ingredient_id ( id, name, unit )
//           )
//         `),

//       supabaseClient.from('cakes').select('id, user_id, name, price_per_piece, current_stock'),
//       supabaseClient.from('ingredients').select('id, user_id, name, unit, current_stock')
//     ]);


//     if (productionsData.error) console.error('Error fetching productions:', productionsData.error);
//     if (recipesData.error) console.error('Error fetching recipes:', recipesData.error);
//     if (cakesData.error) console.error('Error fetching cakes:', cakesData.error);
//     if (ingredientsData.error) console.error('Error fetching ingredients:', ingredientsData.error);

//     setProductions(productionsData.data || []);
//     setRecipes(recipesData.data || []);
//     setCakes(cakesData.data || []);
//     setIngredients(ingredientsData.data || []);

//     const recipeIngMap = {};
//     recipesData.data?.forEach(recipe => {
//       recipeIngMap[recipe.id] = recipe.recipe_ingredients;
//     });
//     setRecipeIngredients(recipeIngMap);

//     setLoading(false);
//   };

//   // ⛔️ INI FUNGSI YANG BENAR (MENGGUNAKAN RPC) ⛔️
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!selectedRecipe || !batchCount || !expiredDate) {
//       alert('Harap isi semua field');
//       return;
//     }
    
//     setIsSubmitting(true); // Set loading untuk tombol
    
//     try {
//       const supabaseClient = getSupabaseWithAuth();
      
//       // 1. Panggil fungsi 'start_production' di database
//       const { error } = await supabaseClient
//         .rpc('start_production', {
//           recipe_id_input: selectedRecipe,
//           batch_count_input: parseInt(batchCount),
//           expired_date_input: expiredDate
//         });

//       if (error) {
//         // Jika ada error (misal, stok tidak cukup), database akan mengirim pesan
//         throw error;
//       }
      
//       // 2. Jika berhasil, semua data (bahan, kue, produksi) SUDAH di-update di server.
//       alert('Produksi berhasil dicatat!');
      
//       // Reset form
//       setSelectedRecipe('');
//       setBatchCount('');
//       setExpiredDate('');
      
//       // Fetch ulang semua data untuk me-refresh UI
//       await fetchData(); 

//     } catch (error) {
//       console.error('Error recording production:', error);
//       // Tampilkan pesan error dari database (misal "Stok tidak cukup...")
//       alert('Error recording production: ' + error.message);
//     } finally {
//       setIsSubmitting(false); // Selesai loading
//     }
//   };

//   if (loading && !isSubmitting) { 
//     return <div className="p-6">Loading...</div>;
//   }


//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Production Management</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold mb-4">Start New Production Run</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Recipe</label>
//             <select
//               value={selectedRecipe}
//               onChange={(e) => setSelectedRecipe(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             >
//               <option value="">Select a recipe</option>
//               {recipes.map(recipe => (
//                 <option key={recipe.id} value={recipe.id}>
//                   {/* ⛔️ PERBAIKAN #3a: Path data diperbaiki */}
//                   {recipe.cake_id?.name || 'Unknown Cake'} (Yield: {recipe.batch_yield})
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Batch Count</label>
//               <input
//                 type="number"
//                 value={batchCount}
//                 onChange={(e) => setBatchCount(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
//               <input
//                 type="date"
//                 value={expiredDate}
//                 onChange={(e) => setExpiredDate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
//           </div>
          
//           {selectedRecipe && recipeIngredients[selectedRecipe] && (
//             <div className="bg-gray-50 p-4 rounded-md">
//               <h3 className="text-md font-medium text-gray-900 mb-2">Required Ingredients</h3>
//               <ul className="space-y-1">
//                 {recipeIngredients[selectedRecipe].map((ri, idx) => {
//                   const totalRequired = ri.quantity_needed * (parseInt(batchCount) || 0);
//                   // ri.ingredient_id sudah benar (isinya {name: '...', unit: '...'})
//                   return (
//                     <li key={idx} className="flex justify-between">
//                       <span>{ri.ingredient_id?.name}: {ri.quantity_needed} {ri.ingredient_id?.unit} per batch</span>
//                       <span className="font-medium">{totalRequired} {ri.ingredient_id?.unit} total</span>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           )}
          
//           <button
//             type="submit"
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Start Production
//           </button>
//         </form>
//       </div>
      
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <h2 className="text-xl font-semibold p-6">Production Runs</h2>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Count</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {productions.map((production) => (
//                 <tr key={production.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {/* ⛔️ PERBAIKAN #3b: Path data diperbaiki */}
//                     {production.recipe_id?.cake_id?.name || 'Unknown'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(production.production_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.batch_count}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{production.total_output}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {production.total_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(production.expired_date).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
        
//         {productions.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No production runs recorded yet.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
////////////////////versi 2 fix

// import { useState, useEffect } from 'react';
// import { useStore } from '../../store/appStore';
// import { useAuth } from '../../contexts/AuthContext';

// export default function Productions() {
//   const [productions, setProductions] = useState([]);
//   const [recipes, setRecipes] = useState([]);
//   const [ingredients, setIngredients] = useState([]); // Hapus cakes kalau tidak dipakai di UI utama
//   const [recipeIngredients, setRecipeIngredients] = useState({});
  
//   const [selectedRecipe, setSelectedRecipe] = useState('');
//   const [batchCount, setBatchCount] = useState('');
//   const [expiredDate, setExpiredDate] = useState('');
  
//   // STATE BARU: Untuk edit hasil produksi
//   const [actualOutput, setActualOutput] = useState(''); 
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // FITUR PINTAR: Auto-calculate Theoretical Output
//   useEffect(() => {
//     if (selectedRecipe && batchCount && recipes.length > 0) {
//       const recipe = recipes.find(r => r.id === selectedRecipe);
//       if (recipe) {
//         const theoretical = (recipe.batch_yield || 0) * parseInt(batchCount || 0);
//         setActualOutput(theoretical); // Isi default, tapi user bisa ubah
//       }
//     } else {
//       setActualOutput('');
//     }
//   }, [selectedRecipe, batchCount, recipes]);

//   const fetchData = async () => {
//     setLoading(true);
//     const supabaseClient = getSupabaseWithAuth();
    
//     // Fetch data (sama seperti sebelumnya)
//     const [productionsData, recipesData, ingredientsData] = await Promise.all([
//       supabaseClient
//         .from('productions')
//         .select(`
//           id, user_id, recipe_id, batch_count, total_output, total_cost, expired_date, production_date,
//           recipe_id ( id, batch_yield, cake_id ( name ) )
//         `)
//         .order('production_date', { ascending: false }),

//       supabaseClient
//         .from('recipes')
//         .select(`
//           id, cake_id, batch_yield,
//           cake_id ( name ),
//           recipe_ingredients ( quantity_needed, ingredient_id ( id, name, unit ) )
//         `),

//       supabaseClient.from('ingredients').select('id, name, unit, current_stock')
//     ]);

//     setProductions(productionsData.data || []);
//     setRecipes(recipesData.data || []);
//     setIngredients(ingredientsData.data || []);

//     const recipeIngMap = {};
//     recipesData.data?.forEach(recipe => {
//       recipeIngMap[recipe.id] = recipe.recipe_ingredients;
//     });
//     setRecipeIngredients(recipeIngMap);
//     setLoading(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedRecipe || !batchCount || !expiredDate || !actualOutput) {
//       alert('Harap isi semua field');
//       return;
//     }
    
//     setIsSubmitting(true);
//     try {
//       const supabaseClient = getSupabaseWithAuth();
      
//       const { error } = await supabaseClient.rpc('start_production', {
//         recipe_id_input: selectedRecipe,
//         batch_count_input: parseInt(batchCount),
//         expired_date_input: expiredDate,
//         actual_output_input: parseInt(actualOutput) // Kirim angka yang diedit user
//       });

//       if (error) throw error;
      
//       alert('Produksi berhasil! Stok bahan berkurang, stok kue bertambah.');
      
//       // Reset
//       setSelectedRecipe('');
//       setBatchCount('');
//       setActualOutput('');
//       setExpiredDate('');
//       fetchData(); 

//     } catch (error) {
//       console.error('Error:', error);
//       alert('Gagal: ' + error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading data...</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Production</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold mb-4">Input Produksi Baru</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Pilih Resep */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Recipe</label>
//             <select
//               value={selectedRecipe}
//               onChange={(e) => setSelectedRecipe(e.target.value)}
//               className="w-full px-3 py-2 border rounded-md"
//               required
//             >
//               <option value="">Pilih Resep</option>
//               {recipes.map(recipe => (
//                 <option key={recipe.id} value={recipe.id}>
//                   {recipe.cake_id?.name} (Yield: {recipe.batch_yield})
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Input Batch */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Jumlah Batch</label>
//               <input
//                 type="number"
//                 value={batchCount}
//                 onChange={(e) => setBatchCount(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md"
//                 placeholder="Contoh: 2"
//                 required
//               />
//             </div>
            
//             {/* Input Output (Bisa Edit) */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Hasil Jadi (Pcs)</label>
//               <input
//                 type="number"
//                 value={actualOutput}
//                 onChange={(e) => setActualOutput(e.target.value)}
//                 className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-md font-bold text-blue-900"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">Ubah jika hasil beda dari rencana.</p>
//             </div>
            
//             {/* Tanggal Expired */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Tanggal Expired</label>
//               <input
//                 type="date"
//                 value={expiredDate}
//                 onChange={(e) => setExpiredDate(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md"
//                 required
//               />
//             </div>
//           </div>
          
//           {/* List Bahan (Preview) */}
//           {selectedRecipe && recipeIngredients[selectedRecipe] && (
//             <div className="bg-gray-100 p-4 rounded text-sm">
//               <h3 className="font-bold mb-2">Bahan yang akan dikurangi:</h3>
//               <ul className="grid grid-cols-2 gap-2">
//                 {recipeIngredients[selectedRecipe].map((ri, idx) => (
//                   <li key={idx}>
//                     {ri.ingredient_id?.name}: <b>{ri.quantity_needed * (batchCount || 0)} {ri.ingredient_id?.unit}</b>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
          
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-400"
//           >
//             {isSubmitting ? 'Menyimpan...' : 'Simpan Produksi'}
//           </button>
//         </form>
//       </div>

//       {/* Tabel History */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Produksi</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {productions.map((p) => (
//               <tr key={p.id}>
//                 <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                   {p.recipe_id?.cake_id?.name}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                   {new Date(p.production_date).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-500">{p.batch_count}</td>
//                 <td className="px-6 py-4 text-sm font-bold text-gray-700">{p.total_output} pcs</td>
//                 <td className="px-6 py-4 text-sm text-green-600 font-medium">
//                   {/* Format Rupiah */}
//                   {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.total_cost || 0)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Edit2, XCircle } from 'lucide-react'; // Pastikan install lucide-react atau gunakan icon lain

export default function Productions() {
  const [productions, setProductions] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]); 
  const [recipeIngredients, setRecipeIngredients] = useState({});
  
  // Form States
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [batchCount, setBatchCount] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [actualOutput, setActualOutput] = useState(''); 
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null); // Jika null berarti mode tambah baru
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-calculate Theoretical Output (Hanya jalan jika user sedang mengetik, bukan saat load edit)
  useEffect(() => {
    // Kita cek apakah user sedang mengedit field batchCount
    if (selectedRecipe && batchCount && recipes.length > 0) {
      const recipe = recipes.find(r => r.id === selectedRecipe);
      if (recipe) {
        // Hanya update otomatis jika actualOutput kosong atau user sedang mengubah batch
        // Agar angka manual user tidak tertimpa saat edit mode baru aktif
        const theoretical = (recipe.batch_yield || 0) * parseInt(batchCount || 0);
        
        // Logic: Jika ini mode edit, kita jangan timpa nilai actualOutput yang sudah ada di state
        // kecuali user mengubah batchCount
        if (!editingId) {
             setActualOutput(theoretical);
        }
      }
    }
  }, [selectedRecipe, batchCount, recipes, editingId]);

  const fetchData = async () => {
    setLoading(true);
    const supabaseClient = getSupabaseWithAuth();
    
    const [productionsData, recipesData, ingredientsData] = await Promise.all([
      supabaseClient
        .from('productions')
        .select(`
          id, user_id, recipe_id, batch_count, total_output, total_cost, expired_date, production_date,
          recipe_id ( id, batch_yield, cake_id ( name ) )
        `)
        .order('production_date', { ascending: false }),

      supabaseClient
        .from('recipes')
        .select(`
          id, cake_id, batch_yield,
          cake_id ( name ),
          recipe_ingredients ( quantity_needed, ingredient_id ( id, name, unit ) )
        `),

      supabaseClient.from('ingredients').select('id, name, unit, current_stock')
    ]);

    setProductions(productionsData.data || []);
    setRecipes(recipesData.data || []);
    setIngredients(ingredientsData.data || []);

    const recipeIngMap = {};
    recipesData.data?.forEach(recipe => {
      recipeIngMap[recipe.id] = recipe.recipe_ingredients;
    });
    setRecipeIngredients(recipeIngMap);
    setLoading(false);
  };

  // --- LOGIC HAPUS ---
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus? Stok bahan akan dikembalikan dan stok kue dikurangi.')) return;

    try {
      const supabase = getSupabaseWithAuth();
      const { error } = await supabase.rpc('delete_production', { production_id_input: id });
      
      if (error) throw error;
      
      alert('Data dihapus dan stok telah dikembalikan.');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus: ' + error.message);
    }
  };

  // --- LOGIC EDIT (PREPARE) ---
  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setSelectedRecipe(prod.recipe_id.id);
    setBatchCount(prod.batch_count);
    setActualOutput(prod.total_output);
    // Format tanggal untuk input type="date" (YYYY-MM-DD)
    const dateObj = new Date(prod.expired_date);
    setExpiredDate(dateObj.toISOString().split('T')[0]);
    
    // Scroll ke form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRecipe('');
    setBatchCount('');
    setActualOutput('');
    setExpiredDate('');
  };

  // --- SUBMIT (CREATE OR UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipe || !batchCount || !expiredDate || !actualOutput) {
      alert('Harap isi semua field');
      return;
    }
    
    setIsSubmitting(true);
    const supabaseClient = getSupabaseWithAuth();
    
    try {
      // JIKA EDIT: Hapus dulu data lama (Reverse Stock)
      if (editingId) {
        const { error: deleteError } = await supabaseClient.rpc('delete_production', { 
            production_id_input: editingId 
        });
        if (deleteError) throw deleteError;
      }

      // LALU: Buat data baru (Create New)
      const { error: createError } = await supabaseClient.rpc('start_production', {
        recipe_id_input: selectedRecipe,
        batch_count_input: parseInt(batchCount),
        expired_date_input: expiredDate,
        actual_output_input: parseInt(actualOutput)
      });

      if (createError) throw createError;
      
      alert(editingId ? 'Data berhasil diperbarui!' : 'Produksi berhasil dicatat!');
      
      cancelEdit(); // Reset form
      fetchData(); 

    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Produksi</h1>
      
      <div className={`p-6 rounded-lg shadow-md mb-8 ${editingId ? 'bg-yellow-50 border border-yellow-200' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
                {editingId ? 'Edit Data Produksi' : 'Input Produksi Baru'}
            </h2>
            {editingId && (
                <button onClick={cancelEdit} className="text-red-600 flex items-center text-sm hover:underline">
                    <XCircle size={16} className="mr-1"/> Batal Edit
                </button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Resep */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Resep</label>
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Pilih Resep</option>
              {recipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.cake_id?.name} (Menghasilkan: {recipe.batch_yield} pcs per satu adonan)
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah Adonan</label>
              <input
                type="number"
                value={batchCount}
                onChange={(e) => setBatchCount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hasil Produksi Aktual (Pcs)</label>
              <input
                type="number"
                value={actualOutput}
                onChange={(e) => setActualOutput(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 bg-stone-50 rounded-md font-bold text-stone-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Expired</label>
              <input
                type="date"
                value={expiredDate}
                onChange={(e) => setExpiredDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded text-white font-medium ${
                editingId 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-stone-600 hover:bg-stone-700'
            } disabled:bg-gray-400`}
          >
            {isSubmitting ? 'Memproses...' : (editingId ? 'Update Perubahan' : 'Simpan Produksi')}
          </button>
        </form>
      </div>

      {/* Tabel History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Produksi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productions.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {p.recipe_id?.cake_id?.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(p.production_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.batch_count}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{p.total_output} pcs</td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.total_cost || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(p)}
                    className="text-yellow-800 hover:text-yellow-600 mr-3 mx-2"
                    title="Edit"
                  >
                     Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-600 mx-2"
                    title="Hapus"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}