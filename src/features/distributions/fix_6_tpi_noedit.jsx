import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

import { 
  MapPin, Plus, Store, Trash2, Calendar, Filter, Calculator, 
  RefreshCw, Save, ArrowRightCircle, Power, PowerOff, Edit2, 
  X, Check, PlusCircle, ChevronDown, ChevronUp, Package,
  History, DollarSign, Truck, ClipboardList, Settings, Edit3,

} from 'lucide-react'; 


import DeliveriesTab from '../../components/DeliveriesTab';
import { deliveryFunctions } from '../../utils/DeliveryFunctions';

const ROUTES = ['Arso 1', 'Arso 2', 'Arso Kota', 'Koya Barat', 'Koya Timur', 'Nimbokrang', 'Sentani'];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function Distributions() {
  const [activeTab, setActiveTab] = useState('distribution'); 
  const { getSupabaseWithAuth } = useAuth();
  
  // Data States
  const [distributions, setDistributions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [kiosks, setKiosks] = useState([]); 
  const [dailyPrices, setDailyPrices] = useState({});
  
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
  const [newKiosk, setNewKiosk] = useState({ 
    name: '', 
    area: '', 
    address: '', 
    detailed_address: '',
    gmaps_link: '', 
    contact_person: '',
    phone_number: '',
    notes: ''
  });
  const [kioskTemplateItems, setKioskTemplateItems] = useState([]); 
  const [tempTemplateCake, setTempTemplateCake] = useState('');
  const [tempTemplateQty, setTempTemplateQty] = useState('');

  // EDIT MODE STATE
  const [editingDistId, setEditingDistId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [expandedReconcileHistory, setExpandedReconcileHistory] = useState(new Set());
  
  // MODAL STATES
  const [showKioskDetail, setShowKioskDetail] = useState(null);
  const [showPriceManager, setShowPriceManager] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // State untuk form pengantaran baru
const [showDeliveryForm, setShowDeliveryForm] = useState(false);
const [deliveryForm, setDeliveryForm] = useState({
  delivery_date: new Date().toISOString().split('T')[0],
  notes: '',
  stores: [{ store_id: '', items: [] }]
});



// Fungsi untuk membuat pengantaran baru
// Di dalam Distributions.jsx, tambahkan fungsi ini:

// Fungsi untuk membuat pengantaran baru
 const handleCreateDelivery = async (deliveryData) => {
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      const result = await deliveryFunctions.createDelivery(deliveryData, supabase);
      if (result.success) {
        alert(result.message);
        fetchData();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Create delivery error:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk view delivery
  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  };

  // Fungsi untuk confirm delivery
  const handleConfirmDelivery = async (deliveryId) => {
    const result = await deliveryFunctions.confirmDelivery(deliveryId, getSupabaseWithAuth());
    if (result.success) {
      alert(result.message);
      fetchData();
    } else {
      alert(result.message);
    }
  };

// Update pemanggilan DeliveriesTab:
{activeTab === 'deliveries' && (
  <DeliveriesTab 
    deliveries={deliveries}
    onConfirmDelivery={handleConfirmDelivery}
    onViewDelivery={handleViewDelivery}
    selectedDelivery={selectedDelivery}
    showDeliveryModal={showDeliveryModal}
    onCloseDeliveryModal={() => {
      setShowDeliveryModal(false);
      setSelectedDelivery(null);
    }}
    onCreateDelivery={handleCreateDelivery}
    cakes={cakes} // Hanya kirim cakes, tidak perlu stores
  />
)}

// Handler untuk form pengantaran
const addStoreToDelivery = () => {
  setDeliveryForm(prev => ({
    ...prev,
    stores: [...prev.stores, { store_id: '', items: [] }]
  }));
};

const removeStoreFromDelivery = (index) => {
  if (deliveryForm.stores.length > 1) {
    setDeliveryForm(prev => ({
      ...prev,
      stores: prev.stores.filter((_, i) => i !== index)
    }));
  }
};

const addItemToStore = (storeIndex) => {
  const newStores = [...deliveryForm.stores];
  newStores[storeIndex].items.push({
    cake_id: '',
    quantity: ''
  });
  setDeliveryForm(prev => ({ ...prev, stores: newStores }));
};

const handleDeliveryStoreChange = (storeIndex, storeId) => {
  const newStores = [...deliveryForm.stores];
  newStores[storeIndex].store_id = storeId;
  setDeliveryForm(prev => ({ ...prev, stores: newStores }));
};

const handleDeliveryItemChange = (storeIndex, itemIndex, field, value) => {
  const newStores = [...deliveryForm.stores];
  newStores[storeIndex].items[itemIndex][field] = value;
  setDeliveryForm(prev => ({ ...prev, stores: newStores }));
};

  useEffect(() => {
    fetchData();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFilterMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (distDate) {
      fetchDailyPrices(distDate);
    }
  }, [distDate]);

 const fetchData = async () => {
  setLoading(true);
  const supabase = getSupabaseWithAuth();

  try {
    // Validasi user terlebih dahulu
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User tidak terautentikasi');
    }

    const [distData, cakesData, kiosksData, deliveriesData] = await Promise.all([
      supabase
        .from('distributions')
        .select(`
          id, distribution_date, kiosk_id, user_id,
          kiosks ( id, name, area, address, detailed_address, gmaps_link, contact_person, phone_number, notes, is_active ),
          distribution_items (
            id, quantity_sent, quantity_sold, quantity_damaged_at_location,
            price_at_distribution, withdrawal_date,
            cake_id ( id, name )
          )
        `)
        .eq('user_id', user.id) // Filter berdasarkan user_id
        .order('distribution_date', { ascending: false }),
      
      supabase.from('cakes')
        .select('*')
        .eq('user_id', user.id) // Filter berdasarkan user_id
        .order('name'),
      
      supabase.from('kiosks')
        .select(`
          *,
          kiosk_consignment_templates (
            cake_id, default_quantity,
            cakes ( name, price_per_piece ) 
          )
        `)
        .eq('user_id', user.id) // Filter berdasarkan user_id
        .order('name'),
      
      supabase
        .from('deliveries')
        .select(`
          id, delivery_date, status, total_value, notes, created_at, updated_at,
          delivery_items (
            id, quantity_delivered, unit_price, total_price, is_returned, return_quantity, return_reason,
            store_id ( id, name, address ),
            cake_id ( id, name )
          )
        `)
        .eq('user_id', user.id) // Filter berdasarkan user_id
        .order('delivery_date', { ascending: false })
    ]);
    
    if (distData.error) throw distData.error;
    if (cakesData.error) throw cakesData.error;
    if (kiosksData.error) throw kiosksData.error;
    if (deliveriesData.error) throw deliveriesData.error;
    
    setDistributions(distData.data || []);
    setCakes(cakesData.data || []);
    setKiosks(kiosksData.data || []);
    setDeliveries(deliveriesData.data || []);
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.message === 'User tidak terautentikasi') {
      alert('Sesi Anda telah habis. Silakan login kembali.');
      // Redirect ke login page atau refresh page
      window.location.reload();
    }
  } finally {
    setLoading(false);
  }
};

const fetchDailyPrices = async (date) => {
  const supabase = getSupabaseWithAuth();
  const { data } = await supabase
    .from('daily_prices')
    .select('cake_id, selling_price')
    .eq('price_date', date);
  
  const pricesMap = {};
  data?.forEach(item => {
    pricesMap[item.cake_id] = item.selling_price;
  });
  
  // Gabungkan dengan harga default dari cakes
  const combinedPrices = {};
  cakes.forEach(cake => {
    combinedPrices[cake.id] = pricesMap[cake.id] !== undefined 
      ? pricesMap[cake.id] 
      : cake.price_per_piece;
  });
  
  setDailyPrices(combinedPrices);
};


  // --- GROUP DISTRIBUTIONS BY PARENT ---
  const groupDistributionsByParent = () => {
    const grouped = {};
    
    distributions.forEach(dist => {
      const hasWithdrawnItems = dist.distribution_items.some(item => item.withdrawal_date);
      
      if (hasWithdrawnItems) {
        const parentDate = new Date(dist.distribution_date);
        const parentKey = `${dist.kiosk_id}-${parentDate.toISOString().split('T')[0]}`;
        
        if (!grouped[parentKey]) {
          grouped[parentKey] = {
            parent: dist,
            reconciles: []
          };
        }
        grouped[parentKey].reconciles.push(dist);
      } else {
        const key = `${dist.kiosk_id}-${dist.id}`;
        grouped[key] = {
          parent: dist,
          reconciles: []
        };
      }
    });

    return Object.values(grouped);
  };

  // --- UPDATE TEMPLATE FUNCTION ---
  const updateKioskTemplate = async (kioskId, newItems) => {
    if (!kioskId || !newItems || newItems.length === 0) {
      console.log('No items to update template');
      return;
    }

    const supabase = getSupabaseWithAuth();
    
    try {
      const { error: deleteError } = await supabase
        .from('kiosk_consignment_templates')
        .delete()
        .eq('kiosk_id', kioskId);

      if (deleteError) throw deleteError;

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
    // Validasi user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User tidak terautentikasi. Silakan login kembali.');
    }

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
    alert("Gagal update: " + (err.message || 'Terjadi kesalahan tidak diketahui'));
  } finally {
    setIsSubmitting(false);
  }
};


  // --- BULK RECONCILE ---
  const handleBulkReconcile = async (dist) => {
  // Validasi user terlebih dahulu
  const supabase = getSupabaseWithAuth();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    alert('User tidak terautentikasi. Silakan login kembali.');
    return;
  }

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
  
  try {
    const { error } = await supabase.rpc('reconcile_distribution_bundle', {
      p_dist_id: dist.id,
      p_damaged_items: reconcileData
    });

    if (error) throw error;

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
    console.error('Bulk reconcile error:', err);
    alert("Gagal proses setoran: " + (err.message || 'Terjadi kesalahan tidak diketahui'));
  } finally {
    setIsSubmitting(false);
  }
};

  // --- SINGLE ITEM RECONCILE ---
  const handleReconcileAndRestock = async (item, dist) => {
    const damagedInput = prompt(`SETORAN KUE: ${item.cake_id.name}\nTotal Titipan: ${item.quantity_sent} pcs\nMasukkan Jumlah RUSAK / BASI:`, "0");
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
      
      const templateItems = kiosk?.kiosk_consignment_templates?.map(t => {
        const masterCake = cakes.find(c => c.id === t.cake_id);
        return {
          tempId: Date.now() + Math.random(),
          cake_id: t.cake_id,
          cake_name: t.cakes?.name || 'Unknown',
          quantity: t.default_quantity,
          price: getCakePrice(t.cake_id),
          current_stock: masterCake?.current_stock || 0,
          source: 'template'
        };
      }) || [];

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
  }, [selectedKioskId, kiosks, cakes, distributions, dailyPrices]);

  // --- DISTRIBUTION CREATION WITH DAILY PRICES ---
  // --- DISTRIBUTION CREATION WITH DAILY PRICES ---
