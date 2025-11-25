// import { useState } from 'react';
// import { Link, useLocation, Outlet } from 'react-router-dom';
// import { LayoutDashboard, Database, Settings, ChevronDown, ChevronRight, LogOut, Menu } from 'lucide-react';

// export default function Layout({ onLogout }) {
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [expandedMenus, setExpandedMenus] = useState({
//     master: false,
//     operasional: false,
//     laporan: false,
//   });

//   const toggleSubmenu = (menu) => {
//     setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
//   };

//   const linkClass = (path) =>
//     `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
//       location.pathname === path
//         ? 'bg-indigo-100 text-indigo-700'
//         : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//     }`;

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* SIDEBAR */}
//       <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col`}>
//         <div className="h-16 flex items-center justify-center border-b border-gray-200">
//           {sidebarOpen ? <h1 className="text-xl font-bold text-indigo-600">Tora-Tory</h1> : <span>TT</span>}
//         </div>

//         <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
//           <Link to="/dashboardnew" className={linkClass('/dashboardnew')}>
//             <LayoutDashboard size={20} className="mr-3" /> {sidebarOpen && 'Dashboard'}
//           </Link>

//           {/* DATA MASTER */}
//           <div>
//             <button onClick={() => toggleSubmenu('master')} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
//               <div className="flex items-center">
//                 <Database size={20} className="mr-3" />
//                 {sidebarOpen && 'Data Master'}
//               </div>
//               {sidebarOpen && (expandedMenus.master ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
//             </button>
//             {sidebarOpen && expandedMenus.master && (
//               <div className="pl-11 space-y-1 mt-1">
//                 <Link to="/recipes" className={linkClass('/recipes')}>Data Resep</Link>
//                 <Link to="/ingredients" className={linkClass('/ingredients')}>Data Bahan</Link>
//                 <Link to="/cakes" className={linkClass('/cakes')}>Data Kue</Link>
//               </div>
//             )}
//           </div>

//           {/* Tambahkan menu lain sesuai kebutuhan */}
//         </nav>

//         <div className="p-4 border-t border-gray-200">
//           <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
//             <LogOut size={20} className="mr-3" /> {sidebarOpen && 'Logout'}
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navbar */}
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
//             <Menu size={24} />
//           </button>
//         </header>

//         {/* Content */}
//         <main className="flex-1 overflow-auto p-6 bg-gray-50">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Truck,
  ShoppingCart,
  Box,
  User,
} from 'lucide-react';

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    master: false,
    operasional: false,
    laporan: false,
  });

  const toggleSubmenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // const linkClass = (path) =>
  //   `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
  //     location.pathname === path
  //       ? 'bg-indigo-100 text-indigo-700'
  //       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  //   }`;

  const linkClass = (path) =>
  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
    location.pathname === path
      ? 'bg-[var(--secondary-bakery)] text-[var(--dark-bakery)]'
      : 'text-[var(--dark-bakery)] hover:bg-[var(--secondary-bakery)] hover:text-[var(--primary-bakery)]'
  }`;




  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          {sidebarOpen ? <h1 className="text-xl font-bold text-bakery-primary ">Tora-Tory</h1> : <span>TT</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link to="/dashboardnew" className={linkClass('/dashboardnew')}>
            <LayoutDashboard size={20} className="mr-3" />
            {sidebarOpen && 'Dashboard'}
          </Link>

          {/* DATA MASTER */}
          <div>
            <button
              onClick={() => toggleSubmenu('master')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                <Database size={20} className="mr-3" />
                {sidebarOpen && 'Data Master'}
              </div>
              {sidebarOpen && (expandedMenus.master ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {sidebarOpen && expandedMenus.master && (
              <div className="pl-11 space-y-1 mt-1">
                  <Link to="/cakes" className={linkClass('/cakes')}>
                  Data Kue
                </Link>
                <Link to="/recipes" className={linkClass('/recipes')}>
                  Data Resep
                </Link>
                <Link to="/ingredients" className={linkClass('/ingredients')}>
                  Data Bahan
                </Link>
              
              </div>
            )}
          </div>

          {/* OPERASIONAL */}
          <div>
            <button
              onClick={() => toggleSubmenu('operasional')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                <Settings size={20} className="mr-3" />
                {sidebarOpen && 'Operasional'}
              </div>
              {sidebarOpen && (expandedMenus.operasional ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {sidebarOpen && expandedMenus.operasional && (
              <div className="pl-11 space-y-1 mt-1">
                <Link to="/productions" className={linkClass('/productions')}>
                  Produksi
                </Link>
                <Link to="/distributions" className={linkClass('/distributions')}>
                  Distribusi
                </Link>
                {/* <Link to="/sales" className={linkClass('/sales')}>
                  Penjualan
                </Link> */}
              </div>
            )}
          </div>

          {/* LAPORAN */}
          {/* <div>
            <button
              onClick={() => toggleSubmenu('laporan')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                <FileText size={20} className="mr-3" />
                {sidebarOpen && 'Laporan'}
              </div>
              {sidebarOpen && (expandedMenus.laporan ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {sidebarOpen && expandedMenus.laporan && (
              <div className="pl-11 space-y-1 mt-1">
                <Link to="/reports" className={linkClass('/reports')}>
                  Semua Laporan
                </Link>
              </div>
            )}
          </div> */}
          

            <div>
            <Link
              to="/reports"
              className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <FileText size={20} className="mr-3" />
              {sidebarOpen && "Laporan"}
            </Link>
          </div>

        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut size={20} className="mr-3" /> {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-700">Ringkasan Operasional Bulan Ini</h2>
          <div className="flex items-center">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
              <User size={24} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
