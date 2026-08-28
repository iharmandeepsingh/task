import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, CheckCircle, Clock, AlertTriangle, Search, Filter, 
  UploadCloud, FileSpreadsheet, ArrowUpDown, ChevronLeft, 
  ChevronRight, RefreshCw, Trash2, CheckSquare, Square, 
  ShieldAlert, ShieldCheck, Mail, Phone, Building, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getApiUrl } from '../utils/apiBase';
import { INITIAL_TEAM } from '../data/initialData';

export default function SuperAdminVerification({ 
  viewType = 'table', 
  team = [],
  records: externalRecords = [],
  onOpenHRImport, 
  isMobile = false,
  onDeleteEmployee,
  onBulkDeleteEmployees
}) {
  const [internalRecords, setInternalRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('ctu_staff_verification');
      const parsed = JSON.parse(saved || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL', 'FACULTY', 'ADMIN'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Active', 'Pre-Authorized'
  const [selectedIds, setSelectedIds] = useState([]);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Merge external prop records (from App.jsx state) with internally fetched records
  // External records take priority (most recent), so uploads always show immediately
  const records = useMemo(() => {
    const mergedMap = new Map();
    internalRecords.forEach(r => r?.staffId && mergedMap.set(String(r.staffId).toLowerCase(), r));
    externalRecords.forEach(r => r?.staffId && mergedMap.set(String(r.staffId).toLowerCase(), r));
    return Array.from(mergedMap.values());
  }, [internalRecords, externalRecords]);

  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'processing', 'success', 'error'
  const [importStats, setImportStats] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/sync-verification'));
      if (res.ok) {
        const data = await res.json();
        const mongoRecords = Array.isArray(data.records) ? data.records : [];
        setInternalRecords(mongoRecords);
        if (mongoRecords.length > 0) {
          localStorage.setItem('ctu_staff_verification', JSON.stringify(mongoRecords));
        }
      } else {
        throw new Error("API not ok");
      }
    } catch (e) {
      console.warn("Using cached verification records:", e.message);
      try {
        const localSaved = JSON.parse(localStorage.getItem('ctu_staff_verification') || '[]');
        if (Array.isArray(localSaved) && localSaved.length > 0) {
          setInternalRecords(localSaved);
        }
      } catch (err) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const handleUpdateEvent = () => fetchRecords();
    window.addEventListener('ctu_records_updated', handleUpdateEvent);
    window.addEventListener('storage', handleUpdateEvent);
    return () => {
      window.removeEventListener('ctu_records_updated', handleUpdateEvent);
      window.removeEventListener('storage', handleUpdateEvent);
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = async (file) => {
    setSelectedFile(file);
    setUploadStatus('processing');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (!rawRows || rawRows.length < 2) throw new Error("File appears to be empty or missing data.");

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

      // 1. Locate header row dynamically
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

      // 2. Parse Rows with Cascading Department Forward-Fill
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

        const finalStaffId = staffIdStr || (emailStr ? emailStr.split('@')[0].replace(/\D/g, '') : `26${100 + i}`);
        if (seenIds.has(finalStaffId.toLowerCase())) continue;
        seenIds.add(finalStaffId.toLowerCase());

        const isAdmin = 
          rawRole.toLowerCase().includes('admin') || 
          rawRole.toLowerCase().includes('hr') || 
          finalStaffId.toLowerCase().startsWith('adm') ||
          finalStaffId.toLowerCase().startsWith('ctu-adm') ||
          ['10001', '24051', '17572'].includes(finalStaffId);

        const category = isAdmin ? 'Admin' : 'Faculty';
        const role = rawRole || (isAdmin ? 'Administrative Staff' : 'Faculty Member');

        parsedRecords.push({
          staffId: finalStaffId,
          name: nameStr || `Staff Member ${finalStaffId}`,
          email: emailStr,
          department: rowDept || activeCascadingDept,
          phone: phoneStr,
          role,
          category,
          status: 'Pre-Authorized',
          importedAt: new Date().toISOString()
        });
      }

      if (parsedRecords.length === 0) throw new Error("No valid records could be parsed from file.");

      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: parsedRecords })
      });

      if (!res.ok) throw new Error("Backend failed to synchronize records.");
      
      setImportStats({ count: parsedRecords.length });
      setUploadStatus('success');
      fetchRecords();

    } catch (e) {
      console.error('File parsing error:', e);
      setUploadStatus('error');
      setImportStats({ errorMsg: e.message });
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

  // Master Unified Staff Directory List
  const unifiedStaffList = useMemo(() => {
    const deletedIds = (() => {
      try { return JSON.parse(localStorage.getItem('ctu_deleted_employee_ids') || '[]'); } catch { return []; }
    })();
    const deletedSet = new Set(deletedIds.map(d => String(d).toLowerCase().trim()).filter(Boolean));

    let activeTeamList = Array.isArray(team) && team.length > 0 ? team : [];
    if (activeTeamList.length === 0) {
      try {
        const saved = localStorage.getItem('ctu_team_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) activeTeamList = parsed;
        }
      } catch (e) {}
    }
    if (activeTeamList.length === 0) {
      activeTeamList = INITIAL_TEAM;
    }

    // Helper: derive category strictly from explicit field, fallback to role only if no category set
    const deriveCategory = (item) => {
      const explicitCat = (item.category || '').trim();
      if (explicitCat === 'Faculty') return 'Faculty';
      if (explicitCat === 'Admin') return 'Admin';
      // Only use role heuristics if no explicit category
      const roleStr = (item.role || item.designation || '').toLowerCase();
      if (roleStr.includes('admin') && !roleStr.includes('administrative staff')) return 'Admin';
      if (roleStr.includes('hr') || roleStr.includes('registrar') || roleStr.includes('accountant')) return 'Admin';
      return 'Faculty'; // default to Faculty
    };

    const memberMap = new Map();

    // 1. Add verification/uploaded records FIRST (highest priority — these are the freshly imported ones)
    records.forEach(r => {
      if (!r || !r.staffId) return;
      const sId = String(r.staffId).trim();
      if (!sId || deletedSet.has(sId.toLowerCase())) return;

      const category = deriveCategory(r);

      memberMap.set(sId.toLowerCase(), {
        id: r._id || `pre-${sId}`,
        staffId: sId,
        name: r.name || `Staff Member ${sId}`,
        email: r.email || '',
        phone: r.phone || '',
        department: r.department || (category === 'Admin' ? 'University Administration' : 'School of Engineering & Technology'),
        role: r.role || (category === 'Admin' ? 'Administrative Staff' : 'Faculty Member'),
        category: category,
        status: 'Pre-Authorized',
        source: 'verification'
      });
    });

    // 2. Add active directory team members — skip if already in map from verification (uploaded takes priority)
    activeTeamList.forEach(m => {
      if (!m) return;
      const sId = String(m.employeeId || m.id || '').trim();
      if (!sId || deletedSet.has(sId.toLowerCase())) return;

      // If already added from verification upload, skip (uploaded record takes priority)
      if (memberMap.has(sId.toLowerCase())) return;

      const category = deriveCategory(m);
      const status = (m.password || m.hasAccount || m.status === 'Active' || m.status === 'Registered')
        ? 'Active'
        : (m.status || 'Active');

      memberMap.set(sId.toLowerCase(), {
        id: m.id || `usr-${sId}`,
        staffId: sId,
        name: m.name || `Staff Member ${sId}`,
        email: m.email || '',
        phone: m.phone || '',
        department: m.dept || (category === 'Admin' ? 'University Administration' : 'School of Engineering & Technology'),
        role: m.role || (category === 'Admin' ? 'Administrative Staff' : 'Faculty Member'),
        category: category,
        status: status,
        source: 'directory'
      });
    });

    return Array.from(memberMap.values());
  }, [records, team, externalRecords]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return unifiedStaffList.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (item.staffId && item.staffId.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q));

      const matchesCat = 
        categoryFilter === 'ALL' || 
        item.category.toUpperCase() === categoryFilter;

      const matchesStatus = 
        statusFilter === 'ALL' || 
        item.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [unifiedStaffList, searchQuery, categoryFilter, statusFilter]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Selection Handlers
  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredRecords.map(r => r.staffId || r.id);
    if (selectedIds.length === allFilteredIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Execute Single Delete
  const handleConfirmSingleDelete = () => {
    if (!memberToDelete) return;
    const targetId = memberToDelete.staffId || memberToDelete.id;
    
    // 1. Permanently delete from MongoDB ctu_staff_verification collection
    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', staffId: targetId })
    }).catch(() => {});

    // 2. Permanently delete from team directory and global deleted IDs
    if (onDeleteEmployee) {
      onDeleteEmployee(targetId);
    }

    // 3. Immediately update local states
    setRecords(prev => prev.filter(r => String(r.staffId || '').toLowerCase() !== String(targetId).toLowerCase()));
    setSelectedIds(prev => prev.filter(id => id !== targetId));
    setMemberToDelete(null);
  };

  // Execute Bulk Delete
  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    // 1. Permanently bulk delete from MongoDB ctu_staff_verification collection
    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk-delete', staffIds: selectedIds })
    }).catch(() => {});

    // 2. Permanently bulk delete from team directory and global deleted IDs
    if (onBulkDeleteEmployees) {
      onBulkDeleteEmployees(selectedIds);
    }

    // 3. Immediately remove from local states
    const delSet = new Set(selectedIds.map(s => String(s).toLowerCase()));
    setRecords(prev => prev.filter(r => !delSet.has(String(r.staffId || '').toLowerCase())));
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  // Super Admin: Wipe All Pre-Authorized Data
  const handleWipeAllPreAuthorized = () => {
    const preAuthRecords = unifiedStaffList.filter(r => r.status === 'Pre-Authorized');
    if (preAuthRecords.length === 0) {
      alert('No pre-authorized records to clear.');
      return;
    }

    if (!window.confirm(`⚠️ Permanently delete all ${preAuthRecords.length} Pre-Authorized records from the database and directory? This cannot be undone.`)) {
      return;
    }

    const preAuthIds = preAuthRecords.map(r => r.staffId || r.id).filter(Boolean);

    // 1. Wipe all from MongoDB ctu_staff_verification collection
    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear-all' })
    }).catch(() => {});

    // 2. Remove all from team and add to global deleted IDs
    if (onBulkDeleteEmployees) {
      onBulkDeleteEmployees(preAuthIds);
    }

    // 3. Clear local verification records state
    setRecords([]);
    setSelectedIds([]);
    alert(`✅ Successfully cleared all ${preAuthRecords.length} Pre-Authorized records.`);
  };

  const getStatusColor = (status) => {
    if (status === 'Active' || status === 'Registered') return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={13} /> };
    if (status === 'Pre-Authorized') return { bg: '#fef3c7', text: '#b45309', icon: <Clock size={13} /> };
    return { bg: '#fee2e2', text: '#dc2626', icon: <AlertTriangle size={13} /> };
  };

  return (
    <div style={{ flex: 1, padding: isMobile ? '16px' : '32px', display: 'flex', flexDirection: 'column', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* View: Verification Import */}
      {viewType === 'import' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Verification Import</h2>
            <p style={{ margin: 0, fontSize: '15px', color: '#475569' }}>
              Upload and map batch staff data files to synchronize with the kinetic directory. Supports .csv and .xlsx formats.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '24px' }}>
            {/* Left: Upload Zone */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Source File</h3>
              
              <div 
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                style={{ 
                  border: `2px dashed ${dragActive ? '#3b82f6' : '#cbd5e1'}`, 
                  borderRadius: '12px', background: dragActive ? '#eff6ff' : '#f8fafc',
                  padding: '48px 24px', textAlign: 'center', transition: 'all 0.2s', position: 'relative'
                }}
              >
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <UploadCloud size={24} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  Choose a file or drag & drop it here
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Supports CSV, XLSX up to 50MB
                </div>
              </div>

              {uploadStatus === 'processing' && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                  <RefreshCw size={16} className="spin" /> Processing file and mapping columns...
                </div>
              )}

              {uploadStatus === 'success' && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Successfully imported and pre-authorized {importStats?.count} staff records!
                </div>
              )}

              {uploadStatus === 'error' && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} /> Error: {importStats?.errorMsg || 'Failed to parse file.'}
                </div>
              )}
            </div>

            {/* Right: Info Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Column Auto-Detection</h4>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                  The import engine detects the following columns:
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li><strong>Staff ID</strong>: EMP ID, Code, Staff ID</li>
                    <li><strong>Name</strong>: Full Name, Faculty Name</li>
                    <li><strong>Email</strong>: Official Email ID</li>
                    <li><strong>Department</strong>: Cascading forward-fill</li>
                    <li><strong>Contact No</strong>: Phone, Mobile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View: Table View */}
      {viewType === 'table' && (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Header & Metric Cards */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldAlert size={18} color="#dc2626" />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Super Admin Staff & Admin Management
                </span>
              </div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Staff & Admin Records
              </h1>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                Manage, verify, single delete, and bulk delete faculty and administrative personnel.
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
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#0f172a' }}>{unifiedStaffList.length}</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '110px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Active / Reg</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#15803d' }}>{unifiedStaffList.filter(r => r.status === 'Active').length}</div>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '110px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#854d0e', textTransform: 'uppercase' }}>Pre-Authorized</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#b45309' }}>{unifiedStaffList.filter(r => r.status === 'Pre-Authorized').length}</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '90px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Faculty</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#2563eb' }}>{unifiedStaffList.filter(r => r.category === 'Faculty').length}</div>
              </div>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: isMobile ? '6px 12px' : '8px 14px', textAlign: 'center', minWidth: isMobile ? '90px' : 'auto', flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Admin</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#334155' }}>{unifiedStaffList.filter(r => r.category === 'Admin').length}</div>
              </div>
            </div>
          </div>

          {/* Super Admin Action Bar */}
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
                  placeholder="Search by ID, Name, Department or Email..." 
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

            {/* Super Admin Bulk Delete & Action Buttons */}
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
                    onClick={handleClearSelection}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Selection
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSelectAllFiltered}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckSquare size={14} />
                    <span>Select All ({filteredRecords.length})</span>
                  </button>

                  {unifiedStaffList.some(r => r.status === 'Pre-Authorized') && (
                    <button
                      onClick={handleWipeAllPreAuthorized}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#fff1f2',
                        color: '#be123c',
                        border: '1px solid #fecdd3',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Permanently remove all pre-authorized entries from database"
                    >
                      <Trash2 size={14} />
                      <span>Wipe Pre-Authorized ({unifiedStaffList.filter(r => r.status === 'Pre-Authorized').length})</span>
                    </button>
                  )}

                  {onOpenHRImport && (
                    <button
                      onClick={onOpenHRImport}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <UploadCloud size={15} />
                      <span>+ Upload Data</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Records Table / Mobile Cards */}
          <div style={{ background: isMobile ? 'transparent' : '#ffffff', border: isMobile ? 'none' : '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: isMobile ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            {isMobile ? (
              /* Touch-Friendly Mobile Staff Cards */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((item) => {
                    const isSelected = selectedIds.includes(item.staffId || item.id);
                    const statusStyle = getStatusColor(item.status);
                    const isFacultyCat = item.category === 'Faculty';

                    return (
                      <div
                        key={item.staffId || item.id}
                        style={{
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          borderRadius: '14px',
                          border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                          padding: '14px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        {/* Top: Checkbox, Avatar, Name & ID, Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(item.staffId || item.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: isFacultyCat ? '#2563eb' : '#334155',
                              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '800', fontSize: '12px'
                            }}>
                              {(item.name || 'SM').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{item.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: '700' }}>ID: {item.staffId}</div>
                            </div>
                          </div>

                          <span style={{
                            padding: '3px 8px', borderRadius: '8px', fontSize: '10.5px', fontWeight: '700',
                            background: statusStyle.bg, color: statusStyle.text, display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            {statusStyle.icon}
                            <span>{item.status}</span>
                          </span>
                        </div>

                        {/* Middle: Role & Department */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                            background: isFacultyCat ? '#eff6ff' : '#f1f5f9',
                            color: isFacultyCat ? '#1d4ed8' : '#334155'
                          }}>
                            {isFacultyCat ? '🎓 Faculty' : '🏛️ Admin'} • {item.role}
                          </span>

                          {item.department && (
                            <span style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Building size={12} /> {item.department}
                            </span>
                          )}
                        </div>

                        {/* Bottom: Contact Details & Single Delete Action */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: '#475569' }}>
                            {item.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} color="#64748b" />
                                <span style={{ color: '#2563eb' }}>{item.email}</span>
                              </div>
                            )}
                            {item.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} color="#64748b" />
                                <span>{item.phone}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setMemberToDelete(item)}
                            style={{
                              padding: '6px 12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626',
                              border: '1px solid #fecaca', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                    No records matching your search / filter criteria.
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Full Table */
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '12px 16px', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length}
                          onChange={handleSelectAllFiltered}
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '12px 16px' }}>Staff ID</th>
                      <th style={{ padding: '12px 16px' }}>Name & Role</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Department</th>
                      <th style={{ padding: '12px 16px' }}>Contact Info</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.length > 0 ? (
                      paginatedRecords.map((item) => {
                        const isSelected = selectedIds.includes(item.staffId || item.id);
                        const statusStyle = getStatusColor(item.status);

                        return (
                          <tr 
                            key={item.staffId || item.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: isSelected ? '#eff6ff' : '#ffffff',
                              transition: 'background 0.15s'
                            }}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectRow(item.staffId || item.id)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', fontSize: '13.5px' }}>
                              {item.staffId}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px', height: '32px', borderRadius: '50%',
                                  background: item.category === 'Admin' ? '#334155' : '#2563eb',
                                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: '800', fontSize: '11px'
                                }}>
                                  {(item.name || 'SM').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px' }}>
                                    {item.name}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                    {item.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                background: item.category === 'Admin' ? '#f1f5f9' : '#eff6ff',
                                color: item.category === 'Admin' ? '#334155' : '#1d4ed8'
                              }}>
                                {item.category === 'Admin' ? '🏛️ Admin' : '🎓 Faculty'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600',
                                background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', display: 'inline-block'
                              }}>
                                {item.department}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontSize: '12px', color: '#334155' }}>
                                {item.email && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} color="#64748b" /> {item.email}</div>}
                                {item.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#64748b' }}><Phone size={12} /> {item.phone}</div>}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                background: statusStyle.bg, color: statusStyle.text
                              }}>
                                {statusStyle.icon}
                                <span>{item.status}</span>
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => setMemberToDelete(item)}
                                title={`Delete ${item.name}`}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                          No records matching your search / filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing {filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                    background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                    fontSize: '12px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                    background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                    color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                    fontSize: '12px', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Single Delete */}
      {memberToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '440px', padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Trash2 size={22} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Delete Staff Record?
            </h3>
            
            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{memberToDelete.name}</strong> (Staff ID: <code>{memberToDelete.staffId}</code>, {memberToDelete.department})?
              This action will remove them permanently from the directory and MongoDB database.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMemberToDelete(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Bulk Delete */}
      {showBulkDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '460px', padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Trash2 size={22} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Bulk Delete {selectedIds.length} Records?
            </h3>
            
            <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              You are about to permanently delete <strong>{selectedIds.length} staff records</strong> across the directory and database. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Confirm Bulk Delete ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
