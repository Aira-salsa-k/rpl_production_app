import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDistributionForm = (kiosks, cakes, distributions, dailyPrices, distDate) => {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedKioskId, setSelectedKioskId] = useState('');
  const [items, setItems] = useState([]);
  const [manualCakeId, setManualCakeId] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSupabaseWithAuth } = useAuth();

  // Auto-fill items when kiosk is selected
  useEffect(() => {
    if (selectedKioskId && kiosks.length > 0 && cakes.length > 0) {
      const kiosk = kiosks.find(k => k.id === selectedKioskId);
      
      if (!kiosk) return;

      const templateItems = kiosk?.kiosk_consignment_templates?.map(t => {
        const masterCake = cakes.find(c => c.id === t.cake_id);
        return {
          tempId: Date.now() + Math.random(),
          cake_id: t.cake_id,
          cake_name: masterCake?.name || 'Unknown',
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

      // Prioritize history items first
      historyItems.forEach(item => {
        combinedItems.push(item);
        usedCakeIds.add(item.cake_id);
      });

      // Then add template items that aren't already in history
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
  }, [selectedKioskId, kiosks, cakes, distributions, dailyPrices, distDate]);

  const getCakePrice = (cakeId) => {
    if (dailyPrices[cakeId] && dailyPrices[cakeId] > 0) {
      return dailyPrices[cakeId];
    }
    
    const cake = cakes.find(c => c.id === cakeId);
    return cake?.price_per_piece || 0;
  };

  const handleAddManualItem = () => {
    if (!manualCakeId || !manualQty) {
      alert("Lengkapi data item: pilih kue dan isi jumlah");
      return;
    }
    
    const cake = cakes.find(c => c.id === manualCakeId);
    if (!cake) {
      alert("Kue tidak ditemukan!");
      return;
    }

    const quantity = parseInt(manualQty);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Jumlah harus angka positif!");
      return;
    }

    const existing = items.find(i => i.cake_id === manualCakeId);
    if(existing) {
      alert("Kue ini sudah ada di daftar, silakan edit jumlahnya.");
      return;
    }

    setItems([...items, { 
      tempId: Date.now(), 
      cake_id: manualCakeId, 
      cake_name: cake.name, 
      quantity: quantity, 
      price: getCakePrice(manualCakeId), 
      current_stock: cake.current_stock,
      source: 'manual'
    }]);
    setManualCakeId(''); 
    setManualQty('');
  };

  const updateKioskTemplate = async (kioskId, newItems) => {
    if (!kioskId || !newItems || newItems.length === 0) {
      console.log('No items to update template');
      return;
    }

    const supabase = getSupabaseWithAuth();
    
    try {
      // Delete existing templates
      const { error: deleteError } = await supabase
        .from('kiosk_consignment_templates')
        .delete()
        .eq('kiosk_id', kioskId);

      if (deleteError) throw deleteError;

      // Insert new templates
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

  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!selectedKioskId) {
      alert("Harap pilih kios terlebih dahulu!");
      return;
    }

    if (items.length === 0) {
      alert("Harap tambahkan minimal satu item kue!");
      return;
    }

    // Validasi stok
    const insufficientStock = items.filter(item => {
      const cake = cakes.find(c => c.id === item.cake_id);
      return cake && cake.current_stock < item.quantity;
    });

    if (insufficientStock.length > 0) {
      const cakeNames = insufficientStock.map(item => item.cake_name).join(', ');
      alert(`Stok tidak cukup untuk: ${cakeNames}`);
      return;
    }

    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    
    try {
      // Validasi user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi. Silakan login kembali.');
      }

      // Siapkan payload items
      const itemsPayload = items.map(i => ({
        cake_id: i.cake_id,
        quantity: i.quantity,
        price: getCakePrice(i.cake_id)
      }));

      console.log('Creating distribution with payload:', {
        kiosk_id_input: selectedKioskId,
        date_input: distDate,
        items_input: itemsPayload
      });
      
      // Panggil stored procedure
      const { data, error } = await supabase.rpc('record_distribution_with_daily_price', {
        kiosk_id_input: selectedKioskId,
        date_input: distDate,
        items_input: itemsPayload
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Tidak ada data yang dikembalikan dari server');
      }

      // Update template kiosk
      await updateKioskTemplate(selectedKioskId, items);

      alert('✅ Distribusi baru berhasil dicatat dan template diperbarui!');
      
      // Reset form
      setItems([]);
      setSelectedKioskId('');
      setSelectedArea('');
      setManualCakeId('');
      setManualQty('');
      
      return { success: true, data };
      // Di handleCreateDistribution, tambahkan:
        console.log('Distribution Data:', {
        kioskId: selectedKioskId,
        date: distDate,
        items: items,
        itemsPayload: itemsPayload
        });
    } catch (err) {
      console.error('Create distribution error:', err);
      let errorMessage = 'Gagal membuat distribusi: ';
      
      if (err.message.includes('insufficient stock')) {
        errorMessage += 'Stok tidak mencukupi untuk beberapa item.';
      } else if (err.message.includes('foreign key constraint')) {
        errorMessage += 'Data referensi tidak valid.';
      } else {
        errorMessage += err.message || 'Terjadi kesalahan tidak diketahui';
      }
      
      alert(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedArea,
    setSelectedArea,
    selectedKioskId,
    setSelectedKioskId,
    items,
    setItems,
    manualCakeId,
    setManualCakeId,
    manualQty,
    setManualQty,
    handleAddManualItem,
    handleCreateDistribution,
    getCakePrice,
    updateKioskTemplate,
    isSubmitting
  };
};