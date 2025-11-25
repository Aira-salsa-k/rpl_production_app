// utils/deliveryFunctions.js
export const deliveryFunctions = {
  // Fungsi untuk konfirmasi pengantaran
  confirmDelivery: async (deliveryId, supabase) => {
    if (!confirm('Konfirmasi pengantaran sudah selesai?')) return;

    try {
      const { error } = await supabase.rpc('confirm_delivery', {
        p_delivery_id: deliveryId
      });

      if (error) throw error;
      return { success: true, message: 'Pengantaran dikonfirmasi!' };
    } catch (error) {
      console.error('Error confirming delivery:', error);
      return { success: false, message: 'Gagal mengkonfirmasi pengantaran: ' + error.message };
    }
  },

  // Fungsi untuk membuat pengantaran baru
  // utils/deliveryFunctions.js - Update fungsi createDelivery
// utils/deliveryFunctions.js - Update fungsi createDelivery
createDelivery: async (deliveryData, supabase) => {
  try {
    // Validasi user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User tidak terautentikasi');
    }

    const { delivery_date, customer_name, customer_phone, delivery_address, notes, items } = deliveryData;

    // Validasi data customer
    if (!delivery_date) throw new Error('Tanggal pengantaran harus diisi');
    if (!customer_name) throw new Error('Nama customer harus diisi');
    if (!customer_phone) throw new Error('Nomor telepon customer harus diisi');
    if (!delivery_address) throw new Error('Alamat pengantaran harus diisi');
    if (!items || items.length === 0) throw new Error('Minimal satu item harus dipilih');
    
    // Validasi setiap item
    for (const item of items) {
      if (!item.cake_id) throw new Error('Semua item harus memilih kue');
      if (!item.quantity || item.quantity <= 0) throw new Error('Jumlah item harus lebih dari 0');
      
      // Validasi stok
      const { data: cake, error: cakeError } = await supabase
        .from('cakes')
        .select('current_stock, name')
        .eq('id', item.cake_id)
        .eq('user_id', user.id)
        .single();
        
      if (cakeError) throw new Error('Data kue tidak ditemukan');
      if (cake.current_stock < parseInt(item.quantity)) {
        throw new Error(`Stok ${cake.name} tidak cukup. Stok tersedia: ${cake.current_stock}`);
      }
    }

    // Buat payload untuk RPC function
    const deliveryPayload = {
      customer_name,
      customer_phone,
      delivery_address,
      items: items.map(item => ({
        cake_id: item.cake_id,
        quantity: parseInt(item.quantity)
      }))
    };

    const { data, error } = await supabase.rpc('create_delivery_external', {
      p_delivery_date: delivery_date,
      p_delivery_data: deliveryPayload,
      p_notes: notes
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(error.message || 'Gagal membuat pengantaran');
    }

    return { success: true, data, message: 'Pengantaran berhasil dibuat!' };
  } catch (err) {
    console.error('Create delivery error:', err);
    return { success: false, message: err.message || 'Gagal membuat pengantaran' };
  }
},

  // Fungsi untuk menghitung statistik pengantaran
  calculateDeliveryStats: (deliveries) => {
    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
    const deliveredDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const totalRevenue = deliveries.reduce((sum, delivery) => sum + (delivery.total_value || 0), 0);

    return {
      totalDeliveries,
      pendingDeliveries,
      deliveredDeliveries,
      totalRevenue
    };
  }
};