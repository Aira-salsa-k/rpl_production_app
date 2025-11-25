import { useState } from 'react';
import { Plus, MapPin, Power, PowerOff, PlusCircle, Trash2 } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const KioskManagement = ({ kiosks, cakes = [], onToggleKioskStatus, onShowKioskDetail, onRefetch }) => {
  const [newKiosk, setNewKiosk] = useState({ 
    name: '', area: '', address: '', detailed_address: '',
    gmaps_link: '', contact_person: '', phone_number: '', notes: ''
  });
  
  const [kioskTemplateItems, setKioskTemplateItems] = useState([]);
  const [tempTemplateCake, setTempTemplateCake] = useState('');
  const [tempTemplateQty, setTempTemplateQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getSupabaseWithAuth } = useAuth();

  // Debug: cek apakah cakes ada
  console.log('Cakes data in KioskManagement:', cakes);

  const handleAddTemplateItem = () => {
    if(!tempTemplateCake || !tempTemplateQty) {
      alert("Harap pilih kue dan isi quantity!");
      return;
    }
    
    const cake = cakes.find(c => c.id === tempTemplateCake);
    if (!cake) {
      alert("Kue tidak ditemukan!");
      return;
    }

    setKioskTemplateItems([...kioskTemplateItems, {
      cake_id: tempTemplateCake,
      cake_name: cake.name,
      quantity: parseInt(tempTemplateQty)
    }]);
    setTempTemplateCake('');
    setTempTemplateQty('');
  };

  const handleRemoveTemplateItem = (index) => {
    setKioskTemplateItems(kioskTemplateItems.filter((_, i) => i !== index));
  };

  const handleAddKioskWithTemplate = async (e) => {
    e.preventDefault();
    if(!newKiosk.area) return alert("Harap pilih Area/Rute!");
    if(!newKiosk.name) return alert("Harap isi nama kios!");
    
    setIsSubmitting(true);
    const supabase = getSupabaseWithAuth();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User tidak terautentikasi. Silakan login kembali.');
      }

      const { data: kioskData, error: kioskError } = await supabase.from('kiosks').insert([{
        user_id: user.id,
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
         const { error: templateError } = await supabase.from('kiosk_consignment_templates').insert(templatesPayload);
         if (templateError) throw templateError;
      }
      
      alert('Mitra Kios berhasil ditambahkan!');
      setNewKiosk({ 
        name: '', area: '', address: '', detailed_address: '',
        gmaps_link: '', contact_person: '', phone_number: '', notes: '' 
      });
      setKioskTemplateItems([]);
      onRefetch();
    } catch (err) {
      console.error('Add kiosk error:', err);
      alert(err.message || 'Gagal menambah kiosk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Form Tambah Mitra */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-indigo-600" /> Tambah Mitra Baru
        </h2>
        <form onSubmit={handleAddKioskWithTemplate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Nama Kios *</label>
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
            <label className="text-xs font-semibold text-gray-500 uppercase">Area / Rute *</label>
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
              placeholder="Jl. Contoh No. 123"
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
            <label className="block text-xs font-bold text-orange-800 uppercase mb-2">
              Rencana Titipan Rutin (Opsional)
              {cakes.length === 0 && (
                <span className="text-red-500 text-xs ml-2">(Data kue belum tersedia)</span>
              )}
            </label>
            
            <div className="flex gap-2 mb-2">
              <select 
                value={tempTemplateCake} 
                onChange={e => setTempTemplateCake(e.target.value)} 
                className="flex-1 px-2 py-2 text-sm border rounded bg-white"
                disabled={cakes.length === 0}
              >
                <option value="">{cakes.length === 0 ? "Tidak ada kue tersedia" : "Pilih Kue"}</option>
                {cakes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input 
                type="number" 
                value={tempTemplateQty} 
                onChange={e => setTempTemplateQty(e.target.value)} 
                placeholder="Qty" 
                className="w-16 px-2 py-2 text-sm border rounded"
                min="1"
                disabled={cakes.length === 0}
              />
              <button 
                type="button" 
                onClick={handleAddTemplateItem} 
                className="bg-orange-600 text-white px-3 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!tempTemplateCake || !tempTemplateQty || cakes.length === 0}
              >
                +
              </button>
            </div>
            
            {cakes.length === 0 && (
              <p className="text-xs text-red-500 mb-2">
                Tidak dapat menambah template karena data kue belum tersedia. Pastikan kue sudah ditambahkan terlebih dahulu.
              </p>
            )}
            
            {kioskTemplateItems.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-orange-800 mb-2">Template yang akan ditambahkan:</p>
                <ul className="space-y-2">
                  {kioskTemplateItems.map((t, idx) => (
                    <li key={idx} className="text-xs flex justify-between items-center bg-white px-3 py-2 rounded border border-orange-200">
                      <div>
                        <span className="font-medium">{t.cake_name}</span>
                        <span className="text-gray-500 ml-2">({t.quantity} pcs)</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveTemplateItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button 
            disabled={isSubmitting} 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mt-4 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </span>
            ) : (
              'Simpan Mitra & Template'
            )}
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
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{area}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {areaKiosks.length} Mitra
                  </span>
                </div>
              </div>
              <div className="p-4 grid gap-3 sm:grid-cols-2">
                {areaKiosks.map(k => (
                  <div key={k.id} className={`border p-4 rounded-lg transition-all duration-200 relative group ${
                    k.is_active 
                      ? 'bg-white hover:border-indigo-400 hover:shadow-md' 
                      : 'bg-gray-100 border-gray-200 opacity-75'
                  }`}>
                    
                    <div className="absolute top-3 right-3 flex gap-2">
                      {!k.is_active && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">
                          NON-AKTIF
                        </span>
                      )}
                      <button 
                        onClick={() => onToggleKioskStatus(k)}
                        className={`p-1 rounded-full transition-colors ${
                          k.is_active 
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' 
                            : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                        }`}
                        title={k.is_active ? "Non-aktifkan Mitra" : "Aktifkan Mitra"}
                      >
                        {k.is_active ? <PowerOff size={16}/> : <Power size={16}/>}
                      </button>
                    </div>

                    <div className="pr-12">
                      <h4 className={`font-bold text-lg mb-2 ${
                        !k.is_active ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {k.name}
                      </h4>
                      
                      {k.address && (
                        <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          {k.address}
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        {k.contact_person && (
                          <p className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="bg-gray-100 p-1 rounded">👤</span>
                            {k.contact_person}
                          </p>
                        )}
                        {k.phone_number && (
                          <p className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="bg-gray-100 p-1 rounded">📞</span>
                            {k.phone_number}
                          </p>
                        )}
                      </div>
                      
                      {k.gmaps_link && (
                        <a 
                          href={k.gmaps_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 text-xs flex items-center gap-1 mt-2 hover:text-blue-800"
                        >
                          <MapPin size={12}/> Lihat di Google Maps
                        </a>
                      )}
                    </div>
                    
                    {/* Template Info */}
                    {k.kiosk_consignment_templates?.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Titipan Rutin:</div>
                        <div className="flex flex-wrap gap-1">
                          {k.kiosk_consignment_templates.map((t, i) => (
                            <span 
                              key={i} 
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200"
                            >
                              {t.cakes?.name}: {t.default_quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-400 italic">
                          Belum ada template titipan rutin
                        </div>
                      </div>
                    )}
                    
                    {/* Edit Button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onShowKioskDetail(k)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        <MapPin size={12} />
                        Edit Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {kiosks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            {/* <Store className="mx-auto text-gray-200 mb-3" size={48}/> */}
            <p className="text-gray-400 font-medium">Belum ada data mitra kios</p>
            <p className="text-gray-400 text-sm mt-1">Tambahkan mitra kios pertama Anda di form sebelah kiri</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskManagement;