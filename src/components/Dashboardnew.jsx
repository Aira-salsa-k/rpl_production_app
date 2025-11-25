// // pages/Dashboard.jsx
// import { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { ArrowUpRight, ArrowDownRight, Box, DollarSign, AlertTriangle, Truck } from 'lucide-react';

// // Helper Currency
// const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// export default function Dashboard() {
//   // State Data (Sama seperti logic sebelumnya)
//   const [stats, setStats] = useState({
//     prodToday: 0,
//     prodMonth: 0,
//     damagedMonth: 0,
//     profitLoss: 0,
//   });
//   const [lowStockItems, setLowStockItems] = useState([]);
//   const [cakeStock, setCakeStock] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     // ... (LOGIC FETCH DATA ANDA TETAP SAMA SEPERTI SEBELUMNYA) ...
//     // Di sini saya simulasikan data agar tampilan terlihat
//     setLoading(false); 
//     // Hapus baris di bawah ini jika data backend sudah connect
//     setStats({ prodToday: 120, prodMonth: 45700, damagedMonth: 87, profitLoss: 15800000 });
//     setLowStockItems([{name: 'Tepung', stock: 5, unit: 'kg'}, {name: 'Gula', stock: 2, unit: 'kg'}]);
//     setCakeStock([{name: 'Cake Classic', stock: 600}, {name: 'Brownies', stock: 550}]);
//   };

//   if (loading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="max-w-7xl mx-auto">
      
//       {/* === BAGIAN 1: KPI CARDS === */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
//         {/* Card 1: Total Produksi */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Total Produksi</p>
//               <h3 className="text-2xl font-bold text-gray-900">{stats.prodMonth.toLocaleString()}</h3>
//               <div className="flex items-center mt-1 text-sm text-green-600">
//                 <ArrowUpRight size={16} className="mr-1" />
//                 <span>+8.5% dr bulan lalu</span>
//               </div>
//             </div>
//             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
//               <Box size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 2: Laba Kotor (Profit) */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Est. Keuntungan</p>
//               <h3 className="text-2xl font-bold text-gray-900">{formatIDR(stats.profitLoss)}</h3>
//               <div className="flex items-center mt-1 text-sm text-green-600">
//                 <ArrowUpRight size={16} className="mr-1" />
//                 <span>+2.1%</span>
//               </div>
//             </div>
//             <div className="p-2 bg-green-50 rounded-lg text-green-600">
//               <DollarSign size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 3: Bahan Kritis (Custom Widget) */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
//            <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Stok Bahan Kritis</p>
//               <h3 className="text-2xl font-bold text-gray-900">{lowStockItems.length} Item</h3>
//               <div className="flex items-center mt-1 text-sm text-yellow-600">
//                 <AlertTriangle size={16} className="mr-1" />
//                 <span>Perlu restock segera</span>
//               </div>
//             </div>
//             <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
//               <AlertTriangle size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 4: Kue Rusak */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Kue Rusak</p>
//               <h3 className="text-2xl font-bold text-gray-900">{stats.damagedMonth} pcs</h3>
//               <div className="flex items-center mt-1 text-sm text-red-600">
//                 <ArrowDownRight size={16} className="mr-1" />
//                 <span>Naik 5 pcs</span>
//               </div>
//             </div>
//             <div className="p-2 bg-red-50 rounded-lg text-red-600">
//               <Box size={24} /> 
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* === BAGIAN 2: CHART AREA & LIST (GRID) === */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
//         {/* Panel Kiri: Detail Stok Bahan Menipis */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h5 className="text-lg font-semibold text-gray-800 mb-4">Data Stok Bahan Kritis</h5>
//           {lowStockItems.length > 0 ? (
//             <div className="space-y-4">
//                {lowStockItems.map((item, idx) => (
//                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
//                     <span className="font-medium text-gray-700">{item.name}</span>
//                     <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
//                       Sisa: {item.stock || item.current_stock} {item.unit}
//                     </span>
//                  </div>
//                ))}
//             </div>
//           ) : (
//             <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
//               Stok Aman
//             </div>
//           )}
//           <p className="text-xs text-gray-500 mt-4">Menampilkan bahan dengan stok di bawah batas aman.</p>
//         </div>

