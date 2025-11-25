import { useState, useEffect } from 'react';
import { useStore } from '../../store/appStore';
import { useAuth } from '../../contexts/AuthContext';

// Hooks
import { useDistributions } from '../../hooks/useDistributions';
import { useKiosks } from '../../hooks/useKiosks';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useDailyPrices } from '../../hooks/useDailyPrices';
import { useDistributionForm } from '../../hooks/useDistributionForm';
import { useCakes } from '../../hooks/useCakes';

// Components
import DistributionForm from '../../components/distributionz/DistributionForm';
import DistributionList from '../../components/distributionz/DistributionList';
import KioskManagement from '../../components/distributionz/KioskManagement';
import KioskDetailModal from '../../components/distributionz/KioskDetailModal';
import DailyPriceManager from '../../components/distributionz/DailyPriceManager';
import DeliveryDetailModal from '../../components/distributionz/DeliveryDetailModal';
import TabNavigation from '../../components/common/TabNavigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DeliveriesTab from '../../components/DeliveriesTab';

// Utils
import { DISTRIBUTION_TABS, ROUTES } from '../../utils/constants';
import { getCurrentDateISO, getCurrentMonth } from '../../utils/formatters';
import { deliveryFunctions } from '../../utils/DeliveryFunctions';

export default function Distributions() {
  const [activeTab, setActiveTab] = useState(DISTRIBUTION_TABS.DISTRIBUTION);
  const [filterArea, setFilterArea] = useState('Semua');
  const [filterMonth, setFilterMonth] = useState('');
  const [distDate, setDistDate] = useState(getCurrentDateISO());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showKioskDetail, setShowKioskDetail] = useState(null);
  const [showPriceManager, setShowPriceManager] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Custom hooks
  const { distributions, loading: distributionsLoading, refetch: refetchDistributions } = useDistributions();
  const { kiosks, loading: kiosksLoading, refetch: refetchKiosks } = useKiosks();
  const { deliveries, loading: deliveriesLoading, refetch: refetchDeliveries } = useDeliveries();
  const { dailyPrices, fetchDailyPrices } = useDailyPrices();
  const { ingredients, recipes } = useStore();

  // const { cakes } = useStore();
  const { getSupabaseWithAuth } = useAuth();
const { cakes, loading: cakesLoading, refetch: refetchCakes } = useCakes();
  // Distribution form hook
  const distributionForm = useDistributionForm(kiosks, cakes, distributions, dailyPrices, distDate);
 

  const fetchData = () => {
    refetchDistributions();
    refetchKiosks();
    refetchDeliveries();
  };

  useEffect(() => {
    setFilterMonth(getCurrentMonth());
  }, []);

  useEffect(() => {
    if (distDate && cakes.length > 0) {
      fetchDailyPrices(distDate, cakes);
    }
  }, [distDate, cakes]);

  // Handler functions
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

  const handleConfirmDelivery = async (deliveryId) => {
    const result = await deliveryFunctions.confirmDelivery(deliveryId, getSupabaseWithAuth());
    if (result.success) {
      alert(result.message);
      fetchData();
    } else {
      alert(result.message);
    }
  };

  const handleViewDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  };

  const handleBulkReconcile = async (dist) => {
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

      await distributionForm.updateKioskTemplate(dist.kiosk_id, templateItems);

      alert(`Setoran berhasil! Total tagihan: ${formatRupiah(totalBill)} dan template diperbarui`);
      fetchData();
    } catch (err) {
      console.error('Bulk reconcile error:', err);
      alert("Gagal proses setoran: " + (err.message || 'Terjadi kesalahan tidak diketahui'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReconcileItem = async (item, dist) => {
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

      await distributionForm.updateKioskTemplate(dist.kiosk_id, [{
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

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  if (distributionsLoading || kiosksLoading) {
    return <LoadingSpinner />;
  }

  const handleSaveEdit = async (distributionId, editItems) => {
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
      p_dist_id: distributionId,
      p_items: payload
    });

    if (error) throw error;

    // Update template kiosk
    const editedDist = distributions.find(d => d.id === distributionId);
    if (editedDist && editedDist.kiosk_id) {
      await distributionForm.updateKioskTemplate(editedDist.kiosk_id, editItems);
    }

    alert("✅ Data titipan berhasil diperbarui dan template diupdate!");
    setTimeout(() => fetchData(), 500);
    
  } catch (err) {
    console.error('Edit error:', err);
    alert("❌ Gagal update: " + (err.message || 'Terjadi kesalahan tidak diketahui'));
    throw err;
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <TabNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === DISTRIBUTION_TABS.DISTRIBUTION && (
          <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
              <DistributionForm
              selectedArea={distributionForm.selectedArea}
              setSelectedArea={distributionForm.setSelectedArea}
              selectedKioskId={distributionForm.selectedKioskId}
              setSelectedKioskId={distributionForm.setSelectedKioskId}
              items={distributionForm.items}
              setItems={distributionForm.setItems}
              manualCakeId={distributionForm.manualCakeId}
              setManualCakeId={distributionForm.setManualCakeId}
              manualQty={distributionForm.manualQty}
              setManualQty={distributionForm.setManualQty}
              handleAddManualItem={distributionForm.handleAddManualItem}
              handleCreateDistribution={distributionForm.handleCreateDistribution}
              getCakePrice={distributionForm.getCakePrice}
              kiosks={kiosks}
              cakes={cakes}
              distDate={distDate}
              setDistDate={setDistDate}
              onShowPriceManager={setShowPriceManager}
              isSubmitting={distributionForm.isSubmitting}
            />
            <DistributionList
              distributions={distributions}
              kiosks={kiosks}
              cakes={cakes}
              onSaveEdit={handleSaveEdit}
              onReconcileItem={handleReconcileItem}
              onBulkReconcile={handleBulkReconcile}
              onShowKioskDetail={setShowKioskDetail}
              onToggleKioskStatus={handleToggleKioskStatus}
              filterArea={filterArea}
              setFilterArea={setFilterArea}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {activeTab === DISTRIBUTION_TABS.DELIVERIES && (
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

        {activeTab === DISTRIBUTION_TABS.KIOSKS && (
          <KioskManagement 
            kiosks={kiosks}
            cakes={cakes} // Pastikan ini ada dan berisi data
            onToggleKioskStatus={handleToggleKioskStatus}
            onShowKioskDetail={setShowKioskDetail}
            onRefetch={fetchData}
          />
        )}

        {/* Modals */}
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
            cakes={cakes}
          />
        )}

        {showDeliveryModal && selectedDelivery && (
          <DeliveryDetailModal 
            delivery={selectedDelivery}
            onClose={() => {
              setShowDeliveryModal(false);
              setSelectedDelivery(null);
            }}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}
      </div>
    </div>
  );
}