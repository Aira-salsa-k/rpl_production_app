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
////////////////

// import { useState } from 'react';
// import { Link, useLocation, Outlet } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Database,
//   Settings,
//   FileText,
//   ChevronDown,
//   ChevronRight,
//   LogOut,
//   Menu,
//   Truck,
//   ShoppingCart,
//   Box,
//   User,
// } from 'lucide-react';


// export default function Layout({ onLogout }) {
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [expandedMenus, setExpandedMenus] = useState({
//     master: false,
//     operasional: false,
//     laporan: false,
//   });

//   const toggleSubmenu = (menu) => {
//     setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
//   };

//   // const linkClass = (path) =>
//   //   `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
//   //     location.pathname === path
//   //       ? 'bg-indigo-100 text-indigo-700'
//   //       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//   //   }`;

//   const linkClass = (path) =>
//   `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
//     location.pathname === path
//       ? 'bg-[var(--secondary-bakery)] text-[var(--dark-bakery)]'
//       : 'text-[var(--dark-bakery)] hover:bg-[var(--secondary-bakery)] hover:text-[var(--primary-bakery)]'
//   }`;




//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* SIDEBAR */}
//       <aside
//         className={`${
//           sidebarOpen ? 'w-64' : 'w-20'
//         } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
//       >
//       <div className="h-16 flex items-center justify-center border-b border-gray-200">
//         {sidebarOpen ? (
//           <div className="flex items-center space-x-3">
//             <img 
//               src="/kue_entrop.png"
//               alt="Tora Tory Logo"
//               className="h-10 object-contain"
//             />
//             <h1 className="text-xl font-bold text-bakery-primary">Tora-Tory</h1>
//           </div>
//         ) : (
//           <img 
//             src="/kue_entrop.png"
//             alt="Logo Icon"
//             className="h-8 object-contain"
//           />
//         )}
//       </div>



//         <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
//           <Link to="/dashboardnew" className={linkClass('/dashboardnew')}>
//             <LayoutDashboard size={20} className="mr-3" />
//             {sidebarOpen && 'Dashboard'}
//           </Link>

//           {/* DATA MASTER */}
//           <div>
//             <button
//               onClick={() => toggleSubmenu('master')}
//               className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
//             >
//               <div className="flex items-center">
//                 <Database size={20} className="mr-3" />
//                 {sidebarOpen && 'Data Master'}
//               </div>
//               {sidebarOpen && (expandedMenus.master ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
//             </button>
//             {sidebarOpen && expandedMenus.master && (
//               <div className="pl-11 space-y-1 mt-1">
//                   <Link to="/cakes" className={linkClass('/cakes')}>
//                   Data Kue
//                 </Link>
//                 <Link to="/ingredients" className={linkClass('/ingredients')}>
//                   Data Bahan
//                 </Link>
//                 <Link to="/recipes" className={linkClass('/recipes')}>
//                   Data Resep
//                 </Link>
                
              
//               </div>
//             )}
//           </div>

//           {/* OPERASIONAL */}
//           <div>
//             <button
//               onClick={() => toggleSubmenu('operasional')}
//               className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
//             >
//               <div className="flex items-center">
//                 <Settings size={20} className="mr-3" />
//                 {sidebarOpen && 'Operasional'}
//               </div>
//               {sidebarOpen && (expandedMenus.operasional ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
//             </button>
//             {sidebarOpen && expandedMenus.operasional && (
//               <div className="pl-11 space-y-1 mt-1">
//                 <Link to="/productions" className={linkClass('/productions')}>
//                   Produksi
//                 </Link>
//                 <Link to="/distributions" className={linkClass('/distributions')}>
//                   Distribusi
//                 </Link>

//                   Penjualan
//                 </Link> */}
//               </div>
//             )}
//           </div>

//           {/* LAPORAN */}
//           {/* <div>
//             <button
//               onClick={() => toggleSubmenu('laporan')}
//               className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
//             >
//               <div className="flex items-center">
//                 <FileText size={20} className="mr-3" />
//                 {sidebarOpen && 'Laporan'}
//               </div>
//               {sidebarOpen && (expandedMenus.laporan ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
//             </button>
//             {sidebarOpen && expandedMenus.laporan && (
//               <div className="pl-11 space-y-1 mt-1">
//                 <Link to="/reports" className={linkClass('/reports')}>
//                   Semua Laporan
//                 </Link>
//               </div>
//             )}
//           </div> */}
          

//             <div>
//             <Link
//               to="/reports"
//               className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
//             >
//               <FileText size={20} className="mr-3" />
//               {sidebarOpen && "Laporan"}
//             </Link>
//           </div>

//         </nav>

//         <div className="p-4 border-t border-gray-200">
//           <button
          
//             onClick={onLogout}
//             className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
//           >
//             <LogOut size={20} className="mr-3" /> {sidebarOpen && 'Logout'}
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navbar */}
//        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//           <button 
//             onClick={() => setSidebarOpen(!sidebarOpen)} 
//             className="text-gray-500 focus:outline-none lg:hidden"
//           >
//             <Menu size={24} />
//           </button>
          
//           {/* Judul opsional (bisa diaktifkan lagi) */}
//           {/* <h2 className="text-lg font-semibold text-gray-700 hidden md:block">Ringkasan Operasional</h2> */}
          
//           {/* User Dropdown */}
//           <div className="flex items-center">
//             <UserDropdown />
//           </div>
//         </header>

//         {/* Content */}
//         <main className="flex-1 overflow-auto p-6 bg-gray-50">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from 'react';
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
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    master: false,
    operasional: false,
    laporan: false,
  });
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const userPopupRef = useRef(null);
  
  // Ambil data user dari Auth Context
  const { user } = useAuth();

  const toggleSubmenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const toggleUserPopup = () => {
    setIsUserPopupOpen(!isUserPopupOpen);
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Close popup ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userPopupRef.current && !userPopupRef.current.contains(event.target)) {
        setIsUserPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <img 
                src="/kue_entrop.png"
                alt="Tora Tory Logo"
                className="h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-bakery-primary">Tora-Tory</h1>
            </div>
          ) : (
            <img 
              src="/kue_entrop.png"
              alt="Logo Icon"
              className="h-8 object-contain"
            />
          )}
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
                <Link to="/ingredients" className={linkClass('/ingredients')}>
                  Data Bahan
                </Link>
                <Link to="/recipes" className={linkClass('/recipes')}>
                  Data Resep
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
              </div>
            )}
          </div>

          {/* LAPORAN */}
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none lg:hidden">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center relative">
            <button 
              onClick={toggleUserPopup}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <User size={24} />
            </button>

            {/* User Popup */}
            {isUserPopupOpen && (
              <div 
                ref={userPopupRef}
                className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Profil Pengguna</h3>
                </div>

                {!user ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Memuat data...</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Informasi Utama */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.user_metadata?.name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.role || user.user_metadata?.role || 'User'}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-3">
                      <Mail size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-800">{user.email}</p>
                      </div>
                    </div>

                    {/* Status Verifikasi */}
                    <div className="flex items-center space-x-3">
                      <Shield size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Status Verifikasi</p>
                        <div className="flex items-center space-x-2">
                          {user.email_confirmed_at || user.confirmed_at ? (
                            <>
                              <CheckCircle size={16} className="text-green-500" />
                              <span className="text-green-600 text-sm">Terverifikasi</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="text-red-500" />
                              <span className="text-red-600 text-sm">Belum Terverifikasi</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bergabung Sejak */}
                    <div className="flex items-center space-x-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Bergabung Sejak</p>
                        <p className="text-gray-800">
                          {formatDate(user.created_at || user.confirmed_at)}
                        </p>
                      </div>
                    </div>

                    {/* Login Terakhir */}
                    <div className="flex items-center space-x-3">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Login Terakhir</p>
                        <p className="text-gray-800">
                          {formatDate(user.last_sign_in_at)}
                        </p>
                      </div>
                    </div>

                    {/* User ID */}
                    {/* <div className="flex items-start space-x-3">
                      <Shield size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">User ID</p>
                        <p className="text-gray-800 text-xs font-mono break-all">
                          {user.id}
                        </p>
                      </div>
                    </div> */}
                  </div>
                )}

                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
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