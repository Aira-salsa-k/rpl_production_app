import { useState } from 'react';
import { X } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSupabaseWithAuth } = useAuth();

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

export default KioskDetailModal;