//         {/* Panel Kanan: Distribusi */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h5 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Area (Bulan Ini)</h5>
//           <ul className="divide-y divide-gray-100">
//             <li className="py-3 flex justify-between items-center">
//               <span className="flex items-center text-gray-600"><Truck size={16} className="mr-2"/> Area Arso</span>
//               <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs font-medium">12.500 pcs</span>
//             </li>
//             <li className="py-3 flex justify-between items-center">
//               <span className="flex items-center text-gray-600"><Truck size={16} className="mr-2"/> Area Koya</span>
//               <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs font-medium">10.900 pcs</span>
//             </li>
//              <li className="py-3 flex justify-between items-center">
//               <span className="flex items-center text-gray-600"><Truck size={16} className="mr-2"/> Area Sentani</span>
//               <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs font-medium">9.800 pcs</span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* === BAGIAN 3: TABEL STOK KUE === */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-gray-100">
//           <h5 className="text-lg font-semibold text-gray-800">Stok Kue Saat Ini (Ringkasan)</h5>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-gray-600">
//             <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Nama Kue</th>
//                 <th className="px-6 py-4">Stok Gudang</th>
//                 <th className="px-6 py-4">Total Resep</th>
//                 <th className="px-6 py-4">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {cakeStock.map((cake, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 font-medium text-gray-900">{cake.name}</td>
//                   <td className="px-6 py-4">{cake.stock || cake.current_stock} Pcs</td>
//                   <td className="px-6 py-4">1 Variant</td>
//                   <td className="px-6 py-4">
//                     <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
//                       Available
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// }

//////////////////////////////////////////////
// pages/Dashboard.jsx
// import { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { 
//   ArrowUpRight, ArrowDownRight, Box, DollarSign, 
//   AlertTriangle, Truck 
// } from 'lucide-react';

// // Helper Currency
// const formatIDR = (num) =>
//   new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//   }).format(num);

// export default function Dashboard() {

//   // === STATE PEMBERSIHAN TYPO ===
//   const [stats, setStats] = useState({
//     prodToday: 0,
//     prodMonth: 0,
//     damagedMonth: 0,
//     profitLoss: 0,
//   });

//   const [lowStockItems, setLowStockItems] = useState([]);
//   const [cakeStock, setCakeStock] = useState([]);
//   const [distributionStats, setDistributionStats] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const { getSupabaseWithAuth } = useAuth();

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     const supabase = getSupabaseWithAuth();

//     // === RANGE WAKTU ===
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

//     try {
//       // === QUERY SUPABASE ===
//       const [
//         productionsData,
//         distributionsData,
//         cakesData,
//         ingredientsData
//       ] = await Promise.all([
//         supabase.from('productions')
//           .select('*')
//           .gte('production_date', startOfMonth)
//           .lte('production_date', endOfMonth),

//         supabase.from('distributions')
//           .select(`
//             *,
//             distribution_items (
//               quantity_sent,
//               quantity_sold,
//               quantity_damaged_at_location,
//               cake_id (price_per_piece)
//             )
//           `)
//           .gte('created_at', startOfMonth)
//           .lte('created_at', endOfMonth),

//         supabase.from('cakes')
//           .select('*')
//           .order('current_stock', { ascending: true })
//           .limit(10),

//         supabase.from('ingredients')
//           .select('*')
//           .lte('current_stock', 50)
//       ]);

//       if (productionsData.error) throw productionsData.error;
//       if (distributionsData.error) throw distributionsData.error;
//       if (cakesData.error) throw cakesData.error;
//       if (ingredientsData.error) throw ingredientsData.error;

//       // === DATA ===
//       const prods = productionsData.data || [];
//       const dists = distributionsData.data || [];

//       // == 1. PRODUKSI BULANAN ==
//       const prodMonth = prods.reduce(
//         (sum, p) => sum + (p.total_output || 0),
//         0
//       );

//       const totalCostMonth = prods.reduce(
//         (sum, p) => sum + (p.total_cost || 0),
//         0
//       );

//       // == PRODUKSI HARI INI ==
//       const prodToday = prods
//         .filter((p) => p.production_date >= startOfToday)
//         .reduce((sum, p) => sum + (p.total_output || 0), 0);

//       // == 2. DISTRIBUSI ==
//       let damagedMonth = 0;
//       let totalRevenueMonth = 0;
//       const locStatsMap = {};

//       dists.forEach((d) => {
//         d.distribution_items.forEach((item) => {
//           // Rusak
//           damagedMonth += item.quantity_damaged_at_location || 0;

//           // Revenue = Sold * Price
//           const price = item.cake_id?.price_per_piece || 0;
//           totalRevenueMonth += (item.quantity_sold || 0) * price;

//           // Group lokasi
//           if (!locStatsMap[d.location]) locStatsMap[d.location] = 0;
//           locStatsMap[d.location] += item.quantity_sent || 0;
//         });
//       });

