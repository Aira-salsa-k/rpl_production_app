import { Package, Store, Truck } from 'lucide-react';
import { DISTRIBUTION_TABS } from '../../utils/constants';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Distribusi & Pengantaran</h1>
        <p className="text-gray-500 text-sm">Sistem Titipan, Tagihan & Auto-Restock</p>
      </div>
      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
        <button 
          onClick={() => setActiveTab(DISTRIBUTION_TABS.DISTRIBUTION)} 
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
            activeTab === DISTRIBUTION_TABS.DISTRIBUTION ? 'bg-stone-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package size={16} /> Distribusi
        </button>
        {/* <button 
          onClick={() => setActiveTab(DISTRIBUTION_TABS.DELIVERIES)} 
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
            activeTab === DISTRIBUTION_TABS.DELIVERIES ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Truck size={16} /> Pengantaran
        </button> */}
        <button 
          onClick={() => setActiveTab(DISTRIBUTION_TABS.KIOSKS)} 
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
            activeTab === DISTRIBUTION_TABS.KIOSKS ? 'bg-yellow-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Store size={16} /> Data Mitra
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;