const handleCreateDistribution = async (e) => {
  e.preventDefault();
  if (!selectedKioskId || items.length === 0) return alert("Data belum lengkap");
  setIsSubmitting(true);
  const supabase = getSupabaseWithAuth();
  
  try {
    // Validasi user terlebih dahulu
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User tidak terautentikasi. Silakan login kembali.');
    }

    const itemsPayload = items.map(i => ({
      cake_id: i.cake_id,
      quantity: i.quantity,
      price: getCakePrice(i.cake_id)
    }));
    
    const { data, error } = await supabase.rpc('record_distribution_with_daily_price', {
      kiosk_id_input: selectedKioskId,
      date_input: distDate,
      items_input: itemsPayload
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Tidak ada data yang dikembalikan dari server');
    }

    await updateKioskTemplate(selectedKioskId, items);

    alert('Distribusi baru tercatat dan template diperbarui!');
    setItems([]);
    setSelectedKioskId('');
    setTimeout(() => fetchData(), 500);
    
  } catch (err) {
    console.error('Create distribution error:', err);
    alert('Gagal: ' + (err.message || 'Terjadi kesalahan tidak diketahui'));
  } finally {
    setIsSubmitting(false);
  }
};

  // --- GET CAKE PRICE WITH DAILY FALLBACK ---
 // --- GET CAKE PRICE WITH DAILY FALLBACK ---
