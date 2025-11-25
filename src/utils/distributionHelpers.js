import { formatRupiah } from './formatters';

export const groupDistributionsByKiosk = (distributions) => {
  const groupedByKiosk = {};
  
  distributions.forEach(dist => {
    if (!dist.kiosks) {
      console.warn('Distribution tanpa kiosk data:', dist.id);
      return;
    }
    
    const kioskId = dist.kiosk_id;
    
    if (!groupedByKiosk[kioskId]) {
      groupedByKiosk[kioskId] = {
        kiosk: dist.kiosks,
        activeDistributions: [],
        completedDistributions: []
      };
    }
    
    const isCompleted = dist.distribution_items?.every(item => item.withdrawal_date) || false;
    
    if (isCompleted) {
      groupedByKiosk[kioskId].completedDistributions.push(dist);
    } else {
      groupedByKiosk[kioskId].activeDistributions.push(dist);
    }
  });

  return Object.values(groupedByKiosk);
};

export const calculateKioskSummary = (kioskGroup) => {
  const activeDistributions = kioskGroup.activeDistributions || [];
  const completedDistributions = kioskGroup.completedDistributions || [];
  
  const totalCompletedBill = completedDistributions.reduce((total, dist) => {
    return total + (dist.distribution_items?.reduce((sum, item) => 
      sum + (item.quantity_sold * item.price_at_distribution), 0
    ) || 0);
  }, 0);
  
  const totalActiveItems = activeDistributions.reduce((total, dist) => 
    total + (dist.distribution_items?.length || 0), 0
  );
  
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

export const calculateTotalBill = (dist) => {
  return dist.distribution_items
    .filter(item => item.withdrawal_date)
    .reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);
};

export const groupDistributionsByParent = (distributions) => {
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

export const calculateParentSummary = (parent, reconciles) => {
  const completedReconciles = reconciles.filter(rec => 
    rec.distribution_items?.every(item => item.withdrawal_date)
  );
  
  const parentBill = parent.distribution_items
    .filter(item => item.withdrawal_date)
    .reduce((acc, item) => acc + (item.quantity_sold * item.price_at_distribution), 0);
  
  const totalReconcileBill = completedReconciles.reduce((acc, rec) => 
    acc + calculateTotalBill(rec), 0
  );
  
  const totalItems = parent.distribution_items.length;
  const activeItems = parent.distribution_items.filter(item => !item.withdrawal_date).length;
  const completedItems = parent.distribution_items.filter(item => item.withdrawal_date).length;
  
  return {
    totalBill: parentBill + totalReconcileBill,
    totalItems,
    activeItems,
    completedItems,
    hasReconciles: completedReconciles.length > 0,
    completedReconciles
  };
};