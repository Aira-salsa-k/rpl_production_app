import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Filter, Calendar, MapPin, Package, TrendingUp, AlertTriangle } from 'lucide-react';

// Helper functions
const formatIDR = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(num || 0));

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Laporan Produksi
export function ProductionReport() {
  const { getSupabaseWithAuth } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    cakeName: ''
  });

  const fetchProductionData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      let query = supabase
        .from('productions')
        .select(`
          *,
          recipe_id (
            cake_id (
              id, name
            )
          )
        `)
        .order('production_date', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('production_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('production_date', filters.endDate + 'T23:59:59');
      }

      const { data: productions, error } = await query;

      if (error) throw error;

      // Process data
      const processedData = productions.map(prod => ({
        id: prod.id,
        productionDate: prod.production_date,
        cakeName: prod.recipe_id?.cake_id?.name || 'Unknown',
        batchCount: prod.batch_count,
        totalOutput: prod.total_output,
        totalCost: prod.total_cost,
        costPerPiece: prod.total_cost / prod.total_output,
        expiredDate: prod.expired_date
      }));

      // Filter by cake name if specified
      const filteredData = filters.cakeName 
        ? processedData.filter(item => 
            item.cakeName.toLowerCase().includes(filters.cakeName.toLowerCase()))
        : processedData;

      setData(filteredData);

    } catch (error) {
      console.error('Error fetching production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text('LAPORAN PRODUKSI', 105, 15, { align: 'center' });
    
    // Date range
    doc.setFontSize(10);
    let dateRange = 'Semua Tanggal';
    if (filters.startDate && filters.endDate) {
      dateRange = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    } else if (filters.startDate) {
      dateRange = `Dari ${formatDate(filters.startDate)}`;
    } else if (filters.endDate) {
      dateRange = `Sampai ${formatDate(filters.endDate)}`;
    }
    doc.text(`Periode: ${dateRange}`, 105, 22, { align: 'center' });

    // Summary
    const totalOutput = data.reduce((sum, item) => sum + item.totalOutput, 0);
    const totalCost = data.reduce((sum, item) => sum + item.totalCost, 0);
    const totalBatches = data.reduce((sum, item) => sum + item.batchCount, 0);

    doc.text(`Total Produksi: ${totalOutput.toLocaleString()} pcs | Total Batch: ${totalBatches} | Total Biaya: ${formatIDR(totalCost)}`, 14, 32);

    // Table
    const tableData = data.map(item => [
      formatDate(item.productionDate),
      item.cakeName,
      item.batchCount.toLocaleString(),
      item.totalOutput.toLocaleString(),
      formatIDR(item.totalCost),
      formatIDR(item.costPerPiece),
      formatDate(item.expiredDate)
    ]);

    autoTable(doc,{
      startY: 40,
      head: [['Tanggal', 'Nama Kue', 'Batch', 'Output (pcs)', 'Total Biaya', 'Biaya per Pcs', 'Kadaluarsa']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 135, 245] }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`laporan-produksi-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchProductionData();
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Package className="mr-2 text-blue-600" size={24} />
            Laporan Produksi
          </h2>
          <button
            onClick={exportToPDF}
            disabled={loading || data.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kue</label>
            <input
              type="text"
              value={filters.cakeName}
              onChange={(e) => setFilters(prev => ({ ...prev, cakeName: e.target.value }))}
              placeholder="Filter nama kue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', cakeName: '' })}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Memuat data produksi...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <div className="text-gray-500">Tidak ada data produksi</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal Produksi</th>
                  <th className="px-4 py-3 font-medium">Nama Kue</th>
                  <th className="px-4 py-3 font-medium text-right">Batch</th>
                  <th className="px-4 py-3 font-medium text-right">Output (pcs)</th>
                  <th className="px-4 py-3 font-medium text-right">Total Biaya</th>
                  <th className="px-4 py-3 font-medium text-right">Biaya per Pcs</th>
                  <th className="px-4 py-3 font-medium">Kadaluarsa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(item.productionDate)}</td>
                    <td className="px-4 py-3 font-medium">{item.cakeName}</td>
                    <td className="px-4 py-3 text-right">{item.batchCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{item.totalOutput.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{formatIDR(item.totalCost)}</td>
                    <td className="px-4 py-3 text-right">{formatIDR(item.costPerPiece)}</td>
                    <td className="px-4 py-3">{formatDate(item.expiredDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



// ... formatIDR dan formatDate tetap sama ...

// Laporan Distribusi yang Diperbaiki
export function DistributionReport() {
  const { getSupabaseWithAuth } = useAuth();
  const [data, setData] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    area: ''
  });

  const fetchDistributionData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      // Get unique areas first
      const { data: kiosksData, error: kiosksError } = await supabase
        .from('kiosks')
        .select('area')
        .not('area', 'is', null);

      if (kiosksError) throw kiosksError;
      
      const uniqueAreas = [...new Set(kiosksData.map(k => k.area))].filter(area => area);
      setAreas(uniqueAreas);

      // Fetch distribution data
      let query = supabase
        .from('distributions')
        .select(`
          *,
          distribution_items (
            quantity_sent,
            quantity_sold,
            quantity_damaged_at_location,
            cake_id (
              id, name, price_per_piece
            )
          ),
          kiosk_id (
            id, name, area
          )
        `)
        .order('distribution_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('distribution_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('distribution_date', filters.endDate + 'T23:59:59');
      }
      if (filters.area) {
        query = query.eq('kiosk_id.area', filters.area);
      }

      const { data: distributions, error } = await query;

      if (error) throw error;

      // Process data dengan agregasi - grouping by distribution_date, kiosk_id, dan cake_id
      const aggregatedData = {};
      
      distributions.forEach(dist => {
        const distDate = new Date(dist.distribution_date).toDateString();
        const kioskId = dist.kiosk_id?.id;
        
        dist.distribution_items?.forEach(item => {
          const cakeId = item.cake_id?.id;
          const key = `${distDate}-${kioskId}-${cakeId}`;
          
          if (!aggregatedData[key]) {
            // Data baru
            aggregatedData[key] = {
              id: key,
              distributionDate: dist.distribution_date,
              kioskName: dist.kiosk_id?.name,
              area: dist.kiosk_id?.area,
              cakeName: item.cake_id?.name,
              quantitySent: 0,
              quantitySold: 0,
              quantityDamaged: 0,
              pricePerPiece: item.cake_id?.price_per_piece,
              location: dist.location
            };
          }
          
          // Agregasi quantity
          aggregatedData[key].quantitySent += item.quantity_sent || 0;
          aggregatedData[key].quantitySold += item.quantity_sold || 0;
          aggregatedData[key].quantityDamaged += item.quantity_damaged_at_location || 0;
        });
      });

      // Convert to array dan sort by date
      const processedData = Object.values(aggregatedData)
        .sort((a, b) => new Date(b.distributionDate) - new Date(a.distributionDate));

      setData(processedData);

    } catch (error) {
      console.error('Error fetching distribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('LAPORAN DISTRIBUSI', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    let dateRange = 'Semua Tanggal';
    if (filters.startDate && filters.endDate) {
      dateRange = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    }
    let areaFilter = filters.area ? ` | Area: ${filters.area}` : '';
    doc.text(`Periode: ${dateRange}${areaFilter}`, 105, 22, { align: 'center' });

    // Summary by area
    const areaSummary = {};
    data.forEach(item => {
      if (!areaSummary[item.area]) {
        areaSummary[item.area] = {
          totalSent: 0,
          totalSold: 0,
          totalDamaged: 0,
          kiosks: new Set()
        };
      }
      areaSummary[item.area].totalSent += item.quantitySent;
      areaSummary[item.area].totalSold += item.quantitySold;
      areaSummary[item.area].totalDamaged += item.quantityDamaged;
      areaSummary[item.area].kiosks.add(item.kioskName);
    });

    let yPos = 32;
    Object.entries(areaSummary).forEach(([area, stats]) => {
      const text = `${area}: ${stats.kiosks.size} kiosk, ${stats.totalSent} pcs dikirim, ${stats.totalSold} pcs terjual, ${stats.totalDamaged} pcs rusak`;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(text, 14, yPos);
      yPos += 6;
    });

    yPos += 4;

    // Table - PERBAIKAN: menggunakan autoTable yang benar
    const tableData = data.map(item => [
      formatDate(item.distributionDate),
      item.kioskName,
      item.area,
      item.cakeName,
      item.quantitySent.toString(),
      item.quantitySold.toString(),
      item.quantityDamaged.toString(),
      item.quantitySent > 0 ? `${((item.quantitySold / item.quantitySent) * 100).toFixed(1)}%` : '0%'
    ]);

    // PERBAIKAN: Gunakan autoTable seperti ini
    autoTable(doc, {
      startY: yPos,
      head: [['Tanggal', 'Kiosk', 'Area', 'Kue', 'Dikirim', 'Terjual', 'Rusak', 'Penjualan']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`laporan-distribusi-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchDistributionData();
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <MapPin className="mr-2 text-indigo-600" size={24} />
            Laporan Distribusi
          </h2>
          <button
            onClick={exportToPDF}
            disabled={loading || data.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
            <select
              value={filters.area}
              onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Area</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Memuat data distribusi...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
            <div className="text-gray-500">Tidak ada data distribusi</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Kiosk</th>
                  <th className="px-4 py-3 font-medium">Area</th>
                  <th className="px-4 py-3 font-medium">Kue</th>
                  <th className="px-4 py-3 font-medium text-right">Dikirim</th>
                  <th className="px-4 py-3 font-medium text-right">Terjual</th>
                  <th className="px-4 py-3 font-medium text-right">Rusak</th>
                  <th className="px-4 py-3 font-medium text-right">Penjualan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(item.distributionDate)}</td>
                    <td className="px-4 py-3 font-medium">{item.kioskName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {item.area}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.cakeName}</td>
                    <td className="px-4 py-3 text-right">{item.quantitySent}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {item.quantitySold}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {item.quantityDamaged}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.quantitySent > 0 ? `${((item.quantitySold / item.quantitySent) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Laporan Penjualan & Kerusakan
export function SalesReport() {
  const { getSupabaseWithAuth } = useAuth();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    viewBy: 'cake' // 'cake' or 'area'
  });

  const fetchSalesData = async () => {
    setLoading(true);
    const supabase = getSupabaseWithAuth();

    try {
      let query = supabase
        .from('distributions')
        .select(`
          distribution_date,
          kiosk_id (
            area
          ),
          distribution_items (
            quantity_sold,
            quantity_damaged_at_location,
            price_at_distribution,
            cake_id (
              id, name
            )
          )
        `)
        .order('distribution_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('distribution_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('distribution_date', filters.endDate + 'T23:59:59');
      }

      const { data: distributions, error } = await query;

      if (error) throw error;

      // Process data based on view type
      let processedData = [];
      const summaryData = {
        totalSold: 0,
        totalDamaged: 0,
        totalRevenue: 0
      };

      if (filters.viewBy === 'cake') {
        const cakeMap = {};
        
        distributions.forEach(dist => {
          dist.distribution_items?.forEach(item => {
            const cakeId = item.cake_id?.id;
            if (!cakeMap[cakeId]) {
              cakeMap[cakeId] = {
                id: cakeId,
                name: item.cake_id?.name || 'Unknown',
                totalSold: 0,
                totalDamaged: 0,
                totalRevenue: 0
              };
            }
            
            cakeMap[cakeId].totalSold += item.quantity_sold;
            cakeMap[cakeId].totalDamaged += item.quantity_damaged_at_location;
            cakeMap[cakeId].totalRevenue += item.quantity_sold * (item.price_at_distribution || 0);

            summaryData.totalSold += item.quantity_sold;
            summaryData.totalDamaged += item.quantity_damaged_at_location;
            summaryData.totalRevenue += item.quantity_sold * (item.price_at_distribution || 0);
          });
        });

        processedData = Object.values(cakeMap);
      } else {
        const areaMap = {};
        
        distributions.forEach(dist => {
          const area = dist.kiosk_id?.area || 'Unknown';
          
          dist.distribution_items?.forEach(item => {
            if (!areaMap[area]) {
              areaMap[area] = {
                name: area,
                totalSold: 0,
                totalDamaged: 0,
                totalRevenue: 0
              };
            }
            
            areaMap[area].totalSold += item.quantity_sold;
            areaMap[area].totalDamaged += item.quantity_damaged_at_location;
            areaMap[area].totalRevenue += item.quantity_sold * (item.price_at_distribution || 0);

            summaryData.totalSold += item.quantity_sold;
            summaryData.totalDamaged += item.quantity_damaged_at_location;
            summaryData.totalRevenue += item.quantity_sold * (item.price_at_distribution || 0);
          });
        });

        processedData = Object.values(areaMap);
      }

      setData(processedData);
      setSummary(summaryData);

    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('LAPORAN PENJUALAN & KERUSAKAN', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    let dateRange = 'Semua Tanggal';
    if (filters.startDate && filters.endDate) {
      dateRange = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    }
    doc.text(`Periode: ${dateRange} | View By: ${filters.viewBy === 'cake' ? 'Kue' : 'Area'}`, 105, 22, { align: 'center' });

    // Summary
    doc.text(`Total Terjual: ${summary.totalSold.toLocaleString()} pcs | Total Rusak: ${summary.totalDamaged.toLocaleString()} pcs | Total Revenue: ${formatIDR(summary.totalRevenue)}`, 14, 32);

    // Table
    const tableData = data.map(item => [
      item.name,
      item.totalSold.toLocaleString(),
      item.totalDamaged.toLocaleString(),
      `${((item.totalDamaged / (item.totalSold + item.totalDamaged)) * 100).toFixed(1)}%`,
      formatIDR(item.totalRevenue)
    ]);

    const headers = filters.viewBy === 'cake' 
      ? ['Nama Kue', 'Terjual', 'Rusak', '% Rusak', 'Total Revenue']
      : ['Area', 'Terjual', 'Rusak', '% Rusak', 'Total Revenue'];

    doc.autoTable({
      startY: 40,
      head: [headers],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleDateString('id-ID')} - Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`laporan-penjualan-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchSalesData();
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={24} />
            Laporan Penjualan & Kerusakan
          </h2>
          <button
            onClick={exportToPDF}
            disabled={loading || data.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tampilkan Berdasarkan</label>
            <select
              value={filters.viewBy}
              onChange={(e) => setFilters(prev => ({ ...prev, viewBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="cake">Nama Kue</option>
              <option value="area">Area</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-800 font-semibold">Total Terjual</div>
              <div className="text-2xl font-bold text-green-900">{summary.totalSold.toLocaleString()} pcs</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-red-800 font-semibold">Total Rusak</div>
              <div className="text-2xl font-bold text-red-900">{summary.totalDamaged.toLocaleString()} pcs</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-800 font-semibold">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-900">{formatIDR(summary.totalRevenue)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Memuat data penjualan...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-2" />
            <div className="text-gray-500">Tidak ada data penjualan</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    {filters.viewBy === 'cake' ? 'Nama Kue' : 'Area'}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Terjual</th>
                  <th className="px-4 py-3 font-medium text-right">Rusak</th>
                  <th className="px-4 py-3 font-medium text-right">% Rusak</th>
                  <th className="px-4 py-3 font-medium text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {item.totalSold.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {item.totalDamaged.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (item.totalDamaged / (item.totalSold + item.totalDamaged)) > 0.1 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {((item.totalDamaged / (item.totalSold + item.totalDamaged)) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatIDR(item.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Reports Component dengan Tab
export default function Reports() {
  const [activeTab, setActiveTab] = useState('production');

  const tabs = [
    { id: 'production', name: 'Produksi', component: <ProductionReport /> },
    { id: 'distribution', name: 'Distribusi', component: <DistributionReport /> },
    { id: 'sales', name: 'Penjualan & Kerusakan', component: <SalesReport /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600 mt-2">Kelola dan ekspor laporan produksi, distribusi, dan penjualan</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Active Tab Content */}
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}