const getCakePrice = (cakeId, date = distDate) => {
  // Jika ada harga harian untuk tanggal tersebut, gunakan itu
  if (dailyPrices[cakeId] && dailyPrices[cakeId] > 0) {
    return dailyPrices[cakeId];
  }
  
  // Jika tidak, coba ambil dari cache dailyPrices berdasarkan date
  // atau fallback ke harga default dari cakes
  const cake = cakes.find(c => c.id === cakeId);
  return cake?.price_per_piece || 0;
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

  // --- TOGGLE RECONCILE HISTORY EXPAND ---
  const toggleReconcileHistoryExpand = (distId) => {
    const newExpanded = new Set(expandedReconcileHistory);
    if (newExpanded.has(distId)) {
      newExpanded.delete(distId);
    } else {
      newExpanded.add(distId);
    }
    setExpandedReconcileHistory(newExpanded);
  };

 // --- CALCULATE TOTAL BILL FOR DISTRIBUTION ---
const calculateTotalBill = (dist) => {
  return dist.distribution_items
    .filter(item => item.withdrawal_date) // Hanya yang sudah selesai
    .reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);
};

  // --- CALCULATE SUMMARY FOR PARENT DISTRIBUTION ---
  // --- CALCULATE SUMMARY FOR PARENT DISTRIBUTION ---
const calculateParentSummary = (parent, reconciles) => {
  // Hanya hitung setoran yang sudah WITHDRAWN (selesai)
  const completedReconciles = reconciles.filter(rec => 
    rec.distribution_items?.every(item => item.withdrawal_date)
  );
  
  const parentBill = parent.distribution_items
    .filter(item => item.withdrawal_date) // Hanya item yang sudah selesai
    .reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);
  
  const totalReconcileBill = completedReconciles.reduce((acc, rec) => 
    acc + calculateTotalBill(rec), 0
  );
  
  const totalItems = parent.distribution_items.length;
  const activeItems = parent.distribution_items.filter(item => !item.withdrawal_date).length;
  const completedItems = parent.distribution_items.filter(item => item.withdrawal_date).length;
  
  return {
    totalBill: parentBill + totalReconcileBill, // Hanya yang selesai
    totalItems,
    activeItems,
    completedItems,
    hasReconciles: completedReconciles.length > 0,
    completedReconciles: completedReconciles // Tambahkan ini untuk filter
  };
};
  // --- KIOSK MANAGEMENT ---
 const handleAddKioskWithTemplate = async (e) => {
  e.preventDefault();
  if(!newKiosk.area) return alert("Harap pilih Area/Rute!");
  setIsSubmitting(true);
  const supabase = getSupabaseWithAuth();
  try {
    // Validasi user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User tidak terautentikasi. Silakan login kembali.');
    }

    const { data: kioskData, error: kioskError } = await supabase.from('kiosks').insert([{
      user_id: user.id, // Gunakan user.id dari auth
      name: newKiosk.name,
      area: newKiosk.area,
      address: newKiosk.address,
      detailed_address: newKiosk.detailed_address,
      gmaps_link: newKiosk.gmaps_link,
      contact_person: newKiosk.contact_person,
      phone_number: newKiosk.phone_number,
      notes: newKiosk.notes,
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
    setNewKiosk({ 
      name: '', area: '', address: '', detailed_address: '',
      gmaps_link: '', contact_person: '', phone_number: '', notes: '' 
    });
    setKioskTemplateItems([]);
    fetchData(); 
  } catch (err) {
    console.error('Add kiosk error:', err);
    alert(err.message || 'Gagal menambah kiosk');
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
      price: getCakePrice(manualCakeId), 
      current_stock: cake.current_stock,
      source: 'manual'
    }]);
    setManualCakeId(''); 
    setManualQty('');
  };

  // --- DELIVERY FUNCTIONS ---
//   const handleViewDelivery = (delivery) => {
//     setSelectedDelivery(delivery);
//     setShowDeliveryModal(true);
//   };

//   const handleConfirmDelivery = async (deliveryId) => {
//   const result = await deliveryFunctions.confirmDelivery(deliveryId, getSupabaseWithAuth());
//   if (result.success) {
//     alert(result.message);
//     fetchData();
//   } else {
//     alert(result.message);
//   }
// };
    // --- GROUP DISTRIBUTIONS BY KIOSK ---
   // --- GROUP DISTRIBUTIONS BY KIOSK ---
const groupDistributionsByKiosk = () => {
  const groupedByKiosk = {};
  
  distributions.forEach(dist => {
    // VALIDASI: Pastikan kiosk data ada
    if (!dist.kiosks) {
      console.warn('Distribution tanpa kiosk data:', dist.id);
      return; // Skip distribusi tanpa kiosk
    }
    
    const kioskId = dist.kiosk_id;
    
    if (!groupedByKiosk[kioskId]) {
      groupedByKiosk[kioskId] = {
        kiosk: dist.kiosks,
        activeDistributions: [],
        completedDistributions: []
      };
    }
    
    // Cek apakah distribusi ini sudah selesai
    const isCompleted = dist.distribution_items?.every(item => item.withdrawal_date) || false;
    
    if (isCompleted) {
      groupedByKiosk[kioskId].completedDistributions.push(dist);
    } else {
      groupedByKiosk[kioskId].activeDistributions.push(dist);
    }
  });

  return Object.values(groupedByKiosk);
};
    // --- CALCULATE SUMMARY FOR KIOSK ---
// --- CALCULATE SUMMARY FOR KIOSK ---
const calculateKioskSummary = (kioskGroup) => {
  const activeDistributions = kioskGroup.activeDistributions || [];
  const completedDistributions = kioskGroup.completedDistributions || [];
  
  // Hitung total tagihan dari yang sudah selesai
  const totalCompletedBill = completedDistributions.reduce((total, dist) => {
    return total + (dist.distribution_items?.reduce((sum, item) => 
      sum + (item.quantity_sold * item.price_at_distribution), 0
    ) || 0);
  }, 0);
  
  // Hitung item aktif
  const totalActiveItems = activeDistributions.reduce((total, dist) => 
    total + (dist.distribution_items?.length || 0), 0
  );
  
  // Hitung total titipan aktif
  const totalActiveQuantity = activeDistributions.reduce((total, dist) => 
    total + (dist.distribution_items?.reduce((sum, item) => sum + (item.quantity_sent || 0), 0) || 0), 0
  );
  
  return {
    totalCompletedBill,
    totalActiveItems,
    totalActiveQuantity,
    hasActive: activeDistributions.length > 0,
    hasCompleted: completedDistributions.length > 0
  };
};
  // --- FILTERS ---
