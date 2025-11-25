export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(number);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID');
};

export const getCurrentDateISO = () => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};