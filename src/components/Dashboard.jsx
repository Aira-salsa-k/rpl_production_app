import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path ini jika perlu

// Helper function untuk format mata uang IDR
const formatIDR = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    prodToday: 0,
    prodMonth: 0,
    damagedMonth: 0,
    profitLoss: 0,
    damagePercentage: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [cakeStock, setCakeStock] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { getSupabaseWithAuth } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [getSupabaseWithAuth]); // Dependensi sudah benar

  const fetchDashboardData = async () => {
    setLoading(true);
    const supabaseClient = getSupabaseWithAuth();
    
    // Tentukan rentang tanggal
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
      // 1. Fetch semua data yang diperlukan secara paralel
      const [
        productionsData,
        damagedData,
        revenueData,
        lowStockData,
        cakeStockData
      ] = await Promise.all([
        // Produksi bulan ini
        supabaseClient.from('productions')
          .select('production_date, total_output, total_cost')
          .gte('production_date', startOfMonth)
          .lte('production_date', endOfMonth),
        
        // Kue rusak bulan ini
        supabaseClient.from('distribution_items')
          .select('created_at, quantity_damaged')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
          .gt('quantity_damaged', 0),
          
        // Pemasukan bulan ini (asumsi ada di tabel 'distributions')
        supabaseClient.from('distributions')
          .select('created_at, total_revenue') // Asumsi Anda punya kolom ini
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth),
          
        // Bahan yang mau habis (misal, stok <= 20)
        supabaseClient.from('ingredients')
          .select('name, unit, current_stock')
          .lte('current_stock', 20) // <-- Tentukan batas "low stock" Anda di sini
          .order('current_stock', { ascending: true }),
          
        // Stok kue siap kirim
        supabaseClient.from('cakes')
          .select('name, current_stock')
          .gt('current_stock', 0)
          .order('name')
      ]);

      // 2. Proses dan hitung data
      let prodToday = 0;
      let prodMonth = 0;
      let totalCost = 0;
      productionsData.data?.forEach(p => {
        if (p.production_date === todayStr) {
          prodToday += p.total_output;
        }
        prodMonth += p.total_output;
        totalCost += p.total_cost; // Akumulasi biaya produksi
      });

      let damagedMonth = 0;
      damagedData.data?.forEach(d => {
        damagedMonth += d.quantity_damaged;
      });

      let totalRevenue = 0;
      revenueData.data?.forEach(r => {
        totalRevenue += r.total_revenue; // Akumulasi pendapatan
      });

      const profitLoss = totalRevenue - totalCost;
      const damagePercentage = (prodMonth > 0) ? (damagedMonth / prodMonth) * 100 : 0;

      // 3. Set state untuk di-render
      setStats({
        prodToday,
        prodMonth,
        damagedMonth,
        profitLoss,
        damagePercentage,
      });
      setLowStockItems(lowStockData.data || []);
      setCakeStock(cakeStockData.data || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Tampilkan notifikasi error jika perlu
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard lama</h1>
        
        {/* === BAGIAN NAVIGASI (DARI KODE ANDA) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/cakes" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cakes Management</h2>
            <p className="text-gray-600">View, create, update, and delete cake information</p>
          </Link>
          <Link 
            to="/ingredients" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingredients Management</h2>
            <p className="text-gray-600">Track ingredients and manage stock levels</p>
          </Link>
          <Link 
            to="/recipes" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Recipe Management</h2>
            <p className="text-gray-600">Define recipes with ingredients and quantities</p>
          </Link>
          <Link 
            to="/productions" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Production Runs</h2>
            <p className="text-gray-600">Start production runs and track costs</p>
          </Link>
          <Link 
            to="/distributions" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Distribution Tracking</h2>
            <p className="text-gray-600">Manage cake shipments and locations</p>
          </Link>
          <Link 
            to="/reports" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reports</h2>
            <p className="text-gray-600">View production summaries and financial data</p>
          </Link>
        </div>
        
        {/* === QUICK STATS (DENGAN DATA BARU) === */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats (This Month)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.prodToday}</p>
              <p className="text-gray-600">Cakes Produced Today</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.prodMonth}</p>
              <p className="text-gray-600">Total Cakes This Month</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.damagedMonth}</p>
              <p className="text-gray-600">Cakes Damaged This Month</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className={`text-3xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatIDR(stats.profitLoss)}
              </p>
              <p className="text-gray-600">Est. Profit/Loss This Month</p>
            </div>
          </div>
        </div>

        {/* === BAGIAN BARU (SESUAI REQUEST ANDA) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Bahan Stok Menipis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Low Stock Ingredients</h2>
            {lowStockItems.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {lowStockItems.map((item, index) => (
                  <li key={index} className="py-3 flex justify-between">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-red-600">{item.current_stock} {item.unit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">All ingredient stocks are healthy.</p>
            )}
          </div>
          
          {/* 2. Stok Kue Siap Kirim */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready-to-Ship Cake Stock</h2>
            {cakeStock.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {cakeStock.map((cake, index) => (
                  <li key={index} className="py-3 flex justify-between">
                    <span className="text-gray-700">{cake.name}</span>
                    <span className="font-medium text-blue-600">{cake.current_stock} pcs</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No cakes in stock.</p>
            )}
          </div>

          {/* 3. Efisiensi Produksi */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Production Efficiency</h2>
            <p className="text-gray-600 mb-4">(Damaged Rate This Month)</p>
            <p className={`text-5xl font-bold ${stats.damagePercentage > 5 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.damagePercentage.toFixed(1)}%
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}


// import { Link } from 'react-router-dom';

// export default function Dashboard() {
//   return (
//     <div className="p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <Link 
//             to="/cakes" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Cakes Management</h2>
//             <p className="text-gray-600">View, create, update, and delete cake information</p>
//           </Link>
          
//           <Link 
//             to="/ingredients" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingredients Management</h2>
//             <p className="text-gray-600">Track ingredients and manage stock levels</p>
//           </Link>
          
//           <Link 
//             to="/recipes" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Recipe Management</h2>
//             <p className="text-gray-600">Define recipes with ingredients and quantities</p>
//           </Link>
          
//           <Link 
//             to="/productions" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Production Runs</h2>
//             <p className="text-gray-600">Start production runs and track costs</p>
//           </Link>
          
//           <Link 
//             to="/distributions" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Distribution Tracking</h2>
//             <p className="text-gray-600">Manage cake shipments and locations</p>
//           </Link>
          
//           <Link 
//             to="/reports" 
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
//           >
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Reports</h2>
//             <p className="text-gray-600">View production summaries and financial data</p>
//           </Link>
//         </div>
        
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="border rounded-lg p-4 text-center">
//               <p className="text-2xl font-bold text-blue-600">0</p>
//               <p className="text-gray-600">Total Cakes</p>
//             </div>
//             <div className="border rounded-lg p-4 text-center">
//               <p className="text-2xl font-bold text-green-600">0</p>
//               <p className="text-gray-600">Ingredients</p>
//             </div>
//             <div className="border rounded-lg p-4 text-center">
//               <p className="text-2xl font-bold text-yellow-600">0</p>
//               <p className="text-gray-600">Recipes</p>
//             </div>
//             <div className="border rounded-lg p-4 text-center">
//               <p className="text-2xl font-bold text-purple-600">0</p>
//               <p className="text-gray-600">Production Runs</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }