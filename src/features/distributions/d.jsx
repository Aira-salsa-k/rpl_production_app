import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';


import { MapPin, Plus, Store, Trash2, Calendar, Filter, Calculator, RefreshCw, Save, ArrowRightCircle, Power, PowerOff } from 'lucide-react'; 

// ==================================================================================
// ⚠️ CATATAN: Uncomment baris di bawah ini di project asli
// import { useAuth } from '../../contexts/AuthContext';
// ==================================================================================

// --- DATA MOCK ---
const ROUTES = ['Arso 1', 'Arso 2', 'Arso Kota', 'Koya Barat', 'Koya Timur', 'Nimbokrang', 'Sentani'];



const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function Distributions() {
  const [activeTab, setActiveTab] = useState('distribution'); 
  const { getSupabaseWithAuth } = useAuth();
  
  // Data States
  const [distributions, setDistributions] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [kiosks, setKiosks] = useState([]); 
  
  // Filter States
  const [filterArea, setFilterArea] = useState('Semua'); 
  const [filterMonth, setFilterMonth] = useState(''); // Format: YYYY-MM
  
  // Form Create Distribution States
  const [selectedArea, setSelectedArea] = useState(''); 
  const [selectedKioskId, setSelectedKioskId] = useState('');
  const [distDate, setDistDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]); 
  
  // Manual Add Item State
  const [manualCakeId, setManualCakeId] = useState('');
  const [manualQty, setManualQty] = useState('');
  
  // Form Create Kiosk States
  const [newKiosk, setNewKiosk] = useState({ name: '', area: '', address: '', gmaps_link: '' });
  const [kioskTemplateItems, setKioskTemplateItems] = useState([]); 
  const [tempTemplateCake, setTempTemplateCake] = useState('');
  const [tempTemplateQty, setTempTemplateQty] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    // Set default filter month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFilterMonth(currentMonth);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      // Fetch Kiosks (hapus filter is_active=true agar bisa lihat semua di tab Kios)
      // Nanti filter manual di UI
      const [distData, cakesData, kiosksData] = await Promise.all([
        supabase
          .from('distributions')
          .select(`
            id, distribution_date, kiosk_id,
            kiosks ( name, area, address, gmaps_link ),
            distribution_items (
              id, quantity_sent, quantity_sold, quantity_damaged_at_location,
              price_at_distribution, withdrawal_date,
              cake_id ( id, name )
            )
          `)
          .order('distribution_date', { ascending: false }),
        supabase.from('cakes').select('*').order('name'),
        supabase.from('kiosks')
          .select(`
            *,
            kiosk_consignment_templates (
              cake_id, default_quantity,
              cakes ( name, price_per_piece ) 
            )
          `)
          .order('name') 
      ]);
      
      setDistributions(distData.data || []);
      setCakes(cakesData.data || []);
      setKiosks(kiosksData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: Auto-Fill Items ---
  useEffect(() => {
    if (selectedKioskId) {
      const kiosk = kiosks.find(k => k.id === selectedKioskId);
      if (kiosk && kiosk.kiosk_consignment_templates && kiosk.kiosk_consignment_templates.length > 0) {
        const autoItems = kiosk.kiosk_consignment_templates.map(t => {
           const masterCake = cakes.find(c => c.id === t.cake_id);
           const price = masterCake ? masterCake.price_per_piece : (t.cakes?.price_per_piece || 0);
           const stock = masterCake ? masterCake.current_stock : 0;

           return {
             tempId: Date.now() + Math.random(),
             cake_id: t.cake_id,
             cake_name: t.cakes?.name || 'Unknown',
             quantity: t.default_quantity,
             price: price,
             current_stock: stock
           };
        });
        setItems(autoItems);
      } else {
        setItems([]); 
      }
    }
  }, [selectedKioskId, kiosks, cakes]);

  // --- KIOSK ACTIONS ---
  const handleAddKioskWithTemplate = async (e) => {
    e.preventDefault();
    if(!newKiosk.area) return alert("Harap pilih Area/Rute!");
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    try {
      const userResp = await supabase.auth.getUser();
      const { data: kioskData, error: kioskError } = await supabase.from('kiosks').insert([{
        user_id: userResp.data?.user?.id,
        name: newKiosk.name,
        area: newKiosk.area,
        address: newKiosk.address,
        gmaps_link: newKiosk.gmaps_link,
        is_active: true
      }]).select();
      if (kioskError) throw kioskError;
      if (kioskData && kioskTemplateItems.length > 0) {
         const newKioskId = kioskData[0].id; 
         const templatesPayload = kioskTemplateItems.map(t => ({
            kiosk_id: newKioskId,
            cake_id: t.cake_id,
            default_quantity: t.quantity
         }));
         await supabase.from('kiosk_consignment_templates').insert(templatesPayload);
      }
      alert('Mitra Kios berhasil ditambahkan!');
      setNewKiosk({ name: '', area: '', address: '', gmaps_link: '' });
      setKioskTemplateItems([]);
      fetchData(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleToggleKioskStatus = async (kiosk) => {
      const newStatus = !kiosk.is_active;
      const confirmMsg = newStatus 
        ? `Aktifkan kembali mitra "${kiosk.name}"?`
        : `Non-aktifkan mitra "${kiosk.name}"?\n(Kios ini tidak akan muncul di form pengiriman)`;
      
      if(!window.confirm(confirmMsg)) return;
      
      setIsSubmitting(true);
      const supabase = getSupabaseWithAuth();
      try {
          const { error } = await supabase.from('kiosks').update({ is_active: newStatus }).eq('id', kiosk.id);
          if (error) throw error;
          alert(`Status mitra berhasil diubah jadi: ${newStatus ? 'AKTIF' : 'NON-AKTIF'}`);
          fetchData();
      } catch (err) {
          alert('Gagal update status: ' + err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAddTemplateItem = () => {
    if(!tempTemplateCake || !tempTemplateQty) return;
    const cake = cakes.find(c => c.id === tempTemplateCake);
    setKioskTemplateItems([...kioskTemplateItems, {
      cake_id: tempTemplateCake,
      cake_name: cake?.name,
      quantity: parseInt(tempTemplateQty)
    }]);
    setTempTemplateCake('');
    setTempTemplateQty('');
  };

  // --- DISTRIBUTION ACTIONS ---
  const handleAddManualItem = () => {
    if (!manualCakeId || !manualQty) return alert("Lengkapi data item");
    const cake = cakes.find(c => c.id === manualCakeId);
    if (!cake) return;
    const existing = items.find(i => i.cake_id === manualCakeId);
    if(existing) return alert("Kue ini sudah ada di daftar, silakan edit jumlahnya.");
    setItems([...items, {
      tempId: Date.now(),
      cake_id: manualCakeId,
      cake_name: cake.name,
      quantity: parseInt(manualQty),
      price: cake.price_per_piece, 
      current_stock: cake.current_stock
    }]);
    setManualCakeId('');
    setManualQty('');
  };

  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    if (!selectedKioskId || items.length === 0) return alert("Data belum lengkap");
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    try {
      const itemsPayload = items.map(i => ({
        cake_id: i.cake_id,
        distributed: i.quantity,
        price: i.price, 
        damaged: 0
      }));
      const { error } = await supabase.rpc('record_distribution', {
        kiosk_id_input: selectedKioskId,
        date_input: distDate,
        items_input: itemsPayload
      });
      if (error) throw error;
      alert('Distribusi baru tercatat!');
      setItems([]);
      setSelectedKioskId('');
      fetchData();
    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RECONCILE & FLEXIBLE RESTOCK ---
  const handleReconcileAndRestock = async (item) => {
    // 1. Input Data Rusak
    const damagedInput = prompt(
        `SETORAN KUE: ${item.cake_id.name}\n` +
        `--------------------------------\n` +
        `Total Titip Awal: ${item.quantity_sent} pcs\n` +
        `Masukkan Jumlah RUSAK / BASI:`, 
        "0"
    );
    if (damagedInput === null) return;
    const damaged = parseInt(damagedInput);
    if (isNaN(damaged) || damaged < 0) return alert("Angka rusak tidak valid!");
    
    // Validasi Stok
    const sold = item.quantity_sent - damaged;
    if (sold < 0) return alert(`Rusak (${damaged}) melebihi titipan (${item.quantity_sent})!`);

    // 2. Input Jumlah Restock Baru (Flexible)
    const nextRestockInput = prompt(
        `JUMLAH TITIPAN BARU (RESTOCK):\n` +
        `--------------------------------\n` +
        `Secara default jumlahnya sama (${item.quantity_sent}).\n` +
        `Ubah angka di bawah jika ingin MENAMBAH/MENGURANGI titipan untuk periode berikutnya.\n\n` +
        `Jumlah Titip Baru:`,
        item.quantity_sent
    );
    if (nextRestockInput === null) return;
    const nextRestockQty = parseInt(nextRestockInput);
    if (isNaN(nextRestockQty) || nextRestockQty <= 0) return alert("Jumlah restock harus lebih dari 0!");

    // 3. Konfirmasi Akhir
    const totalTagihan = sold * item.price_at_distribution;
    const confirmMsg = 
        `KONFIRMASI AKHIR\n` +
        `--------------------------------\n` +
        `• Laku: ${sold} pcs\n` +
        `• Rusak: ${damaged} pcs\n` +
        `💰 TAGIHAN: ${formatRupiah(totalTagihan)}\n\n` +
        `➡️ RESTOCK BERIKUTNYA: ${nextRestockQty} pcs\n` +
        `(Template default kios akan diupdate ke jumlah ini)\n\n` +
        `Proses?`;

    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Panggil RPC Update dengan parameter baru p_next_restock_qty
       const { error } = await supabase.rpc('reconcile_and_restock', {
          p_dist_item_id: item.id,
          p_damaged: damaged,
          p_withdrawal_date: today,
          p_next_restock_qty: nextRestockQty // <--- Kirim Qty Baru
      });

      if (error) throw error;
      
      alert(`Berhasil!\nSetoran dicatat & Stok baru (${nextRestockQty} pcs) telah dibuat.`);
      fetchData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FILTERING ---
  const filteredKiosksForInput = kiosks.filter(k => 
      k.is_active && // Hanya ambil yang aktif
      (selectedArea ? k.area === selectedArea : true)
  );

  const filteredHistory = distributions.filter(d => {
      // Filter Area
      if (filterArea !== 'Semua' && d.kiosks?.area !== filterArea) return false;
      
      // Filter Tanggal (Bulan/Tahun)
      if (filterMonth) {
          const distDate = d.distribution_date.substring(0, 7); // Ambil YYYY-MM
          
          // Cek tanggal distribusi
          let match = distDate === filterMonth;
          
          // Atau cek jika ada item yang di-restock (tanggal tarik) di bulan ini
          if (!match) {
             const hasRestockInMonth = d.distribution_items.some(item => 
                 item.withdrawal_date && item.withdrawal_date.substring(0, 7) === filterMonth
             );
             if (hasRestockInMonth) match = true;
          }
          
          if (!match) return false;
      }
      
      return true;
  });

  if (loading) return <div className="p-8 text-center flex flex-col items-center justify-center"><RefreshCw className="animate-spin mb-2"/> Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Distribusi</h1>
            <p className="text-gray-500 text-sm">Sistem Titipan, Tagihan & Auto-Restock</p>
          </div>
          
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
            <button onClick={() => setActiveTab('distribution')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'distribution' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Distribusi
            </button>
            <button onClick={() => setActiveTab('kiosks')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'kiosks' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Store size={16} /> Data Mitra
            </button>
          </div>
        </div>

        {/* ===================== TAB: DISTRIBUSI ===================== */}
        {activeTab === 'distribution' && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* --- KIRI: Form Input --- */}
            <div className="lg:col-span-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <div className="border-b pb-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600"/> Titipan Baru Manual
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Gunakan ini untuk Mitra Baru / Pengiriman Pertama. Untuk rutin, gunakan tombol 'Setor & Restock' di kanan.</p>
                </div>
                
                <form onSubmit={handleCreateDistribution} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">1. Area Pengantaran</label>
                    <select 
                      value={selectedArea} 
                      onChange={e => { setSelectedArea(e.target.value); setSelectedKioskId(''); setItems([]); }} 
                      className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 font-medium"
                    >
                      <option value="">-- Pilih Area --</option>
                      {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">2. Kios Tujuan (Aktif Only)</label>
                    <select 
                      value={selectedKioskId} 
                      onChange={e => setSelectedKioskId(e.target.value)} 
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">-- Pilih Kios --</option>
                      {filteredKiosksForInput.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Titip</label>
                    <input type="date" value={distDate} onChange={e => setDistDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
                  </div>

                  <hr className="border-gray-100 my-2" />

                  {/* Step 3: Daftar Barang */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-semibold text-gray-500 uppercase">3. Daftar Kue</label>
                       {items.length > 0 && <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">Auto-Filled</span>}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <select value={manualCakeId} onChange={e => setManualCakeId(e.target.value)} className="flex-1 px-2 py-2 border rounded-lg text-sm bg-white">
                        <option value="">+ Tambah Item Manual</option>
                        {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input type="number" value={manualQty} onChange={e => setManualQty(e.target.value)} placeholder="Qty" className="w-16 px-2 py-2 border rounded-lg text-sm bg-white" />
                      <button type="button" onClick={handleAddManualItem} className="bg-gray-800 text-white px-3 rounded-lg hover:bg-black text-sm">+</button>
                    </div>

                    {items.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                         {items.map((item, idx) => (
                           <div key={item.tempId} className="flex justify-between items-center bg-white px-3 py-2 rounded text-sm border border-gray-200 shadow-sm">
                             <div>
                               <div className="font-bold text-gray-700">{item.cake_name}</div>
                               <div className="text-[10px] text-gray-400">Harga: {formatRupiah(item.price)}</div>
                             </div>
                             <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 value={item.quantity} 
                                 onChange={(e) => {
                                   const newQty = parseInt(e.target.value) || 0;
                                   const updated = [...items];
                                   updated[idx].quantity = newQty;
                                   setItems(updated);
                                 }}
                                 className="w-12 text-center border rounded py-1 bg-gray-50 font-bold text-indigo-700 focus:bg-white focus:ring-2"
                               />
                               <button type="button" onClick={() => setItems(items.filter(i => i.tempId !== item.tempId))} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                             </div>
                           </div>
                         ))}
                         <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-500">Total Nilai Barang:</span>
                            <span className="font-bold text-indigo-700 text-sm">
                              {formatRupiah(items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0))}
                            </span>
                         </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-gray-400 italic">Belum ada item. Pilih Kios atau tambah manual.</div>
                    )}
                  </div>

                  <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                    {isSubmitting ? 'Menyimpan...' : <><Save size={16}/> Simpan Distribusi</>}
                  </button>
                </form>
              </div>
            </div>

            {/* --- KANAN: Riwayat & Penarikan --- */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-200 gap-3">
                 <div className="flex items-center gap-2 text-gray-600">
                    <Filter size={18} />
                    <span className="font-bold text-sm">Filter:</span>
                 </div>
                 
                 <div className="flex gap-3 w-full sm:w-auto">
                    {/* Filter Bulan */}
                    <div className="relative flex-1 sm:flex-none">
                       <Calendar size={14} className="absolute left-3 top-3 text-gray-400"/>
                       <input 
                          type="month" 
                          value={filterMonth}
                          onChange={e => setFilterMonth(e.target.value)}
                          className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:ring-indigo-500 focus:border-indigo-500"
                       />
                    </div>

                    {/* Filter Area */}
                    <select 
                      value={filterArea} 
                      onChange={e => setFilterArea(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 flex-1 sm:flex-none"
                    >
                       <option value="Semua">Semua Area</option>
                       {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
              </div>

              {filteredHistory.map((dist) => {
                const totalBill = dist.distribution_items.reduce((acc, item) => {
                    return acc + (item.quantity_sold * item.price_at_distribution);
                }, 0);
                
                const isFullyReconciled = dist.distribution_items.every(item => item.withdrawal_date);

                return (
                  <div key={dist.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-shadow ${isFullyReconciled ? 'border-green-200 ring-1 ring-green-100' : 'border-l-4 border-l-yellow-400 border-gray-200'}`}>
                    
                    <div className={`px-6 py-4 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${isFullyReconciled ? 'bg-green-50' : 'bg-white'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm">{dist.kiosks?.area}</span>
                          <h3 className="font-bold text-lg text-gray-900">{dist.kiosks?.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                           <span className="flex items-center gap-1"><Calendar size={14}/> {isFullyReconciled ? 'Selesai:' : 'Aktif sejak:'} {new Date(dist.distribution_date).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                      
                      {/* Financial Summary */}
                      {isFullyReconciled ? (
                          <div className="text-right bg-green-100 px-4 py-2 rounded-lg border border-green-200">
                            <div className="text-[10px] text-green-700 uppercase font-bold tracking-wide">Transaksi Selesai</div>
                            <div className="text-xl font-bold text-green-700">{formatRupiah(totalBill)}</div>
                          </div>
                      ) : (
                          <div className="text-right bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                            <div className="text-[10px] text-yellow-700 uppercase font-bold tracking-wide">Status: Sedang Dititip</div>
                            <div className="text-xs text-yellow-600 italic">Menunggu setoran</div>
                          </div>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 border-b">
                          <tr>
                            <th className="px-5 py-3 font-medium">Item Kue</th>
                            <th className="px-5 py-3 font-medium text-center bg-gray-50">Harga @</th>
                            <th className="px-5 py-3 font-medium text-center bg-indigo-50 text-indigo-700">Titip</th>
                            <th className="px-5 py-3 font-medium text-center text-green-700">Laku</th>
                            <th className="px-5 py-3 font-medium text-center text-red-600">Rusak</th>
                            <th className="px-5 py-3 font-medium text-right">Tagihan</th>
                            <th className="px-5 py-3 font-medium text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {dist.distribution_items.map((item) => {
                             const itemBill = item.quantity_sold * item.price_at_distribution;
                             const hasWithdrawn = !!item.withdrawal_date;
                             
                             return (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3">
                                   <div className="font-medium text-gray-900">{item.cake_id?.name}</div>
                                   {hasWithdrawn && <div className="text-[10px] text-gray-400 mt-0.5">Restock: {new Date(item.withdrawal_date).toLocaleDateString('id-ID')}</div>}
                                </td>
                                <td className="px-5 py-3 text-center text-gray-500 bg-gray-50 text-xs">
                                  {formatRupiah(item.price_at_distribution)}
                                </td>
                                <td className="px-5 py-3 text-center font-bold bg-indigo-50 text-indigo-800">{item.quantity_sent}</td>
                                
                                <td className="px-5 py-3 text-center">
                                  {hasWithdrawn ? <span className="font-bold text-green-700">{item.quantity_sold}</span> : '-'}
                                </td>
                                
                                <td className="px-5 py-3 text-center text-red-500 font-medium">
                                   {hasWithdrawn ? item.quantity_damaged_at_location : '-'}
                                </td>
                                
                                <td className="px-5 py-3 text-right font-bold text-gray-800">
                                  {hasWithdrawn ? formatRupiah(itemBill) : '-'}
                                </td>
                                
                                <td className="px-5 py-3 text-center">
                                  {!hasWithdrawn ? (
                                    <button
                                        onClick={() => handleReconcileAndRestock(item)}
                                        className="bg-indigo-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-indigo-700 text-xs font-medium flex items-center gap-1 mx-auto transition-all transform hover:scale-105"
                                        title="Hitung setoran dan restock otomatis"
                                    >
                                        <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                                        Setor & Restock
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                        <ArrowRightCircle size={14}/> Selesai
                                    </span>
                                  )}
                                </td>
                              </tr>
                             );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                  <Calculator className="mx-auto text-gray-200 mb-3" size={48}/>
                  <p className="text-gray-400 font-medium">Tidak ada data untuk periode / filter ini.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: MITRA KIOS ===================== */}
        {activeTab === 'kiosks' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Form Tambah Mitra */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> Tambah Mitra Baru
              </h2>
              <form onSubmit={handleAddKioskWithTemplate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nama Kios</label>
                  <input type="text" required value={newKiosk.name} onChange={e => setNewKiosk({...newKiosk, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500" placeholder="Contoh: Kios Bu Siti" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Area / Rute</label>
                  <select required value={newKiosk.area} onChange={e => setNewKiosk({...newKiosk, area: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500">
                    <option value="">-- Pilih Area --</option>
                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Lengkap</label>
                  <textarea value={newKiosk.address} onChange={e => setNewKiosk({...newKiosk, address: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" rows="2" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Link Google Maps</label>
                  <input type="url" value={newKiosk.gmaps_link} onChange={e => setNewKiosk({...newKiosk, gmaps_link: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" placeholder="https://maps..." />
                </div>

                <hr className="border-gray-100 my-4" />
                
                {/* Template Barang Rutin */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-2">Rencana Titipan Rutin (Opsional)</label>
                  <div className="flex gap-2 mb-2">
                     <select value={tempTemplateCake} onChange={e => setTempTemplateCake(e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded">
                       <option value="">Pilih Kue</option>
                       {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <input type="number" value={tempTemplateQty} onChange={e => setTempTemplateQty(e.target.value)} placeholder="Qty" className="w-16 px-2 py-1 text-sm border rounded"/>
                     <button type="button" onClick={handleAddTemplateItem} className="bg-orange-600 text-white px-2 rounded text-xs">+</button>
                  </div>
                  {kioskTemplateItems.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {kioskTemplateItems.map((t, idx) => (
                        <li key={idx} className="text-xs flex justify-between bg-white px-2 py-1 rounded border border-orange-100">
                          <span>{t.cake_name}</span>
                          <span className="font-bold">{t.quantity} pcs</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 mt-4">Simpan Mitra & Template</button>
              </form>
            </div>

            {/* List Kios grouped by Area */}
            <div className="lg:col-span-2 space-y-4">
               {ROUTES.map(area => {
                 const areaKiosks = kiosks.filter(k => k.area === area);
                 if (areaKiosks.length === 0) return null;
                 return (
                   <div key={area} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700 flex justify-between">
                       <span>{area}</span>
                       <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{areaKiosks.length} Mitra</span>
                     </div>
                     <div className="p-4 grid gap-3 sm:grid-cols-2">
                       {areaKiosks.map(k => (
                         <div key={k.id} className={`border p-3 rounded-lg transition-colors relative group ${k.is_active ? 'bg-white hover:border-indigo-400' : 'bg-gray-100 border-gray-200 opacity-75'}`}>
                           
                           {/* Status Badge */}
                           <div className="absolute top-3 right-3 flex gap-2">
                               {!k.is_active && (
                                   <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">NON-AKTIF</span>
                               )}
                               <button 
                                 onClick={() => handleToggleKioskStatus(k)}
                                 className={`p-1 rounded-full transition-colors ${k.is_active ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                 title={k.is_active ? "Non-aktifkan Mitra" : "Aktifkan Mitra"}
                               >
                                 {k.is_active ? <PowerOff size={16}/> : <Power size={16}/>}
                               </button>
                           </div>

                           <div className="pr-10">
                              <h4 className={`font-bold ${!k.is_active ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{k.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{k.address}</p>
                              {k.gmaps_link && <a href={k.gmaps_link} target="_blank" rel="noreferrer" className="text-blue-600"><MapPin size={18}/></a>}
                           </div>
                           
                           {/* Tampilkan info template kecil */}
                           {k.kiosk_consignment_templates?.length > 0 ? (
                             <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
                               <span className="font-semibold block mb-1">Titipan Rutin:</span>
                               <div className="flex flex-wrap gap-1">
                                 {k.kiosk_consignment_templates.map((t, i) => (
                                   <span key={i} className="bg-white border px-1 rounded">{t.cakes?.name}: {t.default_quantity}</span>
                                 ))}
                               </div>
                             </div>
                           ) : (
                             <div className="mt-2 text-[10px] text-gray-400 italic">Belum ada template rutin</div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
