import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, CheckCircle, Clock, AlertTriangle, Search, Filter, 
  UploadCloud, FileSpreadsheet, RefreshCw, Trash2, CheckSquare, 
  Square, ShieldAlert, ShieldCheck, Mail, Phone, Building, 
  ChevronLeft, ChevronRight, X, AlertCircle, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getApiUrl } from '../utils/apiBase';

const PROTECTED_ADMIN_IDS = ['24051', '17572', '10001', '001'];

export default function SuperAdminVerification({ 
  viewType = 'table', 
  onOpenHRImport, 
  isMobile = false
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState(viewType || 'table');
  const [uploadCategory, setUploadCategory] = useState('Faculty'); // 'Faculty' or 'Admin'
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'single'
  const [singleForm, setSingleForm] = useState({
    staffId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    role: ''
  });
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'FACULTY', 'ADMIN'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Active', 'Pre-Authorized'
  const [selectedIds, setSelectedIds] = useState([]);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);

  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'processing', 'success', 'error', 'preview'
  const [importSummary, setImportSummary] = useState(null);
  const [parsedPreviewRows, setParsedPreviewRows] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // =========================================================================
  // Fetch Authoritative Records from MongoDB /api/sync-verification
  // =========================================================================
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/sync-verification'));
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.records)) {
        setRecords(data.records);
        try { localStorage.setItem('ctu_staff_verification', JSON.stringify(data.records)); } catch (e) {}
      } else {
        throw new Error(data.error || 'Failed to fetch verification records');
      }
    } catch (e) {
      console.warn("Using local cache fallback for staff verification:", e.message);
      try {
        const cached = JSON.parse(localStorage.getItem('ctu_staff_verification') || '[]');
        if (Array.isArray(cached) && cached.length > 0) {
          setRecords(cached);
        }
      } catch (err) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const handleUpdate = () => fetchRecords();
    window.addEventListener('ctu_records_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ctu_records_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // =========================================================================
  // Pure Authoritative Metrics Derived Directly from Records
  // =========================================================================
  const totalStaffCount = records.length;
  const facultyCount = records.filter(r => r.category === 'Faculty').length;
  const adminCount = records.filter(r => r.category === 'Admin').length;
  const preAuthorizedCount = records.filter(r => r.status === 'Pre-Authorized').length;
  const activeCount = records.filter(r => r.status === 'Active').length;

  // =========================================================================
  // Intelligent Column Detection & Excel/CSV Parsing
  // =========================================================================
  const classifyColumn = (colStr) => {
    const s = String(colStr || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    if (s === 's no' || s === 'sr no' || s === 'sno' || s === 'sr' || s === 'serial no' || s === 'serial' || s === 'sl no' || s === 'sl' || s === 'row' || s === 'row no' || s === '#') return 'sr';
    if (s.includes('email') || s.includes('mail')) return 'email';
    if (s.includes('contact') || s.includes('mobile') || s.includes('phone') || s === 'cell') return 'phone';
    if (s.includes('school') || s.includes('dept') || s.includes('department') || s.includes('branch') || s.includes('institute')) return 'dept';
    if (s.includes('designation') || s.includes('role') || s.includes('post') || s.includes('title')) return 'designation';
    if (s.includes('emp') || s.includes('employee') || s.includes('staff id') || s === 'id' || s === 'code') return 'empId';
    if (s.includes('name')) return 'name';
    return null;
  };

  const isDeptString = (str) => {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim().toLowerCase();
    if (s.length < 3) return false;
    return (
      s.includes('school') || s.includes('dept') || s.includes('department') ||
      s.includes('engineering') || s.includes('technology') || s.includes('management') ||
      s.includes('agriculture') || s.includes('design') || s.includes('innovation') ||
      s.includes('pharm') || s.includes('health') || s.includes('hotel') ||
      s.includes('tourism') || s.includes('social') || s.includes('liberal') ||
      s.includes('humanities') || s.includes('law') || s.includes('sciences') ||
      s.includes('applied') || s.includes('pec') || s.includes('administration') ||
      s.includes('support') || s.includes('crc') || s.includes('corporate')
    );
  };

  const processFile = async (file) => {
    setUploadStatus('processing');
    setImportSummary(null);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (!rawRows || rawRows.length < 2) {
        throw new Error("The uploaded spreadsheet contains no readable data rows.");
      }

      // Locate header row
      let headerRowIdx = -1;
      let colMap = { sr: -1, empId: -1, name: -1, email: -1, phone: -1, dept: -1, designation: -1 };

      for (let r = 0; r < Math.min(10, rawRows.length); r++) {
        const row = rawRows[r];
        if (!Array.isArray(row)) continue;
        const matched = {};
        row.forEach((c, idx) => {
          const type = classifyColumn(c);
          if (type && matched[type] === undefined) matched[type] = idx;
        });

        if ((matched.sr !== undefined || matched.empId !== undefined) && matched.name !== undefined) {
          headerRowIdx = r;
          colMap = {
            sr: matched.sr ?? -1,
            empId: matched.empId ?? -1,
            name: matched.name ?? -1,
            email: matched.email ?? -1,
            phone: matched.phone ?? -1,
            dept: matched.dept ?? -1,
            designation: matched.designation ?? -1
          };
          break;
        }
      }

      if (headerRowIdx === -1) {
        colMap = { sr: 0, empId: 1, name: 2, email: 3, phone: 4, dept: 5, designation: -1 };
      }

      const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
      let activeCascadingDept = 'School of Agriculture & Natural Sciences';
      const parsedRecords = [];
      const seenIds = new Set();

      for (let i = startRow; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!Array.isArray(row) || row.length === 0) continue;

        const firstCell = String(row[0] || '').trim();
        const deptCell = colMap.dept >= 0 ? String(row[colMap.dept] || '').trim() : '';

        if (isDeptString(firstCell) && !row[colMap.empId] && !row[colMap.name]) {
          activeCascadingDept = firstCell;
          continue;
        }
        if (isDeptString(deptCell) && !row[colMap.empId] && !row[colMap.name]) {
          activeCascadingDept = deptCell;
          continue;
        }

        const staffIdStr = colMap.empId >= 0 ? String(row[colMap.empId] || '').trim() : '';
        const nameStr = colMap.name >= 0 ? String(row[colMap.name] || '').trim() : '';
        const emailStr = colMap.email >= 0 ? String(row[colMap.email] || '').trim() : '';
        const phoneStr = colMap.phone >= 0 ? String(row[colMap.phone] || '').trim() : '';
        const rowDept = colMap.dept >= 0 ? String(row[colMap.dept] || '').trim() : '';
        const rawRole = colMap.designation >= 0 ? String(row[colMap.designation] || '').trim() : '';

        if (rowDept && isDeptString(rowDept)) {
          activeCascadingDept = rowDept;
        }

        if (!staffIdStr && !nameStr && !emailStr) continue;

        // Skip headers accidentally included
        const lowerId = staffIdStr.toLowerCase();
        if (lowerId === 'emp id' || lowerId === 'emp code' || lowerId === 'staff id' || lowerId === 'code' || lowerId === 'sno') continue;

        const finalStaffId = staffIdStr || (emailStr ? emailStr.split('@')[0].replace(/\D/g, '') : `26${100 + i}`);
        if (seenIds.has(finalStaffId.toLowerCase())) continue;
        seenIds.add(finalStaffId.toLowerCase());

        const isExplicitAdmin = 
          uploadCategory === 'Admin' ||
          rawRole.toLowerCase().includes('admin') || 
          rawRole.toLowerCase().includes('hr') || 
          rawRole.toLowerCase().includes('dean') ||
          rawRole.toLowerCase().includes('director') ||
          rawRole.toLowerCase().includes('registrar') ||
          rawRole.toLowerCase().includes('head') ||
          rawRole.toLowerCase().includes('hod') ||
          finalStaffId.toLowerCase().startsWith('adm') ||
          finalStaffId.toLowerCase().startsWith('ctu-adm') ||
          PROTECTED_ADMIN_IDS.includes(finalStaffId);

        const category = isExplicitAdmin ? 'Admin' : 'Faculty';
        const role = rawRole || (isExplicitAdmin ? 'Administrative Staff' : 'Faculty Member');
        const defaultDept = isExplicitAdmin ? 'University Administration' : activeCascadingDept;

        parsedRecords.push({
          staffId: finalStaffId,
          name: nameStr || `Staff Member ${finalStaffId}`,
          email: emailStr,
          department: rowDept || defaultDept,
          phone: phoneStr,
          role,
          category,
          status: 'Pre-Authorized'
        });
      }

      if (parsedRecords.length === 0) {
        throw new Error("No valid staff records with Staff ID and Name could be parsed from the file.");
      }


      // Execute POST to authoritative backend
      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRecords })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Backend failed to write records to MongoDB.");
      }

      // Success confirmed by backend: Refresh authoritative database records
      setImportSummary({
        submitted: result.submittedCount,
        valid: result.validCount,
        inserted: result.insertedCount,
        updated: result.updatedCount,
        verifiedInDatabase: result.verifiedInDatabase,
        errors: result.errors || []
      });
      setUploadStatus('success');

      // Re-fetch authoritative records from server
      await fetchRecords();
      window.dispatchEvent(new Event('ctu_records_updated'));

      // Automatically return to table view after 1.5s
      setTimeout(() => {
        setActiveViewMode('table');
      }, 1500);

    } catch (e) {
      console.error('File parsing error:', e);
      setUploadStatus('error');
      setImportSummary({ errorMsg: e.message });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle Single Staff Member Pre-Authorization Form Submission
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleForm.staffId.trim() || !singleForm.name.trim()) {
      alert('Please enter required fields: Staff ID and Full Name.');
      return;
    }

    setSingleSubmitting(true);
    try {
      const defaultDept = uploadCategory === 'Admin' ? 'University Administration' : 'School of Engineering & Technology';
      const defaultRole = uploadCategory === 'Admin' ? 'Administrative Staff' : 'Faculty Member';

      const payload = [{
        staffId: singleForm.staffId.trim(),
        name: singleForm.name.trim(),
        email: singleForm.email.trim(),
        phone: singleForm.phone.trim(),
        department: singleForm.department.trim() || defaultDept,
        role: singleForm.role.trim() || defaultRole,
        category: uploadCategory,
        status: 'Pre-Authorized'
      }];

      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: payload })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Backend failed to save staff record.');
      }

      alert(`✅ Pre-Authorization Confirmed!\n\n• Name: ${singleForm.name.trim()}\n• Staff ID: ${singleForm.staffId.trim()}\n• Pool: ${uploadCategory}\n• Status: Pre-Authorized\n\nThe candidate can now self-register on the Login page!`);

      setSingleForm({
        staffId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        role: ''
      });

      await fetchRecords();
      window.dispatchEvent(new Event('ctu_records_updated'));
      setActiveViewMode('table');

    } catch (err) {
      alert(`Failed to pre-authorize staff: ${err.message}`);
    } finally {
      setSingleSubmitting(false);
    }
  };


  // =========================================================================
  // Single and Bulk Deletion Handlers with Super Admin Protection
  // =========================================================================
  const handleDeleteSingle = async (staffId) => {
    if (PROTECTED_ADMIN_IDS.includes(staffId)) {
      alert(`Staff ID "${staffId}" is a protected permanent Super Admin and cannot be deleted.`);
      return;
    }
    try {
      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', staffId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deletion failed');
      }
      setSelectedIds(prev => prev.filter(id => id !== staffId));
      setMemberToDelete(null);
      await fetchRecords();
      window.dispatchEvent(new Event('ctu_records_updated'));
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-delete', staffIds: selectedIds })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Bulk delete failed');
      }
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      await fetchRecords();
      window.dispatchEvent(new Event('ctu_records_updated'));
    } catch (err) {
      alert(`Bulk delete error: ${err.message}`);
    }
  };

  const handleWipeAll = async () => {
    try {
      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'wipe-all' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Wipe failed');
      }
      setShowWipeModal(false);
      setSelectedIds([]);
      await fetchRecords();
      window.dispatchEvent(new Event('ctu_records_updated'));
      alert(data.message || 'Wipe complete.');
    } catch (err) {
      alert(`Wipe error: ${err.message}`);
    }
  };

  // =========================================================================
  // Filtered & Paginated Records
  // =========================================================================
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (item.staffId && item.staffId.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q));

      const matchesCat = 
        categoryFilter === 'ALL' || 
        (item.category && item.category.toUpperCase() === categoryFilter);

      const matchesStatus = 
        statusFilter === 'ALL' || 
        item.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [records, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleSelectAllFiltered = () => {
    const filterableIds = filteredRecords
      .map(r => r.staffId)
      .filter(id => !PROTECTED_ADMIN_IDS.includes(id));
    
    if (selectedIds.length === filterableIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filterableIds);
    }
  };

  const toggleSelectOne = (staffId) => {
    if (PROTECTED_ADMIN_IDS.includes(staffId)) return;
    setSelectedIds(prev => 
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', icon: <CheckCircle size={13} />, label: 'Active' };
    }
    return { bg: '#fefce8', text: '#854d0e', border: '#fef08a', icon: <Clock size={13} />, label: 'Pre-Authorized' };
  };

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '28px', display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top View Mode Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveViewMode('table')}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: activeViewMode === 'table' ? '#0f172a' : '#ffffff',
              color: activeViewMode === 'table' ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeViewMode === 'table' ? '0 4px 10px rgba(15,23,42,0.15)' : 'none'
            }}
          >
            <Users size={16} />
            <span>Staff Records Table</span>
          </button>

          <button
            onClick={() => setActiveViewMode('import')}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: activeViewMode === 'import' ? '#2563eb' : '#ffffff',
              color: activeViewMode === 'import' ? '#ffffff' : '#2563eb',
              border: activeViewMode === 'import' ? 'none' : '1px solid #93c5fd',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeViewMode === 'import' ? '0 4px 10px rgba(37,99,235,0.25)' : 'none'
            }}
          >
            <UploadCloud size={16} />
            <span>📥 Upload Pre-Authorized Faculty (.xlsx / .csv)</span>
          </button>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* VIEW 1: Upload Dropzone Screen */}
      {activeViewMode === 'import' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Upload Pre-Authorized Faculty & Staff
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                Uploaded teachers enter the <strong>Pre-Authorization Pool</strong>. Once they self-register on the login page, they move to the Active Working Faculty roster.
              </p>
            </div>
            <button
              onClick={() => setActiveViewMode('table')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
            >
              ⬅️ View Staff Table
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '24px' }}>
            {/* Left: Upload Zone */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Target Pre-Authorization Pool:
                </h3>

                {/* Faculty vs Admin Toggle */}
                <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setUploadCategory('Faculty')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: uploadCategory === 'Faculty' ? '#2563eb' : 'transparent',
                      color: uploadCategory === 'Faculty' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    🎓 Faculty Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadCategory('Admin')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: uploadCategory === 'Admin' ? '#0f172a' : 'transparent',
                      color: uploadCategory === 'Admin' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    🏛️ Admin Upload
                  </button>
                </div>
              </div>

              <div style={{ 
                marginBottom: '16px', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                background: uploadCategory === 'Admin' ? '#f8fafc' : '#eff6ff', 
                border: uploadCategory === 'Admin' ? '1px solid #cbd5e1' : '1px solid #bfdbfe',
                fontSize: '12.5px',
                color: uploadCategory === 'Admin' ? '#334155' : '#1e40af'
              }}>
                {uploadCategory === 'Admin' ? (
                  <span>🏛️ <strong>Admin Pool Mode:</strong> Uploaded personnel will be pre-authorized with <strong>Administrative Privileges</strong> (Deans, HODs, Registrar, HR, Finance). Upon self-registration, they gain admin capabilities.</span>
                ) : (
                  <span>🎓 <strong>Faculty Pool Mode:</strong> Uploaded teachers will be pre-authorized as <strong>Teaching Faculty</strong>. Upon self-registration, they receive task assignments and faculty workflow tools.</span>
                )}
              </div>
              
              {/* Mode Switcher: Batch File vs Single Entry */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: uploadMode === 'file' ? '#0f172a' : '#ffffff',
                    color: uploadMode === 'file' ? '#ffffff' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileSpreadsheet size={15} />
                  <span>📁 Batch Spreadsheet Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: uploadMode === 'single' ? '#0f172a' : '#ffffff',
                    color: uploadMode === 'single' ? '#ffffff' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>➕ Single Staff Manual Entry</span>
                </button>
              </div>

              {/* OPTION A: File Drag & Drop */}
              {uploadMode === 'file' && (
                <div 
                  onDragEnter={handleDrop} onDragLeave={handleDrop} onDragOver={handleDrop} onDrop={handleDrop}
                  style={{ 
                    border: `2px dashed ${dragActive ? '#3b82f6' : '#cbd5e1'}`, 
                    borderRadius: '12px', background: dragActive ? '#eff6ff' : '#f8fafc',
                    padding: '48px 24px', textAlign: 'center', transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  <input type="file" accept=".csv, .xlsx, .xls" onChange={handleChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: uploadCategory === 'Admin' ? '#f1f5f9' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <UploadCloud size={28} color={uploadCategory === 'Admin' ? '#334155' : '#3b82f6'} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    Choose a file or drag & drop {uploadCategory} spreadsheet here
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Supports Excel (.xlsx, .xls) and CSV files
                  </div>
                </div>
              )}

              {/* OPTION B: Single Staff Member Manual Form */}
              {uploadMode === 'single' && (
                <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Staff ID / Employee Code *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 26115 or ADM-105" 
                        required
                        value={singleForm.staffId}
                        onChange={(e) => setSingleForm(f => ({ ...f, staffId: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dr. Rajesh Sharma" 
                        required
                        value={singleForm.name}
                        onChange={(e) => setSingleForm(f => ({ ...f, name: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Official Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="e.g. rajesh.sharma@ctu.edu.in" 
                        value={singleForm.email}
                        onChange={(e) => setSingleForm(f => ({ ...f, email: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Contact Phone
                      </label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210" 
                        value={singleForm.phone}
                        onChange={(e) => setSingleForm(f => ({ ...f, phone: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Department / School
                      </label>
                      <input 
                        type="text" 
                        placeholder={uploadCategory === 'Admin' ? "e.g. University Administration" : "e.g. School of Engineering & Technology"}
                        value={singleForm.department}
                        onChange={(e) => setSingleForm(f => ({ ...f, department: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Role / Designation
                      </label>
                      <input 
                        type="text" 
                        placeholder={uploadCategory === 'Admin' ? "e.g. Administrative Officer / Dean" : "e.g. Assistant Professor"}
                        value={singleForm.role}
                        onChange={(e) => setSingleForm(f => ({ ...f, role: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={singleSubmitting}
                    style={{
                      marginTop: '8px',
                      padding: '11px 20px',
                      borderRadius: '8px',
                      background: uploadCategory === 'Admin' ? '#0f172a' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      cursor: singleSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {singleSubmitting ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>Saving to Pre-Authorization Pool...</span>
                      </>
                    ) : (
                      <>
                        <span>➕ Pre-Authorize {uploadCategory} Member</span>
                      </>
                    )}
                  </button>
                </form>
              )}



              {uploadStatus === 'processing' && (
                <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontSize: '14px', fontWeight: '700' }}>
                  <RefreshCw size={18} className="spin" /> Processing file and writing to MongoDB...
                </div>
              )}

              {uploadStatus === 'success' && importSummary && (
                <div style={{ marginTop: '18px', padding: '16px', borderRadius: '10px', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px', marginBottom: '6px' }}>
                    <CheckCircle size={20} />
                    <span>Upload & Database Write Confirmed!</span>
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    • Total Submitted: <strong>{importSummary.submitted}</strong><br />
                    • New Pre-Authorized Staff: <strong>{importSummary.inserted}</strong><br />
                    • Updated Master Records: <strong>{importSummary.updated}</strong><br />
                    • Verified in MongoDB: <strong>{importSummary.verifiedInDatabase}</strong>
                  </div>
                  <button
                    onClick={() => setActiveViewMode('table')}
                    style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Open Staff Records Table
                  </button>
                </div>
              )}

              {uploadStatus === 'error' && importSummary && (
                <div style={{ marginTop: '18px', padding: '14px', borderRadius: '10px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '4px' }}>
                    <AlertTriangle size={18} />
                    <span>Upload Failed</span>
                  </div>
                  <div>{importSummary.errorMsg}</div>
                </div>
              )}
            </div>

            {/* Right: Info Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Column Auto-Detection Rules</h4>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                  The engine automatically identifies:
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li><strong>Staff ID</strong>: EMP ID, Staff ID, Code (Preserves "001")</li>
                    <li><strong>Name</strong>: Full Name, Faculty Name</li>
                    <li><strong>Email</strong>: Official Email ID</li>
                    <li><strong>Department</strong>: Cascading hierarchy detection</li>
                    <li><strong>Contact No</strong>: Phone, Mobile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Staff Records Table */}
      {activeViewMode === 'table' && (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Metric Cards Header */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldAlert size={18} color="#dc2626" />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Authoritative Staff & Faculty Directory
                </span>
              </div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Staff & Admin Records
              </h1>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                Direct live view of MongoDB master whitelist (`ctu_staff_verification`).
              </p>
            </div>

            {/* Metric Status Badges */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '8px' : '10px',
              overflowX: 'auto',
              width: isMobile ? '100%' : 'auto',
              paddingBottom: isMobile ? '4px' : '0',
              WebkitOverflowScrolling: 'touch',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '100px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a' }}>{totalStaffCount}</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '90px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Faculty</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#2563eb' }}>{facultyCount}</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '110px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#854d0e', textTransform: 'uppercase' }}>Pre-Authorized</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#b45309' }}>{preAuthorizedCount}</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '110px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Active / Reg</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#15803d' }}>{activeCount}</div>
              </div>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '90px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Admin</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#334155' }}>{adminCount}</div>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            {/* Search & Category Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '280px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search by Staff ID, Name, Department or Email..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px 8px 36px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'FACULTY', 'ADMIN'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: categoryFilter === cat ? '#0f172a' : '#f1f5f9',
                      color: categoryFilter === cat ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    {cat === 'ALL' ? 'All Staff' : cat === 'FACULTY' ? '🎓 Faculty' : '🏛️ Admin'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {selectedIds.length > 0 ? (
                <>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#ef4444' }}>
                    {selectedIds.length} Selected
                  </span>
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <Trash2 size={15} />
                    <span>🗑️ Bulk Delete ({selectedIds.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSelectAllFiltered}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckSquare size={14} />
                    <span>Select All</span>
                  </button>

                  {preAuthorizedCount > 0 && (
                    <button
                      onClick={() => setShowWipeModal(true)}
                      style={{ padding: '8px 12px', borderRadius: '8px', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Permanently remove pre-authorized entries while protecting Super Admins"
                    >
                      <Trash2 size={14} />
                      <span>Wipe Pre-Authorized ({preAuthorizedCount})</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setActiveViewMode('import'); setUploadMode('single'); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span>➕ Add Single Staff</span>
                  </button>

                  <button
                    onClick={() => { setActiveViewMode('import'); setUploadMode('file'); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(37,99,235,0.25)'
                    }}
                  >
                    <UploadCloud size={16} />
                    <span>📥 Upload Pre-Authorized File</span>
                  </button>

                </>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                    <th style={{ padding: '12px 14px', width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAllFiltered}
                        checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.filter(r => !PROTECTED_ADMIN_IDS.includes(r.staffId)).length}
                      />
                    </th>
                    <th style={{ padding: '12px 16px' }}>Staff ID</th>
                    <th style={{ padding: '12px 16px' }}>Employee Name</th>
                    <th style={{ padding: '12px 16px' }}>Department / School</th>
                    <th style={{ padding: '12px 16px' }}>Category & Role</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Contact Info</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((item) => {
                      const isSelected = selectedIds.includes(item.staffId);
                      const isProtectedAdmin = PROTECTED_ADMIN_IDS.includes(item.staffId);
                      const badge = getStatusBadge(item.status);

                      return (
                        <tr key={item.staffId} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : 'transparent', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {!isProtectedAdmin && (
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleSelectOne(item.staffId)}
                              />
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.staffId}</span>
                              {isProtectedAdmin && (
                                <span style={{ fontSize: '9px', background: '#fee2e2', color: '#dc2626', padding: '2px 5px', borderRadius: '4px', fontWeight: '800' }}>
                                  PROTECTED
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e293b' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={14} color="#94a3b8" />
                              <span>{item.department || 'University Administration'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              background: item.category === 'Faculty' ? '#eff6ff' : '#f1f5f9',
                              color: item.category === 'Faculty' ? '#2563eb' : '#334155'
                            }}>
                              {item.category || 'Faculty'}
                            </span>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.role || 'Faculty Member'}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '3px 9px', 
                              borderRadius: '6px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              background: badge.bg, 
                              color: badge.text,
                              border: `1px solid ${badge.border}`
                            }}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                            {item.email && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} color="#94a3b8" /> {item.email}</div>}
                            {item.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={12} color="#94a3b8" /> {item.phone}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {!isProtectedAdmin ? (
                              <button
                                onClick={() => setMemberToDelete(item)}
                                style={{ padding: '5px 10px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Permanent</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                        No staff records match the search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Showing <strong>{filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong> records
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Single Delete Confirmation */}
      {memberToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{memberToDelete.name}</strong> (Staff ID: <code>{memberToDelete.staffId}</code>)? This will remove them from the Pre-Authorization Master Directory.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setMemberToDelete(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSingle(memberToDelete.staffId)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#dc2626', border: 'none', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Delete Confirmation */}
      {showBulkDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Confirm Bulk Delete</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{selectedIds.length} selected staff records</strong>? Permanent Super Admins will be safely preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#dc2626', border: 'none', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Delete {selectedIds.length} Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Wipe All Pre-Authorized Confirmation */}
      {showWipeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '8px' }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Wipe All Pre-Authorized Records?</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
              This will remove all <strong>{preAuthorizedCount} un-registered pre-authorized records</strong> from MongoDB.
              <br /><br />
              🛡️ The <strong>4 Permanent Super Admins</strong> will be protected and preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowWipeModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleWipeAll}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#dc2626', border: 'none', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