//       // == 3. PROFIT/LOSS ==
//       const profitLoss = totalRevenueMonth - totalCostMonth;

//       // == 4. LIST LOKASI (TOP 5) ==
//       const locationStatsArray = Object.entries(locStatsMap)
//         .map(([name, count]) => ({ name, count }))
//         .sort((a, b) => b.count - a.count)
//         .slice(0, 5);

//       // === SET STATE ===
//       setStats({
//         prodToday,
//         prodMonth,
//         damagedMonth,
//         profitLoss,
//       });

//       setLowStockItems(ingredientsData.data || []);
//       setCakeStock(cakesData.data || []);
//       setDistributionStats(locationStatsArray);

//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // === LOADING ===
//   if (loading) return <div className="p-6">Loading dashboard data...</div>;

//   // === UI (tidak diubah, hanya logic yg diperbaiki) ===
//   return (
//     <div className="max-w-7xl mx-auto p-6">
//      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

//       {/* === BAGIAN 1: KPI CARDS === */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
//         {/* Card 1: Total Produksi */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Produksi (Bulan Ini)</p>
//               <h3 className="text-2xl font-bold text-gray-900">{stats.prodMonth.toLocaleString()} <span className="text-sm font-normal text-gray-500">pcs</span></h3>
//               <div className="mt-1 text-sm text-blue-600">
//                 <span className="font-medium">Hari ini: {stats.prodToday.toLocaleString()} pcs</span>
//               </div>
//             </div>
//             <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
//               <Box size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 2: Laba Kotor (Profit) */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Est. Keuntungan (Gross)</p>
//               <h3 className={`text-2xl font-bold ${stats.profitLoss >= 0? 'text-gray-900' : 'text-red-600'}`}>
//                 {formatIDR(stats.profitLoss)}
//               </h3>
//               <div className="flex items-center mt-1 text-xs text-gray-400">
//                 <span>Revenue - Cost Produksi</span>
//               </div>
//             </div>
//             <div className="p-2 bg-green-50 rounded-lg text-green-600">
//               <DollarSign size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 3: Bahan Kritis (Custom Widget) */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
//            <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Stok Bahan Menipis</p>
//               <h3 className="text-2xl font-bold text-gray-900">{lowStockItems.length} <span className="text-sm font-normal text-gray-500">Item</span></h3>
//               <div className="flex items-center mt-1 text-sm text-yellow-600">
//                 <AlertTriangle size={16} className="mr-1" />
//                 <span>Perlu restock segera</span>
//               </div>
//             </div>
//             <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
//               <AlertTriangle size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Card 4: Kue Rusak */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-medium text-gray-500 mb-1">Total Return Rusak</p>
//               <h3 className="text-2xl font-bold text-gray-900">{stats.damagedMonth} <span className="text-sm font-normal text-gray-500">pcs</span></h3>
//               <div className="flex items-center mt-1 text-xs text-red-600">
//                 <span>Akumulasi bulan ini</span>
//               </div>
//             </div>
//             <div className="p-2 bg-red-50 rounded-lg text-red-600">
//               <Box size={24} /> 
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* === BAGIAN 2: CHART AREA & LIST (GRID) === */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
//         {/* Panel Kiri: Detail Stok Bahan Menipis */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h5 className="text-lg font-semibold text-gray-800 mb-4">Alert Stok Bahan (&lt; 50 unit)</h5>
//           {lowStockItems.length > 0? (
//             <div className="space-y-3 max-h-64 overflow-y-auto">
//                {lowStockItems.map((item, idx) => (
//                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
//                     <span className="font-medium text-gray-700">{item.name}</span>
//                     <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
//                       Sisa: {item.current_stock} {item.unit}
//                     </span>
//                  </div>
//                ))}
//             </div>
//           ) : (
//             <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
//               <span className="font-medium">Semua Stok Aman</span>
//               <span className="text-xs">Tidak ada bahan di bawah batas minimum</span>
//             </div>
//           )}
//         </div>

//         {/* Panel Kanan: Distribusi Area */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h5 className="text-lg font-semibold text-gray-800 mb-4">Volume Distribusi per Area (Bulan Ini)</h5>
//           {distributionStats.length > 0? (
//             <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
//               {distributionStats.map((dist, idx) => (
//                 <li key={idx} className="py-3 flex justify-between items-center">
//                   <span className="flex items-center text-gray-600">
//                     <Truck size={16} className="mr-2 text-indigo-500"/> 
//                     {dist.name}
//                   </span>
//                   <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
//                     {dist.count.toLocaleString()} pcs
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//              <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
//               Belum ada data distribusi bulan ini
//             </div>
//           )}
//         </div>
//       </div>