// --- FILTERS ---
const kioskGroups = groupDistributionsByKiosk().filter(group => {
  // VALIDASI: Pastikan kiosk data ada
  if (!group.kiosk) {
    console.warn('Group tanpa kiosk data:', group);
    return false;
  }
  
  const kiosk = group.kiosk;
  if (filterArea !== 'Semua' && kiosk?.area !== filterArea) return false;
  
  // Filter berdasarkan bulan
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


  const filteredKiosksForInput = kiosks.filter(k => k.is_active && (selectedArea ? k.area === selectedArea : true));

  // --- MODAL COMPONENTS ---
  const KioskDetailModal = ({ kiosk, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
      name: kiosk?.name || '',
      area: kiosk?.area || '',
      address: kiosk?.address || '',
      detailed_address: kiosk?.detailed_address || '',
      gmaps_link: kiosk?.gmaps_link || '',
      contact_person: kiosk?.contact_person || '',
      phone_number: kiosk?.phone_number || '',
      notes: kiosk?.notes || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const supabase = getSupabaseWithAuth();
      
      try {
        const { error } = await supabase
          .from('kiosks')
          .update(formData)
          .eq('id', kiosk.id);

        if (error) throw error;
        
        alert('Data kios berhasil diupdate!');
        onUpdate();
        onClose();
      } catch (err) {
        alert('Gagal update: ' + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };





    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Kios - {kiosk.name}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kios *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                <select
                  required
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Pilih Area</option>
                  {ROUTES.map(route => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Singkat</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Jl. Contoh No. 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Detail</label>
              <textarea
                value={formData.detailed_address}
                onChange={e => setFormData({...formData, detailed_address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Detail alamat, patokan, dll."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Nama penanggung jawab"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="08xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
              <input
                type="url"
                value={formData.gmaps_link}
                onChange={e => setFormData({...formData, gmaps_link: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Catatan khusus tentang kios ini..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DailyPriceManager = ({ date, onClose }) => {
  const [priceData, setPriceData] = useState({});
  
  useEffect(() => {
    loadDailyPrices();
  }, [date, cakes]); // Tambahkan cakes sebagai dependency

  const loadDailyPrices = async () => {
    const supabase = getSupabaseWithAuth();
    const { data } = await supabase
      .from('daily_prices')
      .select('cake_id, selling_price')
      .eq('price_date', date);
    
    const pricesMap = {};
    data?.forEach(item => {
      pricesMap[item.cake_id] = item.selling_price;
    });
    
    // Inisialisasi dengan harga default dari cakes
    const initialData = {};
    cakes.forEach(cake => {
      initialData[cake.id] = pricesMap[cake.id] !== undefined 
        ? pricesMap[cake.id] 
        : cake.price_per_piece;
    });
    
    setPriceData(initialData);
  };

  const handlePriceChange = (cakeId, newPrice) => {
    const numericValue = parseFloat(newPrice);
    setPriceData(prev => ({
      ...prev,
      [cakeId]: isNaN(numericValue) ? '' : numericValue
    }));
  };

  const savePrices = async () => {
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      // Validasi user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi. Silakan login kembali.');
      }

      // Gunakan harga dari input atau pertahankan harga existing
      const priceEntries = cakes.map(cake => {
        const inputPrice = priceData[cake.id];
        // Jika ada input harga yang valid, gunakan itu. Jika kosong, gunakan harga existing
        const selling_price = inputPrice !== undefined && inputPrice !== '' && inputPrice > 0
          ? parseFloat(inputPrice)
          : cake.price_per_piece;
        
        return {
          user_id: user.id,
          cake_id: cake.id,
          price_date: date,
          selling_price: selling_price
        };
      });

      const { error } = await supabase
        .from('daily_prices')
        .upsert(priceEntries, {
          onConflict: 'user_id,cake_id,price_date'
        });

      if (error) throw error;
      
      alert('Harga harian berhasil disimpan!');
      onClose();
      fetchDailyPrices(date);
    } catch (err) {
      console.error('Save prices error:', err);
      alert('Gagal menyimpan harga: ' + (err.message || 'Terjadi kesalahan tidak diketahui'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefault = () => {
    const defaultPrices = {};
    cakes.forEach(cake => {
      defaultPrices[cake.id] = cake.price_per_piece;
    });
    setPriceData(defaultPrices);
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Harga Harian - {new Date(date).toLocaleDateString('id-ID')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Atur harga khusus untuk tanggal ini. Kosongkan untuk menggunakan harga default.
            </p>
            <button
              onClick={resetToDefault}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset ke Harga Default
            </button>
          </div>

          <div className="space-y-3">
            {cakes.map(cake => (
              <div key={cake.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{cake.name}</div>
                  <div className="text-sm text-gray-500">
                    Harga default: Rp {cake.price_per_piece?.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={priceData[cake.id] || ''}
                    onChange={(e) => handlePriceChange(cake.id, e.target.value)}
                    className="w-32 px-3 py-2 border rounded text-right font-medium"
                    min="0"
                    step="1000"
                    placeholder={cake.price_per_piece?.toString()}
                  />
                  {priceData[cake.id] && priceData[cake.id] !== cake.price_per_piece && (
                    <span className="text-xs text-green-600 font-medium">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-6">
            <button
              onClick={savePrices}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Harga Harian'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  const DeliveryDetailModal = ({ delivery, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Pengantaran</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Informasi Pengantaran</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium">{new Date(delivery.delivery_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      delivery.status === 'delivered' ? 'text-green-600' : 
                      delivery.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {delivery.status === 'delivered' ? 'Terkirim' : 
                       delivery.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Nilai:</span>
                    <span className="font-bold text-green-600">{formatRupiah(delivery.total_value)}</span>
                  </div>
                </div>
              </div>
              
              {delivery.notes && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Catatan</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{delivery.notes}</p>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-700 mb-3">Detail Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Kios</th>
                    <th className="px-4 py-2 text-left">Kue</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-center">Harga</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.delivery_items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-medium">{item.store_id.name}</div>
                        <div className="text-xs text-gray-500">{item.store_id.address}</div>
                      </td>
                      <td className="px-4 py-2">{item.cake_id.name}</td>
                      <td className="px-4 py-2 text-center">{item.quantity_delivered}</td>
                      <td className="px-4 py-2 text-center">{formatRupiah(item.unit_price)}</td>
                      <td className="px-4 py-2 text-center font-bold">{formatRupiah(item.total_price)}</td>
                      <td className="px-4 py-2 text-center">
                        {item.is_returned ? (
                          <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                            Retur: {item.return_quantity}pcs
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
                            Terkirim
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {delivery.status === 'pending' && (
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => handleConfirmDelivery(delivery.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Konfirmasi Pengantaran
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center flex flex-col items-center justify-center"><RefreshCw className="animate-spin mb-2"/> Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Distribusi & Pengantaran</h1>
            <p className="text-gray-500 text-sm">Sistem Titipan, Tagihan & Auto-Restock</p>
          </div>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
            <button 
              onClick={() => setActiveTab('distribution')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                activeTab === 'distribution' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package size={16} /> Distribusi
            </button>
            <button 
              onClick={() => setActiveTab('deliveries')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                activeTab === 'deliveries' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Truck size={16} /> Pengantaran
            </button>
            <button 
              onClick={() => setActiveTab('kiosks')} 
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                activeTab === 'kiosks' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
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
                    <div className="flex gap-2">
                      <input 
                        type="date" 
                        value={distDate} 
                        onChange={e => setDistDate(e.target.value)} 
                        className="flex-1 px-3 py-2 border rounded-lg" 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPriceManager(true)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Harga berdasarkan: {new Date(distDate).toLocaleDateString('id-ID')}
                    </div>
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
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{item.cake_name}</span>
                            <span className="text-xs text-gray-500">
                              {getCakePrice(item.cake_id) === (cakes.find(c => c.id === item.cake_id)?.price_per_piece || 0) ? (
                                <span className="text-gray-500">Default: Rp {getCakePrice(item.cake_id).toLocaleString()}</span>
                              ) : (
                                <span className="text-green-600 font-medium">Harga Khusus: Rp {getCakePrice(item.cake_id).toLocaleString()}</span>
                              )}
                            </span>
                          </div>
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
                          <span className="text-xs text-green-600 font-bold">
                            Rp {(item.quantity * getCakePrice(item.cake_id)).toLocaleString()}
                          </span>
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

              
              {kioskGroups.map((group) => {
                // VALIDASI: Pastikan kiosk data ada sebelum render
                    // Di bagian render, tambahkan loading state
                  if (loading) {
                    return <div className="p-8 text-center flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin mb-2"/> Memuat Data...
                    </div>;
                  }

                  // Validasi jika tidak ada data kiosk yang valid
                  if (kioskGroups.length === 0 && !loading) {
                    return (
                      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <Store className="mx-auto text-gray-200 mb-3" size={48}/>
                        <p className="text-gray-400 font-medium">Tidak ada data kiosk.</p>
                      </div>
                    );
                  }

                    const kiosk = group.kiosk;
                    const activeDists = group.activeDistributions || [];
                    const completedDists = group.completedDistributions || [];
                    const summary = calculateKioskSummary(group);
                    const hasActiveItems = summary.hasActive;

                    return (
                      <div key={kiosk.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                        !hasActiveItems ? 'border-green-200 ring-1 ring-green-100 bg-green-50' : 
                        !kiosk?.is_active ? 'border-red-200 ring-1 ring-red-100 bg-red-50' : 
                        'border-l-4 border-l-blue-400 border-gray-200 bg-white'
                      }`}>
                    
                    {/* CARD HEADER - INFO KIOSK */}
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* LEFT INFO - DETAIL KIOS */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wider">
                              {kiosk?.area}
                            </span>
                            <h3 className="font-bold text-xl text-gray-900">
                              {kiosk?.name}
                            </h3>
                            
                            <button
                              onClick={() => setShowKioskDetail(kiosk)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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
                          
                          {/* INFO KONTAK & ALAMAT */}
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
                            
                            {/* ALAMAT */}
                            {kiosk?.address && (
                              <div className="text-sm text-gray-600 flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{kiosk.address}</span>
                              </div>
                            )}
                          </div>

                          {/* SUMMARY STATS */}
                          <div className="flex flex-wrap gap-4 mt-4">
                            {hasActiveItems && (
                              <>
                                <div className="flex items-center gap-2 text-sm">
                                  <Package size={16} className="text-blue-400" />
                                  <span>{summary.totalActiveItems} item aktif</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-blue-600 font-bold">{summary.totalActiveQuantity} pcs</span>
                                  <span className="text-gray-500">titipan</span>
                                </div>
                              </>
                            )}
                            {summary.hasCompleted && (
                              <div className="flex items-center gap-2 text-sm">
                                <History size={16} className="text-green-400" />
                                <span>{completedDists.length} setoran selesai</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT SIDE - STATUS & ACTIONS */}
                        <div className="flex flex-col items-end gap-3">
                          {/* TOTAL TAGIHAN */}
                          {summary.totalCompletedBill > 0 && (
                            <div className="text-right">
                              <div className="text-xs uppercase font-semibold text-gray-500 mb-1">
                                Total Tertagih
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatRupiah(summary.totalCompletedBill)}
                              </div>
                            </div>
                          )}

                          {/* ACTION BUTTONS */}
                          <div className="flex gap-2">
                            {/* TOMBOL EDIT - Hanya tampil jika kiosk aktif */}
                            {kiosk?.is_active && (
                              <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition-colors"
                              >
                                <Edit3 size={16}/>
                                Edit Penitipan
                              </button>
                            )}
                            
                            {/* TOMBOL SETOR SEMUA - Hanya tampil jika ada item aktif */}
                            {hasActiveItems && kiosk?.is_active && (
                              <button 
                                onClick={() => handleBulkReconcile(activeDists[0])}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-green-700 transition-colors"
                              >
                                <RefreshCw size={16}/> Setor Semua
                              </button>
                            )}
                          </div>

                          {/* STATUS BADGE */}
                          <div className={`px-4 py-2 rounded-lg border ${
                            !hasActiveItems ? 'bg-green-100 border-green-300 text-green-800' :
                            !kiosk?.is_active ? 'bg-red-100 border-red-300 text-red-800' :
                            'bg-blue-100 border-blue-300 text-blue-800'
                          }`}>
                            <div className="text-sm font-bold text-center">
                              {!hasActiveItems ? 'SELESAI' : 
                              !kiosk?.is_active ? 'NON-AKTIF' : 'AKTIF'}
                            </div>
                          </div>
</div>


      </div>
    </div>

  {/* EDIT MODE */}
{isEditing && (
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
                      className="w-24 text-center border border-yellow-300 rounded-lg py-2 px-3 font-bold text-indigo-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                      placeholder="0"
                    />
                  </div>
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
          className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors"
        >
          <PlusCircle size={18}/> Tambah Jenis Kue Lain
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save size={16}/>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  </div>
)}
              
{/* DATA PENITIPAN AKTIF & RIWAYAT SETORAN DALAM 1 CARD */}
{!isEditing && (
  <div className="border-t">
    <div className="p-6">
      {/* DATA PENITIPAN AKTIF */}
      {hasActiveItems && (
        <div className="mb-8">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <Package size={20} />
            Penitipan Aktif
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {summary.totalActiveItems} item
            </span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-left">Item Kue</th>
                  <th className="px-6 py-4 font-semibold text-center bg-gray-100">Harga @</th>
                  <th className="px-6 py-4 font-semibold text-center bg-blue-50 text-blue-700">Titip</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeDists.flatMap(dist => 
                  dist.distribution_items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{item.cake_id?.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Mulai: {new Date(dist.distribution_date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 bg-gray-50">
                        {formatRupiah(item.price_at_distribution)}
                      </td>
                      <td className="px-6 py-4 text-center font-bold bg-blue-50 text-blue-800">
                        {item.quantity_sent}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleReconcileAndRestock(item, dist)} 
                          className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 flex items-center gap-1 mx-auto transition-all"
                        >
                          <RefreshCw size={14}/> Setor
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RIWAYAT SETORAN */}
      {summary.hasCompleted && (
        <div className="border-t pt-8">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <History size={20} className="text-green-600" />
            Riwayat Setoran ({completedDists.length})
          </h4>
          
          <div className="space-y-4">
            {completedDists.map((dist, index) => {
              const totalBill = dist.distribution_items.reduce((sum, item) => 
                sum + (item.quantity_sold * item.price_at_distribution), 0
              );
              
              return (
                <div key={dist.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">
                        Setoran {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(dist.distribution_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Total: {formatRupiah(totalBill)}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-green-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100 text-green-900 border-b border-green-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Kue</th>
                          <th className="px-4 py-3 text-center font-semibold">Titip</th>
                          <th className="px-4 py-3 text-center font-semibold">Laku</th>
                          <th className="px-4 py-3 text-center font-semibold">Rusak</th>
                          <th className="px-4 py-3 text-right font-semibold">Tagihan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dist.distribution_items.map((item) => {
                          const itemBill = item.quantity_sold * item.price_at_distribution;
                          return (
                            <tr key={item.id} className="border-b border-green-50 last:border-b-0">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{item.cake_id?.name}</div>
                              </td>
                              <td className="px-4 py-3 text-center text-blue-700 font-semibold">
                                {item.quantity_sent}
                              </td>
                              <td className="px-4 py-3 text-center text-green-600 font-semibold">
                                {item.quantity_sold}
                              </td>
                              <td className="px-4 py-3 text-center text-red-500">
                                {item.quantity_damaged_at_location}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                {formatRupiah(itemBill)}
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
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}


 {/* EMPTY STATE */}
              {kioskGroups.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                  <Store className="mx-auto text-gray-200 mb-3" size={48}/>
                  <p className="text-gray-400 font-medium">Tidak ada data kiosk.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {filterArea !== 'Semua' ? `Untuk area ${filterArea}` : ''}
                    {filterMonth ? ` bulan ${filterMonth}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

{/* TUTUP DARI CONDITIONAL RENDERING UTAMA */}


      {activeTab === 'deliveries' && (
        <DeliveriesTab 
          deliveries={deliveries}
          onConfirmDelivery={handleConfirmDelivery}
          onViewDelivery={handleViewDelivery}
          selectedDelivery={selectedDelivery}
          showDeliveryModal={showDeliveryModal}
          onCloseDeliveryModal={() => {
            setShowDeliveryModal(false);
            setSelectedDelivery(null);
          }}
          onCreateDelivery={handleCreateDelivery}
          stores={kiosks}
          cakes={cakes}
        />
      )}

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
                  <label className="text-xs font-semibold text-gray-500 uppercase">Alamat Detail</label>
                  <textarea 
                    value={newKiosk.detailed_address} 
                    onChange={e => setNewKiosk({...newKiosk, detailed_address: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg" 
                    rows="2" 
                    placeholder="Detail alamat, patokan, dll."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Contact Person</label>
                    <input 
                      type="text" 
                      value={newKiosk.contact_person} 
                      onChange={e => setNewKiosk({...newKiosk, contact_person: e.target.value})} 
                      className="w-full mt-1 px-3 py-2 border rounded-lg" 
                      placeholder="Nama penanggung jawab"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Telepon</label>
                    <input 
                      type="tel" 
                      value={newKiosk.phone_number} 
                      onChange={e => setNewKiosk({...newKiosk, phone_number: e.target.value})} 
                      className="w-full mt-1 px-3 py-2 border rounded-lg" 
                      placeholder="08xxx"
                    />
                  </div>
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
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Catatan</label>
                  <textarea 
                    value={newKiosk.notes} 
                    onChange={e => setNewKiosk({...newKiosk, notes: e.target.value})} 
                    className="w-full mt-1 px-3 py-2 border rounded-lg" 
                    rows="2" 
                    placeholder="Catatan khusus..."
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
                            <p className="text-xs text-gray-500 mb-1">{k.address}</p>
                            {k.contact_person && (
                              <p className="text-xs text-gray-600">👤 {k.contact_person}</p>
                            )}
                            {k.phone_number && (
                              <p className="text-xs text-gray-600">📞 {k.phone_number}</p>
                            )}
                            {k.gmaps_link && (
                              <a href={k.gmaps_link} target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 mt-1">
                                <MapPin size={12}/> Google Maps
                              </a>
                            )}
                          </div>
                          
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

        {/* MODALS */}
        {showKioskDetail && (
          <KioskDetailModal 
            kiosk={showKioskDetail}
            onClose={() => setShowKioskDetail(null)}
            onUpdate={fetchData}
          />
        )}

        {showPriceManager && (
          <DailyPriceManager 
            date={distDate}
            onClose={() => setShowPriceManager(false)}
          />
        )}

        {showDeliveryModal && selectedDelivery && (
          <DeliveryDetailModal 
            delivery={selectedDelivery}
            onClose={() => {
              setShowDeliveryModal(false);
              setSelectedDelivery(null);
            }}
          />
        )}
      </div>
    </div>
  );
}