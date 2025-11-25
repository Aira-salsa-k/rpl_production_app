import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

import { 
  MapPin, Plus, Store, Trash2, Calendar, Filter, Calculator, 
  RefreshCw, Save, ArrowRightCircle, Power, PowerOff, Edit2, 
  X, Check, PlusCircle, ChevronDown, ChevronUp, Package 
} from 'lucide-react'; 

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
  const [filterMonth, setFilterMonth] = useState(''); 
  
  // Form Create Distribution States
  const [selectedArea, setSelectedArea] = useState(''); 
  const [selectedKioskId, setSelectedKioskId] = useState('');
  const [distDate, setDistDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]); 
  const [manualCakeId, setManualCakeId] = useState('');
  const [manualQty, setManualQty] = useState('');
  
  // Form Create Kiosk States
  const [newKiosk, setNewKiosk] = useState({ name: '', area: '', address: '', gmaps_link: '' });
  const [kioskTemplateItems, setKioskTemplateItems] = useState([]); 
  const [tempTemplateCake, setTempTemplateCake] = useState('');
  const [tempTemplateQty, setTempTemplateQty] = useState('');

  // EDIT MODE STATE
  const [editingDistId, setEditingDistId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFilterMonth(currentMonth);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      const [distData, cakesData, kiosksData] = await Promise.all([
        supabase
          .from('distributions')
          .select(`
            id, distribution_date, kiosk_id,
            kiosks ( name, area, address, gmaps_link, is_active ),
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
      
      if (distData.error) throw distData.error;
      if (cakesData.error) throw cakesData.error;
      if (kiosksData.error) throw kiosksData.error;
      
      setDistributions(distData.data || []);
      setCakes(cakesData.data || []);
      setKiosks(kiosksData.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE TEMPLATE FUNCTION ---
  const updateKioskTemplate = async (kioskId, newItems) => {
    if (!kioskId || !newItems || newItems.length === 0) {
      console.log('No items to update template');
      return;
    }

    const supabase = getSupabaseWithAuth();
    
    try {
      console.log('Updating template for kiosk:', kioskId, 'with items:', newItems);

      // Hapus template lama
      const { error: deleteError } = await supabase
        .from('kiosk_consignment_templates')
        .delete()
        .eq('kiosk_id', kioskId);

      if (deleteError) throw deleteError;

      // Buat template baru
      const templatePayload = newItems.map(item => ({
        kiosk_id: kioskId,
        cake_id: item.cake_id,
        default_quantity: item.quantity_sent || item.quantity
      }));

      const { error: insertError } = await supabase
        .from('kiosk_consignment_templates')
        .insert(templatePayload);

      if (insertError) throw insertError;

      console.log('✅ Template successfully updated');
    } catch (err) {
      console.error('❌ Failed to update template:', err);
      throw err;
    }
  };

  // --- EDITING LOGIC ---
  const handleStartEdit = (dist) => {
    setEditingDistId(dist.id);
    const flatItems = dist.distribution_items.map(i => ({
      id: i.id,
      cake_id: i.cake_id.id,
      cake_name: i.cake_id.name,
      quantity_sent: i.quantity_sent
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
      quantity_sent: 0
    }]);
  };

  const handleSaveEdit = async () => {
    if (editItems.some(i => !i.cake_id || i.quantity_sent <= 0)) {
      return alert("Pastikan semua item memiliki jenis kue dan jumlah > 0");
    }

    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const payload = editItems.map(i => ({
        cake_id: i.cake_id,
        quantity_sent: i.quantity_sent,
        ...(i.id && { id: i.id })
      }));

      const { error } = await supabase.rpc('update_distribution_shipment', {
        p_dist_id: editingDistId,
        p_items: payload
      });

      if (error) throw error;

      // Update template setelah edit
      const editedDist = distributions.find(d => d.id === editingDistId);
      if (editedDist && editedDist.kiosk_id) {
        await updateKioskTemplate(editedDist.kiosk_id, editItems);
      }

      alert("Data titipan berhasil diperbarui dan template diupdate!");
      setEditingDistId(null);
      setEditItems([]);
      setTimeout(() => fetchData(), 500);
      
    } catch (err) {
      console.error('Edit error:', err);
      alert("Gagal update: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- BULK RECONCILE ---
  const handleBulkReconcile = async (dist) => {
    const reconcileData = [];
    
    for (const item of dist.distribution_items) {
      const damaged = parseInt(prompt(
        `SETORAN KUE: ${item.cake_id.name}\nTotal Titip Awal: ${item.quantity_sent} pcs\nMasukkan Jumlah RUSAK / BASI:`, 
        "0"
      ));
      
      if (damaged === null) return;
      if (isNaN(damaged) || damaged < 0) {
        alert("Angka rusak tidak valid!");
        return;
      }
      
      const sold = item.quantity_sent - damaged;
      if (sold < 0) {
        alert(`Rusak (${damaged}) melebihi titipan (${item.quantity_sent})!`);
        return;
      }

      const nextRestockQty = parseInt(prompt(
        `JUMLAH TITIPAN BARU (RESTOCK) untuk ${item.cake_id.name}:\nUbah jika perlu:`, 
        item.quantity_sent.toString()
      ));
      
      if (nextRestockQty === null) return;
      if (isNaN(nextRestockQty) || nextRestockQty < 0) {
        alert("Jumlah restock harus angka positif!");
        return;
      }

      reconcileData.push({
        item_id: item.id,
        damaged: damaged,
        next_restock_qty: nextRestockQty
      });
    }

    const summary = reconcileData.map(rd => {
      const item = dist.distribution_items.find(i => i.id === rd.item_id);
      const sold = item.quantity_sent - rd.damaged;
      return `${item.cake_id.name}: Laku ${sold}pcs, Rusak ${rd.damaged}pcs, Restock ${rd.next_restock_qty}pcs`;
    }).join('\n');

    const totalBill = reconcileData.reduce((total, rd) => {
      const item = dist.distribution_items.find(i => i.id === rd.item_id);
      const sold = item.quantity_sent - rd.damaged;
      return total + (sold * item.price_at_distribution);
    }, 0);

    const confirmMsg = `SUMMARY SETORAN:\n\n${summary}\n\nTOTAL TAGIHAN: ${formatRupiah(totalBill)}\n\nProses setoran?`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const { error } = await supabase.rpc('reconcile_distribution_bundle', {
        p_dist_id: dist.id,
        p_damaged_items: reconcileData
      });

      if (error) throw error;

      // Update template setelah reconcile
      const templateItems = reconcileData.map(rd => {
        const item = dist.distribution_items.find(i => i.id === rd.item_id);
        return {
          cake_id: item.cake_id.id,
          quantity: rd.next_restock_qty,
          quantity_sent: rd.next_restock_qty
        };
      });

      await updateKioskTemplate(dist.kiosk_id, templateItems);

      alert(`Setoran berhasil! Total tagihan: ${formatRupiah(totalBill)} dan template diperbarui`);
      fetchData();
    } catch (err) {
      alert("Gagal proses setoran: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SINGLE ITEM RECONCILE ---
  const handleReconcileAndRestock = async (item, dist) => {
    const damagedInput = prompt(`SETORAN KUE: ${item.cake_id.name}\nTotal Titip Awal: ${item.quantity_sent} pcs\nMasukkan Jumlah RUSAK / BASI:`, "0");
    if (damagedInput === null) return;
    
    const damaged = parseInt(damagedInput);
    if (isNaN(damaged) || damaged < 0) return alert("Angka rusak tidak valid!");
    
    const sold = item.quantity_sent - damaged;
    if (sold < 0) return alert(`Rusak (${damaged}) melebihi titipan (${item.quantity_sent})!`);

    const nextRestockInput = prompt(`JUMLAH TITIPAN BARU (RESTOCK):\nUbah jika perlu:`, item.quantity_sent.toString());
    if (nextRestockInput === null) return;
    
    const nextRestockQty = parseInt(nextRestockInput);
    if (isNaN(nextRestockQty) || nextRestockQty < 0) return alert("Jumlah restock harus angka positif!");

    const confirmMsg = `Laku: ${sold} pcs\nRusak: ${damaged} pcs\nTAGIHAN: ${formatRupiah(sold * item.price_at_distribution)}\nRESTOCK: ${nextRestockQty} pcs\n\nProses?`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const { error } = await supabase.rpc('reconcile_distribution_bundle', {
        p_dist_id: dist.id,
        p_damaged_items: [{
          item_id: item.id,
          damaged: damaged,
          next_restock_qty: nextRestockQty
        }]
      });

      if (error) throw error;

      // Update template
      await updateKioskTemplate(dist.kiosk_id, [{
        cake_id: item.cake_id.id,
        quantity: nextRestockQty,
        quantity_sent: nextRestockQty
      }]);

      alert(`Berhasil! Tagihan: ${formatRupiah(sold * item.price_at_distribution)}`);
      fetchData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- IMPROVED AUTO-FILL LOGIC ---
  useEffect(() => {
    if (selectedKioskId) {
      const kiosk = kiosks.find(k => k.id === selectedKioskId);
      
      // 1. Ambil dari template
      const templateItems = kiosk?.kiosk_consignment_templates?.map(t => {
        const masterCake = cakes.find(c => c.id === t.cake_id);
        return {
          tempId: Date.now() + Math.random(),
          cake_id: t.cake_id,
          cake_name: t.cakes?.name || 'Unknown',
          quantity: t.default_quantity,
          price: masterCake?.price_per_piece || 0,
          current_stock: masterCake?.current_stock || 0,
          source: 'template'
        };
      }) || [];

      // 2. Ambil dari distribusi aktif terakhir
      const latestActiveDistribution = distributions
        .filter(d => 
          d.kiosk_id === selectedKioskId && 
          !d.distribution_items?.every(item => item.withdrawal_date)
        )
        .sort((a, b) => new Date(b.distribution_date) - new Date(a.distribution_date))[0];

      const historyItems = latestActiveDistribution?.distribution_items
        ?.filter(item => !item.withdrawal_date)
        .map(item => ({
          tempId: Date.now() + Math.random(),
          cake_id: item.cake_id.id,
          cake_name: item.cake_id.name,
          quantity: item.quantity_sent,
          price: item.price_at_distribution,
          current_stock: cakes.find(c => c.id === item.cake_id.id)?.current_stock || 0,
          source: 'history'
        })) || [];

      // 3. Gabungkan: prioritaskan history
      const combinedItems = [];
      const usedCakeIds = new Set();

      historyItems.forEach(item => {
        combinedItems.push(item);
        usedCakeIds.add(item.cake_id);
      });

      templateItems.forEach(item => {
        if (!usedCakeIds.has(item.cake_id)) {
          combinedItems.push(item);
          usedCakeIds.add(item.cake_id);
        }
      });

      setItems(combinedItems);
    } else {
      setItems([]);
    }
  }, [selectedKioskId, kiosks, cakes, distributions]);

  // --- DISTRIBUTION CREATION ---
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

      // Update template
      await updateKioskTemplate(selectedKioskId, items);

      alert('Distribusi baru tercatat dan template diperbarui!');
      setItems([]);
      setSelectedKioskId('');
      setTimeout(() => fetchData(), 500);
      
    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TOGGLE CARD EXPAND ---
  const toggleCardExpand = (distId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(distId)) {
      newExpanded.delete(distId);
    } else {
      newExpanded.add(distId);
    }
    setExpandedCards(newExpanded);
  };

  // --- KIOSK MANAGEMENT ---
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

  // --- HELPERS ---
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
      current_stock: cake.current_stock,
      source: 'manual'
    }]);
    setManualCakeId(''); 
    setManualQty('');
  };

  // --- FILTERS ---
  const filteredHistory = distributions.filter(d => {
    if (filterArea !== 'Semua' && d.kiosks?.area !== filterArea) return false;
    if (filterMonth) {
      const distDate = d.distribution_date.substring(0, 7);
      let match = distDate === filterMonth;
      if (!match && d.distribution_items.some(item => item.withdrawal_date && item.withdrawal_date.substring(0, 7) === filterMonth)) match = true;
      if (!match) return false;
    }
    return true;
  });

  const filteredKiosksForInput = kiosks.filter(k => k.is_active && (selectedArea ? k.area === selectedArea : true));

  if (loading) return <div className="p-8 text-center flex flex-col items-center justify-center"><RefreshCw className="animate-spin mb-2"/> Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Distribusi</h1>
            <p className="text-gray-500 text-sm">Sistem Titipan, Tagihan & Auto-Restock</p>
          </div>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
            <button 
              onClick={() => setActiveTab('distribution')} 
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'distribution' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Distribusi
            </button>
            <button 
              onClick={() => setActiveTab('kiosks')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${activeTab === 'kiosks' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Store size={16} /> Data Mitra
            </button>
          </div>
        </div>

        {activeTab === 'distribution' && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* FORM INPUT */}
            <div className="lg:col-span-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <div className="border-b pb-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600"/> Titipan Baru
                  </h2>
                </div>
                <form onSubmit={handleCreateDistribution} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">1. Area</label>
                    <select 
                      value={selectedArea} 
                      onChange={e => { setSelectedArea(e.target.value); setSelectedKioskId(''); setItems([]); }} 
                      className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg"
                    >
                      <option value="">-- Pilih Area --</option>
                      {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">2. Kios</label>
                    <select 
                      value={selectedKioskId} 
                      onChange={e => setSelectedKioskId(e.target.value)} 
                      className="w-full px-3 py-2 border rounded-lg" 
                      required
                    >
                      <option value="">-- Pilih Kios --</option>
                      {filteredKiosksForInput.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      value={distDate} 
                      onChange={e => setDistDate(e.target.value)} 
                      className="w-full px-3 py-2 border rounded-lg" 
                      required 
                    />
                  </div>
                  <hr className="border-gray-100 my-2" />
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">3. Daftar Kue</label>
                      <span className="text-xs text-gray-500">
                        {items.filter(i => i.source === 'history').length} history, 
                        {items.filter(i => i.source === 'template').length} template
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <select 
                        value={manualCakeId} 
                        onChange={e => setManualCakeId(e.target.value)} 
                        className="flex-1 px-2 py-2 border rounded-lg text-sm bg-white"
                      >
                        <option value="">+ Tambah Manual</option>
                        {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input 
                        type="number" 
                        value={manualQty} 
                        onChange={e => setManualQty(e.target.value)} 
                        placeholder="Qty" 
                        className="w-16 px-2 py-2 border rounded-lg text-sm bg-white" 
                      />
                      <button 
                        type="button" 
                        onClick={handleAddManualItem} 
                        className="bg-gray-800 text-white px-3 rounded-lg hover:bg-black text-sm"
                      >
                        +
                      </button>
                    </div>
                    {items.map((item) => (
                      <div key={item.tempId} className="flex justify-between items-center bg-white px-3 py-2 rounded text-sm border border-gray-200 shadow-sm mb-2">
                        <div>
                          <span>{item.cake_name}</span>
                          <span className={`text-xs ml-2 px-1 rounded ${
                            item.source === 'history' ? 'bg-blue-100 text-blue-600' : 
                            item.source === 'template' ? 'bg-orange-100 text-orange-600' : 
                            'bg-green-100 text-green-600'
                          }`}>
                            {item.source === 'history' ? 'History' : item.source === 'template' ? 'Template' : 'Manual'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => setItems(items.filter(i => i.tempId !== item.tempId))} 
                            className="text-red-400"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || items.length === 0} 
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? '...' : <><Save size={16}/> Simpan</>}
                  </button>
                </form>
              </div>
            </div>

            {/* DISTRIBUTION LIST */}
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

              {filteredHistory.map((dist) => {
                const totalBill = dist.distribution_items.reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);
                const isFullyReconciled = dist.distribution_items.every(item => item.withdrawal_date);
                const isEditing = editingDistId === dist.id;
                const isExpanded = expandedCards.has(dist.id);
                const totalItems = dist.distribution_items.length;
                const activeItems = dist.distribution_items.filter(item => !item.withdrawal_date).length;

                return (
                  <div key={dist.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                    isFullyReconciled ? 'border-green-200 ring-1 ring-green-100' : 
                    !dist.kiosks?.is_active ? 'border-red-200 ring-1 ring-red-100' : 
                    'border-l-4 border-l-yellow-400 border-gray-200'
                  }`}>
                    
                    {/* CARD HEADER - ALWAYS VISIBLE */}
                    <div className={`px-6 py-4 border-b ${
                      isFullyReconciled ? 'bg-green-50' : 
                      !dist.kiosks?.is_active ? 'bg-red-50' : 
                      'bg-white'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        {/* LEFT INFO */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm">
                              {dist.kiosks?.area}
                            </span>
                            <h3 className="font-bold text-lg text-gray-900">
                              {dist.kiosks?.name}
                            </h3>
                            {!dist.kiosks?.is_active && (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                NON-AKTIF
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14}/> 
                              {new Date(dist.distribution_date).toLocaleDateString('id-ID')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package size={14}/>
                              {totalItems} jenis kue • {activeItems} aktif
                            </span>
                          </div>
                        </div>

                        {/* RIGHT ACTIONS */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={handleSaveEdit} 
                                disabled={isSubmitting}
                                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-green-700"
                              >
                                <Check size={14}/> Simpan
                              </button>
                              <button 
                                onClick={handleCancelEdit} 
                                disabled={isSubmitting}
                                className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-gray-600"
                              >
                                <X size={14}/> Batal
                              </button>
                            </div>
                          ) : (
                            !isFullyReconciled && dist.kiosks?.is_active && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleStartEdit(dist)} 
                                  className="flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
                                >
                                  <Edit2 size={14}/> Edit
                                </button>
                                <button 
                                  onClick={() => handleBulkReconcile(dist)} 
                                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-green-700"
                                >
                                  <RefreshCw size={14}/> Setor Semua
                                </button>
                              </div>
                            )
                          )}

                          {/* STATUS BADGE */}
                          <div className={`text-right px-3 py-1 rounded-lg border ml-2 ${
                            isFullyReconciled ? 'bg-green-100 border-green-200' :
                            !dist.kiosks?.is_active ? 'bg-red-100 border-red-200' :
                            'bg-yellow-50 border-yellow-200'
                          }`}>
                            <div className={`text-[10px] uppercase font-bold ${
                              isFullyReconciled ? 'text-green-700' :
                              !dist.kiosks?.is_active ? 'text-red-700' :
                              'text-yellow-700'
                            }`}>
                              {isFullyReconciled ? 'Total' : 'Status'}
                            </div>
                            <div className={`text-sm font-bold ${
                              isFullyReconciled ? 'text-green-700' :
                              !dist.kiosks?.is_active ? 'text-red-700' :
                              'text-yellow-600'
                            }`}>
                              {isFullyReconciled ? formatRupiah(totalBill) : 
                               !dist.kiosks?.is_active ? 'Non-Aktif' : 'Aktif'}
                            </div>
                          </div>

                          {/* EXPAND BUTTON */}
                          <button
                            onClick={() => toggleCardExpand(dist.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDABLE CONTENT */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        {isEditing ? (
                          // EDIT MODE
                          <div className="p-4 bg-yellow-50/50">
                            <table className="w-full text-sm">
                              <thead className="text-gray-500 border-b border-yellow-200">
                                <tr>
                                  <th className="px-4 py-2 text-left">Jenis Kue</th>
                                  <th className="px-4 py-2 text-center">Jumlah Titip</th>
                                  <th className="px-4 py-2 text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {editItems.map((item, idx) => (
                                  <tr key={idx} className="border-b border-yellow-100 bg-white">
                                    <td className="px-4 py-2">
                                      {item.id ? (
                                        <span className="font-bold text-gray-700">{item.cake_name}</span>
                                      ) : (
                                        <select 
                                          value={item.cake_id} 
                                          onChange={(e) => handleEditItemChange(idx, 'cake_id', e.target.value)}
                                          className="w-full border rounded px-2 py-1 text-sm"
                                        >
                                          <option value="">-- Pilih Kue --</option>
                                          {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <input 
                                        type="number" 
                                        value={item.quantity_sent}
                                        onChange={(e) => handleEditItemChange(idx, 'quantity_sent', e.target.value)}
                                        min="0"
                                        className="w-20 text-center border border-yellow-300 rounded py-1 px-2 font-bold text-indigo-700 focus:ring-2 focus:ring-yellow-400 outline-none"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <button 
                                        onClick={() => handleRemoveEditItem(idx)}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                      >
                                        <Trash2 size={16}/>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button 
                              onClick={handleAddEditItem} 
                              className="mt-3 flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800"
                            >
                              <PlusCircle size={16}/> Tambah Jenis Kue Lain
                            </button>
                          </div>
                        ) : (
                          // VIEW MODE
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
                                    </td>
                                    <td className="px-5 py-3 text-center text-gray-500 bg-gray-50 text-xs">
                                      {formatRupiah(item.price_at_distribution)}
                                    </td>
                                    <td className="px-5 py-3 text-center font-bold bg-indigo-50 text-indigo-800">
                                      {item.quantity_sent}
                                    </td>
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
                                      {!hasWithdrawn && dist.kiosks?.is_active ? (
                                        <button 
                                          onClick={() => handleReconcileAndRestock(item, dist)} 
                                          className="bg-indigo-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-indigo-700 text-xs font-medium flex items-center gap-1 mx-auto transition-all transform hover:scale-105"
                                        >
                                          <RefreshCw size={14}/> Setor
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                  <Calculator className="mx-auto text-gray-200 mb-3" size={48}/>
                  <p className="text-gray-400 font-medium">Tidak ada data.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KIOSKS TAB */}
        {activeTab === 'kiosks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* ADD KIOSK FORM */}
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> Tambah Mitra Baru
              </h2>
              <form onSubmit={handleAddKioskWithTemplate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nama Kios</label>
                  <input 
                    type="text" 
                    required 
                    value={newKiosk.name} 
                    onChange={e => setNewKiosk({...newKiosk, name: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500" 
                    placeholder="Contoh: Kios Bu Siti" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Area / Rute</label>
                  <select 
                    required 
                    value={newKiosk.area} 
                    onChange={e => setNewKiosk({...newKiosk, area: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Area --</option>
                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Lengkap</label>
                  <textarea 
                    value={newKiosk.address} 
                    onChange={e => setNewKiosk({...newKiosk, address: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg" 
                    rows="2" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Link Google Maps</label>
                  <input 
                    type="url" 
                    value={newKiosk.gmaps_link} 
                    onChange={e => setNewKiosk({...newKiosk, gmaps_link: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg" 
                    placeholder="https://maps..." 
                  />
                </div>

                <hr className="border-gray-100 my-4" />
                
                {/* TEMPLATE SECTION */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <label className="block text-xs font-bold text-orange-800 uppercase mb-2">Rencana Titipan Rutin (Opsional)</label>
                  <div className="flex gap-2 mb-2">
                    <select 
                      value={tempTemplateCake} 
                      onChange={e => setTempTemplateCake(e.target.value)} 
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    >
                      <option value="">Pilih Kue</option>
                      {cakes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input 
                      type="number" 
                      value={tempTemplateQty} 
                      onChange={e => setTempTemplateQty(e.target.value)} 
                      placeholder="Qty" 
                      className="w-16 px-2 py-1 text-sm border rounded"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTemplateItem} 
                      className="bg-orange-600 text-white px-2 rounded text-xs"
                    >
                      +
                    </button>
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

                <button 
                  disabled={isSubmitting} 
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 mt-4"
                >
                  Simpan Mitra & Template
                </button>
              </form>
            </div>

            {/* KIOSKS LIST */}
            <div className="lg:col-span-2 space-y-4">
              {ROUTES.map(area => {
                const areaKiosks = kiosks.filter(k => k.area === area);
                if (areaKiosks.length === 0) return null;
                
                return (
                  <div key={area} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700 flex justify-between">
                      <span>{area}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {areaKiosks.length} Mitra
                      </span>
                    </div>
                    <div className="p-4 grid gap-3 sm:grid-cols-2">
                      {areaKiosks.map(k => (
                        <div key={k.id} className={`border p-3 rounded-lg transition-colors relative group ${
                          k.is_active ? 'bg-white hover:border-indigo-400' : 'bg-gray-100 border-gray-200 opacity-75'
                        }`}>
                          
                          {/* STATUS BADGE */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            {!k.is_active && (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                NON-AKTIF
                              </span>
                            )}
                            <button 
                              onClick={() => handleToggleKioskStatus(k)}
                              className={`p-1 rounded-full transition-colors ${
                                k.is_active ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 
                                'text-gray-400 hover:text-green-500 hover:bg-green-50'
                              }`}
                              title={k.is_active ? "Non-aktifkan Mitra" : "Aktifkan Mitra"}
                            >
                              {k.is_active ? <PowerOff size={16}/> : <Power size={16}/>}
                            </button>
                          </div>

                          <div className="pr-10">
                            <h4 className={`font-bold ${
                              !k.is_active ? 'text-gray-500 line-through' : 'text-gray-800'
                            }`}>
                              {k.name}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">{k.address}</p>
                            {k.gmaps_link && (
                              <a href={k.gmaps_link} target="_blank" rel="noreferrer" className="text-blue-600">
                                <MapPin size={18}/>
                              </a>
                            )}
                          </div>
                          
                          {/* TEMPLATE INFO */}
                          {k.kiosk_consignment_templates?.length > 0 ? (
                            <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
                              <span className="font-semibold block mb-1">Titipan Rutin:</span>
                              <div className="flex flex-wrap gap-1">
                                {k.kiosk_consignment_templates.map((t, i) => (
                                  <span key={i} className="bg-white border px-1 rounded">
                                    {t.cakes?.name}: {t.default_quantity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-[10px] text-gray-400 italic">
                              Belum ada template rutin
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}