//       {/* === BAGIAN 3: TABEL STOK KUE === */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//           <h5 className="text-lg font-semibold text-gray-800">Stok Kue Tersedia (Gudang)</h5>
//           <span className="text-xs text-gray-500">Top 10 Lowest Stock</span>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-left text-sm text-gray-600">
//             <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
//               <tr>
//                 <th className="px-6 py-4">Nama Kue</th>
//                 <th className="px-6 py-4 text-center">Sisa Stok</th>
//                 <th className="px-6 py-4 text-center">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {cakeStock.length > 0? (
//                 cakeStock.map((cake, idx) => (
//                   <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 font-medium text-gray-900">{cake.name}</td>
//                     <td className="px-6 py-4 text-center font-bold">{cake.current_stock} Pcs</td>
//                     <td className="px-6 py-4 text-center">
//                       {cake.current_stock === 0? (
//                         <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Habis</span>
//                       ) : cake.current_stock < 20? (
//                         <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Menipis</span>
//                       ) : (
//                         <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Aman</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Data kue tidak ditemukan</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


/////////////////
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Reverted to previous path
import { 
  ArrowUpRight, ArrowDownRight, Box, DollarSign, 
  AlertTriangle, Truck, Banknote, Blocks, ChefHat, PackagePlus, Coins, SwitchCamera
} from 'lucide-react';

// Helper Currency
const formatIDR = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(num));

export default function Dashboard() {

  // === STATE ===
  
  const [stats, setStats] = useState({
    prodToday: 0,
    prodMonth: 0,
    damagedMonth: 0,
    profitLoss: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [cakeStock, setCakeStock] = useState([]);
  const [distributionStats, setDistributionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getSupabaseWithAuth } = useAuth();



  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    // === RANGE WAKTU ===
    const now = new Date();
    // Helper to get ISO string without time zone issues for simple comparisons
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    try {
      // === QUERY SUPABASE ===
      const [
        productionsData,
        distributionsData,
        cakesData,
        ingredientsData
      ] = await Promise.all([
        // 1. Productions (Uses production_date)
        supabase.from('productions')
          .select('*')
          .gte('production_date', startOfMonth)
          .lte('production_date', endOfMonth),

        // 2. Distributions (FIXED: Changed created_at to distribution_date)
        supabase.from('distributions')
          .select(`
            *,
            distribution_items (
              quantity_sent,
              quantity_sold,
              quantity_damaged_at_location,
              cake_id (price_per_piece)
            )
          `)
          .gte('distribution_date', startOfMonth) 
          .lte('distribution_date', endOfMonth),

        // 3. Cakes (Low Stock Logic)
        supabase.from('cakes')
          .select('*')
          .order('current_stock', { ascending: true })
          .limit(10),

        // 4. Ingredients (Low Stock Logic)
        supabase.from('ingredients')
          .select('*')
          .lte('current_stock', 50)
      ]);

      if (productionsData.error) throw productionsData.error;
      if (distributionsData.error) throw distributionsData.error;
      if (cakesData.error) throw cakesData.error;
      if (ingredientsData.error) throw ingredientsData.error;

      // === DATA PROCESSING ===
      const prods = productionsData.data || [];
      const dists = distributionsData.data || [];

      // == 1. PRODUKSI BULANAN ==
      const prodMonth = prods.reduce(
        (sum, p) => sum + (p.total_output || 0),
        0
      );

      const totalCostMonth = prods.reduce(
        (sum, p) => sum + (p.total_cost || 0),
        0
      );

      // == PRODUKSI HARI INI ==
      const prodToday = prods
        .filter((p) => p.production_date >= startOfToday)
        .reduce((sum, p) => sum + (p.total_output || 0), 0);

      // == 2. DISTRIBUSI ==
      // == 2. DISTRIBUSI ==
let damagedMonth = 0;
let totalRevenueMonth = 0;

// GROUP VOLUME DISTRIBUSI PER LOKASI
const locPerformanceMap = {};

dists.forEach((d) => {
  if (d.distribution_items) {
    d.distribution_items.forEach((item) => {

      const sold = item.quantity_sold || 0;
      const damaged = item.quantity_damaged_at_location || 0;
      const price = item.cake_id?.price_per_piece || 0;

      // Hitung Total Rusak
      damagedMonth += damaged;

      // Hitung Revenue
      totalRevenueMonth += sold * price;

      // Performa lokasi
      const totalUsed = sold + damaged;

      if (!locPerformanceMap[d.location]) {
        locPerformanceMap[d.location] = 0;
      }
      locPerformanceMap[d.location] += totalUsed;
    });
  }
});

// Convert map to array
const performanceStats = Object.entries(locPerformanceMap).map(([name, count]) => ({
  name,
  count,
}));

// TOP 5 lokasi
const locationStatsArray = Object.entries(locPerformanceMap)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);



      // == 3. PROFIT/LOSS ==
      const profitLoss = totalRevenueMonth - totalCostMonth;



      // === SET STATE ===
      setStats({
        prodToday,
        prodMonth,
        damagedMonth,
        profitLoss,
        totalCostMonth,
      });

      setLowStockItems(ingredientsData.data || []);
      setCakeStock(cakesData.data || []);
      setDistributionStats(performanceStats);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };






  // === LOADING ===
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500 text-lg font-medium">Loading dashboard data...</div>
    </div>
  );




  // === UI ===
  return (
    <div className="max-w-7xl mx-auto p-6">
     <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* === BAGIAN 1: KPI CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Produksi */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-bakery-light">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Produksi (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.prodMonth.toLocaleString()} <span className="text-sm font-normal text-gray-500">pcs</span></h3>
              <div className="mt-1 text-sm text-blue-600">
                <span className="font-medium">Hari ini: {stats.prodToday.toLocaleString()} pcs</span>
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <PackagePlus size={24} />
            </div>
          </div>
        </div>

        {/* Card 2: Laba Kotor (Profit) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Est. Keuntungan (Gross)</p>
              <h3 className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {formatIDR(stats.profitLoss)}
              </h3>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span>Cost Produksi</span>
             
              </div>
                 <p className="text font-medium  text-gray-900">
        {formatIDR(stats.totalCostMonth)}
      </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Banknote size={24} />
            </div>
          </div>
        </div>



        {/* Card 3: Bahan Kritis (Custom Widget) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Stok Bahan Menipis</p>
              <h3 className="text-2xl font-bold text-gray-900">{lowStockItems.length} <span className="text-sm font-normal text-gray-500">Item</span></h3>
              <div className="flex items-center mt-1 text-sm text-yellow-600">
                <AlertTriangle size={16} className="mr-1" />
                <span>Perlu restock segera</span>
              </div>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* Card 4: Kue Rusak */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Return Rusak</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.damagedMonth} <span className="text-sm font-normal text-gray-500">pcs</span></h3>
              <div className="flex items-center mt-1 text-xs text-red-600">
                <span>Akumulasi bulan ini</span>
              </div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <SwitchCamera size={24} /> 
            </div>
          </div>
        </div>
      </div>

      {/* === BAGIAN 2: CHART AREA & LIST (GRID) === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Panel Kiri: Detail Stok Bahan Menipis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Alert Stok Bahan (&lt; 50 unit)</h5>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
               {lowStockItems.map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                      Sisa: {item.current_stock} {item.unit}
                    </span>
                 </div>
               ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
              <span className="font-medium">Semua Stok Aman</span>
              <span className="text-xs">Tidak ada bahan di bawah batas minimum</span>
            </div>
          )}
        </div>

        {/* Panel Kanan: Distribusi Area */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Volume Distribusi per Area (Bulan Ini)</h5>
                {distributionStats.length > 0 ? (
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {distributionStats.map((dist, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center">
                <span className="flex items-center text-gray-600">
                    <Truck size={16} className="mr-2 text-indigo-500" />
                    {dist.name}
                </span>
                <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                    {dist.count.toLocaleString()} pcs
                </span>
                </li>
            ))}
            </ul>
        ) : (
            
             <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
              Belum ada data distribusi bulan ini
            </div>
          )}
        </div>
      </div>

      {/* === BAGIAN 3: TABEL STOK KUE === */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h5 className="text-lg font-semibold text-gray-800">Stok Kue Tersedia (Gudang)</h5>
          <span className="text-xs text-gray-500">Lowest Stock</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Nama Kue</th>
                <th className="px-6 py-4 text-center">Sisa Stok</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cakeStock.length > 0 ? (
                cakeStock.map((cake, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cake.name}</td>
                    <td className="px-6 py-4 text-center font-bold">{cake.current_stock} Pcs</td>
                    <td className="px-6 py-4 text-center">
                      {cake.current_stock === 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Habis</span>
                      ) : cake.current_stock < 20 ? (
                        <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Menipis</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Aman</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Data kue tidak ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}