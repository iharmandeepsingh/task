import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, FileText, ArrowRight, FolderPlus, UserCheck, Shield, ClipboardList, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getApiUrl } from '../utils/apiBase';

export default function HRImportModal({ isOpen, onClose, onImportSuccess, team = [] }) {
  const [importCategory, setImportCategory] = useState('faculty'); // 'faculty' or 'admin'
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [isParsed, setIsParsed] = useState(false);
  const [stagingRows, setStagingRows] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  
  // Single Record Form State
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleRecord, setSingleRecord] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    dept: '',
    designation: ''
  });

  // Staging metrics
  const [metrics, setMetrics] = useState({ valid: 0, warning: 0, error: 0, duplicate: 0 });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Department detection helper
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

  // High-precision column classification helper
  const classifyColumn = (colStr) => {
    const s = String(colStr || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    
    // 1. Serial Number: s no, sr no, sno, sr, serial no, serial, row, row no, sl no, seq, #
    if (
      s === 's no' || s === 'sr no' || s === 'sno' || s === 'sr' || s === 'serial no' ||
      s === 'serial' || s === 'sl no' || s === 'sl' || s === 'row' || s === 'row no' || s === '#'
    ) {
      return 'sr';
    }

    // 2. Email: official email id, official email, email id, email, e mail, mail
    if (s.includes('email') || s.includes('mail')) {
      return 'email';
    }

    // 3. Contact / Phone: contact no, contact number, contact, mobile no, mobile number, mobile, phone no, phone number, phone
    if (s.includes('contact') || s.includes('mobile') || s.includes('phone') || s === 'cell') {
      return 'phone';
    }

    // 4. Department / School: school department, department, dept, school, branch, institute, faculty of
    if (s.includes('school') || s.includes('dept') || s.includes('department') || s.includes('branch') || s.includes('institute')) {
      return 'dept';
    }

    // 5. Designation / Role: designation, role, post, title
    if (s.includes('designation') || s.includes('role') || s.includes('post') || s.includes('title')) {
      return 'designation';
    }

    // 6. Employee ID / Code: emp id, employee id, emp code, employee code, staff id, emp code no, empid, empcode
    if (
      s.includes('emp') || s.includes('employee') || s.includes('staff id') || 
      s === 'emp id' || s === 'empid' || s === 'emp code' || s === 'id' || s === 'code'
    ) {
      return 'empId';
    }

    // 7. Name: faculty name, employee name, staff name, name, full name, emp name
    if (s.includes('name')) {
      return 'name';
    }

    return null;
  };

  // Process raw parsed spreadsheet into normalized staging rows safely
  const processRawRows = (rawRows, fileName, sheetTitle = 'Sheet1', category = importCategory) => {
    if (!Array.isArray(rawRows) || rawRows.length === 0) return;
    const seenIds = new Set();
    const processed = [];
    const counts = { valid: 0, warning: 0, error: 0, duplicate: 0 };
    let activeCascadingDept = category === 'faculty' ? 'School of Agriculture & Natural Sciences' : 'University Administration';

    let headerRowIdx = -1;
    let colMap = { sr: -1, empId: -1, name: -1, email: -1, phone: -1, dept: -1, designation: -1 };

    // Inspect first few rows to locate the header row
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r];
      if (!Array.isArray(row)) continue;
      
      const matchedCols = {};
      row.forEach((colVal, colIdx) => {
        const fieldType = classifyColumn(colVal);
        if (fieldType && matchedCols[fieldType] === undefined) {
          matchedCols[fieldType] = colIdx;
        }
      });

      if ((matchedCols.sr !== undefined || matchedCols.empId !== undefined) && matchedCols.name !== undefined) {
        headerRowIdx = r;
        colMap = {
          sr: matchedCols.sr ?? -1,
          empId: matchedCols.empId ?? -1,
          name: matchedCols.name ?? -1,
          email: matchedCols.email ?? -1,
          phone: matchedCols.phone ?? -1,
          dept: matchedCols.dept ?? -1,
          designation: matchedCols.designation ?? -1
        };
        break;
      }
    }

    if (headerRowIdx === -1) {
      colMap = { sr: 0, empId: 1, name: 2, email: 3, phone: 4, dept: 5, designation: -1 };
    }

    const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

    for (let i = startRow; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row) continue;

      let userRowNum = '';
      let empId = '';
      let displayName = '';
      let emailStr = '';
      let phoneStr = '';
      let dept = '';
      let rawDesignation = '';

      if (Array.isArray(row)) {
        const firstCell = String(row[0] || '').trim();
        const deptCell = colMap.dept >= 0 ? String(row[colMap.dept] || '').trim() : '';

        // Check for isolated department banner rows
        if (isDeptString(firstCell) && !row[colMap.empId] && !row[colMap.name]) {
          activeCascadingDept = firstCell;
          continue;
        }
        if (isDeptString(deptCell) && !row[colMap.empId] && !row[colMap.name]) {
          activeCascadingDept = deptCell;
          continue;
        }

        userRowNum = colMap.sr >= 0 ? String(row[colMap.sr] ?? '').trim() : '';
        empId = colMap.empId >= 0 ? String(row[colMap.empId] ?? '').trim() : '';
        displayName = colMap.name >= 0 ? String(row[colMap.name] ?? '').trim() : '';
        emailStr = colMap.email >= 0 ? String(row[colMap.email] ?? '').trim() : '';
        phoneStr = colMap.phone >= 0 ? String(row[colMap.phone] ?? '').trim() : '';
        dept = colMap.dept >= 0 ? String(row[colMap.dept] ?? '').trim() : '';
        rawDesignation = colMap.designation >= 0 ? String(row[colMap.designation] ?? '').trim() : '';
      } else if (typeof row === 'object' && row !== null) {
        const rowKeys = Object.keys(row);
        const findKey = (candidates) => {
          for (const candidate of candidates) {
            const match = rowKeys.find(k => k.trim().toLowerCase() === candidate.toLowerCase());
            if (match && row[match] !== undefined && String(row[match]).trim() !== '') return row[match];
          }
          return null;
        };

        userRowNum = String(findKey(['sr. no', 'sr no', 's.no', 'sr_no', 'row no', 'sno', '#']) || '').trim();
        empId = String(findKey(['emp id', 'emp code', 'employee id', 'staff id', 'id', 'code', 'emp_id', 'empid']) || '').trim();
        displayName = String(findKey(['name', 'faculty name', 'employee name', 'staff name', 'full name', 'name of employee']) || '').trim();
        emailStr = String(findKey(['official email id', 'official email', 'email', 'e-mail', 'mail', 'email id']) || '').trim();
        phoneStr = String(findKey(['contact no', 'mobile', 'phone', 'contact', 'contact number', 'mobile no', 'phone no']) || '').trim();
        dept = String(findKey(['school / department', 'school/department', 'department', 'dept', 'school', 'branch', 'institute']) || '').trim();
        rawDesignation = String(findKey(['designation', 'role', 'title', 'post']) || '').trim();
      }

      // Department Cascading
      if (dept && isDeptString(dept)) {
        activeCascadingDept = dept;
      }

      // Skip completely empty blank rows
      if (!empId && !displayName && !emailStr && !userRowNum) continue;

      let status = 'VALID';
      if (empId && seenIds.has(empId.toLowerCase())) {
        status = 'DUPLICATE';
      } else if (empId) {
        seenIds.add(empId.toLowerCase());
      }

      counts.valid++;

      processed.push({
        id: `stg-${i}-${Date.now()}`,
        rowNum: userRowNum || '',
        empId: empId || '',
        displayName: displayName || '',
        email: emailStr.split(/[\/,;\s]+/)[0] || emailStr || '',
        phone: phoneStr || '',
        dept: dept || activeCascadingDept || '',
        designation: rawDesignation || (category === 'faculty' ? 'Faculty Member' : 'Administrative Staff'),
        targetRole: category === 'faculty' ? 'Faculty' : 'Admin',
        status
      });
    }

    setStagingRows(processed);
    setMetrics(counts);
    setSelectedFileName(fileName);
    setSheetName(sheetTitle);
    setIsParsed(true);
  };

  // Update Staging Row Cell in real-time
  const handleUpdateStagingRow = (rowId, field, value) => {
    setStagingRows(prev => prev.map(r => {
      if (r.id === rowId) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  // Add Blank Empty Row to be filled manually by user
  const handleAddEmptyRow = () => {
    const newEmptyRow = {
      id: `stg-empty-${Date.now()}`,
      rowNum: stagingRows.length + 1,
      empId: '',
      displayName: '',
      email: '',
      phone: '',
      dept: importCategory === 'faculty' ? 'School of Engineering & Technology' : 'University Administration',
      designation: '',
      targetRole: importCategory === 'faculty' ? 'Faculty' : 'Admin',
      status: 'VALID'
    };
    setStagingRows(prev => [...prev, newEmptyRow]);
    setIsParsed(true);
  };

  const handleRemoveStagingRow = (rowId) => {
    setStagingRows(prev => prev.filter(r => r.id !== rowId));
  };

  const handleClearAllStagingRows = () => {
    if (window.confirm('Clear all staged rows?')) {
      setStagingRows([]);
      setIsParsed(false);
      setSelectedFileName(null);
    }
  };

  // Add Single Employee Record via Form Fields
  const handleAddSingleRecord = (e) => {
    if (e) e.preventDefault();
    if (!singleRecord.name.trim()) {
      alert('Please enter Employee / Faculty Name.');
      return;
    }

    const empId = singleRecord.empId.trim() || `260${Math.floor(100 + Math.random() * 900)}`;
    const displayName = singleRecord.name.trim();
    const emailStr = singleRecord.email.trim() || `${displayName.toLowerCase().replace(/\s+/g, '.')}@ctu.edu.in`;
    const phoneStr = singleRecord.phone.trim();
    const dept = singleRecord.dept.trim() || (importCategory === 'faculty' ? 'School of Engineering & Technology' : 'University Administration');
    const rawDesignation = singleRecord.designation.trim() || (importCategory === 'faculty' ? 'Faculty Member' : 'Administrative Staff');

    const formattedRow = {
      'EMP CODE': empId,
      'Faculty Name': displayName,
      'Email': emailStr,
      'Contact No': phoneStr,
      'Dept': dept,
      'Designation': rawDesignation
    };

    processRawRows([formattedRow], 'Single_Employee_Record.xlsx', 'Single Entry', importCategory);
    setSingleRecord({ empId: '', name: '', email: '', phone: '', dept: '', designation: '' });
    setShowSingleForm(false);
  };

  // Load and Preview All Current Loaded Master Directory Staff Records
  const handleLoadCurrentMasterData = () => {
    const safeTeam = Array.isArray(team) ? team : [];
    if (safeTeam.length === 0) {
      alert('No staff or faculty records currently present in the master directory.');
      return;
    }

    const currentCategoryTeam = safeTeam.filter((m) => {
      if (!m) return false;
      const cat = (m.category || '').toLowerCase();
      const role = (m.role || '').toLowerCase();
      if (importCategory === 'faculty') {
        return cat === 'faculty' || role.includes('faculty') || role.includes('professor') || role.includes('lecturer');
      } else {
        return cat === 'admin' || role.includes('admin') || role.includes('hr') || role.includes('super') || role.includes('head');
      }
    });

    const targetList = currentCategoryTeam.length > 0 ? currentCategoryTeam : safeTeam;

    const formatted = targetList.map((m, idx) => ({
      'EMP CODE': m?.employeeId || m?.id || `260${10 + idx}`,
      'Faculty Name': m?.name || `Staff Member ${idx + 1}`,
      'Email': m?.email || '',
      'Dept': m?.dept || 'School of Engineering & Technology',
      'Designation': m?.role || (importCategory === 'faculty' ? 'Faculty Member' : 'Administrative Staff')
    }));

    processRawRows(formatted, `Master_Directory_${importCategory.toUpperCase()}_Records.xlsx`, `All Active ${importCategory.toUpperCase()} Staff (${targetList.length})`, importCategory);
  };

  // Handle Native File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        let rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawData || rawData.length === 0) {
          rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        }

        if (!rawData || rawData.length === 0) {
          alert('Selected file contains no readable data rows.');
          return;
        }

        processRawRows(rawData, file.name, firstSheetName, importCategory);
      } catch (err) {
        alert('Failed to parse spreadsheet file. Please ensure a valid .xlsx, .xls or .csv file.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Parse Raw Text Copied from Excel / Google Sheets
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      alert('Please paste copied Excel data or text lines first.');
      return;
    }

    const lines = pastedText.trim().split('\n').filter(l => l.trim().length > 0);
    const parsedRows = lines.map(line => {
      const parts = line.split(/[\t,]+/).map(p => p.trim()).filter(Boolean);
      return parts;
    });

    processRawRows(parsedRows, 'Pasted_Spreadsheet_Data.txt', 'Pasted Sheet', importCategory);
    setShowPasteBox(false);
  };

  // Quick Preset Sample Files
  const handlePresetSelect = (presetType) => {
    setImportCategory(presetType);
    if (presetType === 'faculty') {
      const sampleFaculty = [
        { 'EMP CODE': '26010', 'Faculty Name': 'Shilpa Debnath', 'Email': 'shilpa.debnath@ctu.edu.in', 'Contact No': '9876543210', 'Dept': 'School of Management & Sciences', 'Designation': 'Faculty Member' },
        { 'EMP CODE': 'CTU-EMP-301', 'Faculty Name': 'Dr. Preeti Verma', 'Email': 'preeti@ctu.edu.in', 'Contact No': '9876543213', 'Dept': 'School of Engineering', 'Designation': 'Assistant Professor' },
        { 'EMP CODE': 'CTU-EMP-302', 'Faculty Name': 'Er. Vikramjeet Singh', 'Email': 'vikram@ctu.edu.in', 'Contact No': '9876543214', 'Dept': 'Mechanical Engineering', 'Designation': 'Senior Lecturer' }
      ];
      processRawRows(sampleFaculty, 'Faculty_Data_2026.xlsx', 'Faculty Records', 'faculty');
    } else {
      const sampleAdmin = [
        { 'Employee ID': 'CTU-ADM-101', 'Name': 'Ms. Pooja Rani', 'E-mail': 'pooja.hr@ctu.edu.in', 'Mobile': '9812345678', 'Department': 'Human Resources', 'Role': 'HR Lead' },
        { 'Employee ID': 'CTU-ADM-102', 'Name': 'Mr. Suresh Grover', 'E-mail': 'suresh.accounts@ctu.edu.in', 'Mobile': '9812345679', 'Department': 'Accounts & Finance', 'Role': 'Finance Officer' }
      ];
      processRawRows(sampleAdmin, 'Admin_Data_2026.xlsx', 'Admin Records', 'admin');
    }
  };

  const handleExecuteImport = async () => {
    if (stagingRows.length === 0) {
      alert('No data rows available to import.');
      return;
    }

    const verificationPayload = stagingRows.map((emp, idx) => ({
      staffId: emp.empId || `26${100 + idx}`,
      name: emp.displayName || 'Staff Member',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.dept || (importCategory === 'faculty' ? 'School of Agriculture & Natural Sciences' : 'University Administration'),
      category: importCategory === 'faculty' ? 'Faculty' : 'Admin',
      role: emp.designation || (importCategory === 'faculty' ? 'Faculty Member' : 'Administrative Staff'),
      status: 'Pre-Authorized',
      uploadedAt: new Date().toISOString()
    }));

    try {
      const res = await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: verificationPayload })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected staff import');
      }

      window.dispatchEvent(new Event('ctu_records_updated'));

      if (onImportSuccess) {
        await onImportSuccess(stagingRows, importCategory);
      }

      alert(`✅ Upload Confirmed!\n• Total Uploaded: ${data.validCount || stagingRows.length}\n• Verified in MongoDB: ${data.verifiedInDatabase || stagingRows.length}\n\nStatus: Pre-Authorized (Awaiting Teacher Registration)`);
      onClose();
    } catch (e) {
      alert(`Import failed: ${e.message}`);
    }
  };

  const safeTeamCount = Array.isArray(team) ? team.length : 0;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '12px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '860px',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                CT University Staff & Faculty Data Upload
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Upload Real Excel/CSV File, Fill Form Fields, or Paste Excel Text Data Directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Selection Tabs */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            Target Data Section:
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setImportCategory('faculty'); setIsParsed(false); setSelectedFileName(null); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: importCategory === 'faculty' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#ffffff',
                color: importCategory === 'faculty' ? '#ffffff' : '#475569',
                border: importCategory === 'faculty' ? 'none' : '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: importCategory === 'faculty' ? '0 4px 10px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <UserCheck size={15} />
              <span>🎓 Faculty / Staff Section</span>
            </button>

            <button
              onClick={() => { setImportCategory('admin'); setIsParsed(false); setSelectedFileName(null); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: importCategory === 'admin' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : '#ffffff',
                color: importCategory === 'admin' ? '#ffffff' : '#475569',
                border: importCategory === 'admin' ? 'none' : '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: importCategory === 'admin' ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <Shield size={15} />
              <span>🏛️ Admin Section</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {!isParsed ? (
            <div style={{
              border: `2px dashed ${importCategory === 'faculty' ? '#3b82f6' : '#10b981'}`,
              borderRadius: '14px',
              padding: '24px 20px',
              textAlign: 'center',
              background: importCategory === 'faculty' ? '#eff6ff40' : '#ecfdf540',
              transition: 'all 0.2s ease'
            }}>
              <Upload size={38} color={importCategory === 'faculty' ? '#2563eb' : '#059669'} style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#1e293b' }}>
                Upload {importCategory === 'faculty' ? 'Faculty / Staff' : 'Admin'} Spreadsheet (.xlsx / .csv)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <label
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: importCategory === 'faculty' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <FolderPlus size={18} />
                  <span>Choose File from Computer / Phone</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => { setShowPasteBox(!showPasteBox); setShowSingleForm(false); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: showPasteBox ? '#eff6ff' : '#f1f5f9',
                      border: showPasteBox ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      color: '#1e293b',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ClipboardList size={15} color="#2563eb" />
                    <span>{showPasteBox ? 'Hide Paste Box' : '📋 Paste Copied Excel Rows'}</span>
                  </button>

                  <button
                    onClick={() => { setShowSingleForm(!showSingleForm); setShowPasteBox(false); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: showSingleForm ? '#ecfdf5' : '#f1f5f9',
                      border: showSingleForm ? '1px solid #6ee7b7' : '1px solid #cbd5e1',
                      color: '#065f46',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={15} color="#059669" />
                    <span>{showSingleForm ? 'Hide Form' : '✍️ Add Single Record (Form Fields)'}</span>
                  </button>
                </div>

                {/* Form Fields for Single Employee Record */}
                {showSingleForm && (
                  <div style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '16px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'left'
                  }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} color="#059669" />
                      <span>Single Record Form Fields (Add {importCategory === 'faculty' ? 'Faculty Member' : 'Admin Staff'})</span>
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          🪪 Staff ID / Emp Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 26015"
                          value={singleRecord.empId}
                          onChange={(e) => setSingleRecord({ ...singleRecord, empId: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          👤 Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Rajesh Sharma"
                          value={singleRecord.name}
                          onChange={(e) => setSingleRecord({ ...singleRecord, name: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          📧 Official Email
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. rajesh@ctu.edu.in"
                          value={singleRecord.email}
                          onChange={(e) => setSingleRecord({ ...singleRecord, email: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          📱 Mobile / Phone
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9876543210"
                          value={singleRecord.phone}
                          onChange={(e) => setSingleRecord({ ...singleRecord, phone: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          🏫 Department / School
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Computer Science & Eng"
                          value={singleRecord.dept}
                          onChange={(e) => setSingleRecord({ ...singleRecord, dept: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '3px' }}>
                          💼 Designation / Role
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Assistant Professor"
                          value={singleRecord.designation}
                          onChange={(e) => setSingleRecord({ ...singleRecord, designation: e.target.value })}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddSingleRecord}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Plus size={16} />
                      <span>Stage & Preview Single Record</span>
                    </button>
                  </div>
                )}

                {showPasteBox && (
                  <div style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '16px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'left'
                  }}>
                    {/* Section Header */}
                    <h5 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 8px 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ClipboardList size={16} color="#2563eb" />
                      <span>Excel Paste Column Identification & Format Guide</span>
                    </h5>

                    {/* Format Instructions & Column Order Table */}
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '11px' }}>
                      <div style={{ fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        📌 What to Upload & Column Order Identification (From Left to Right):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginTop: '6px' }}>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 1:</strong> Staff ID / Emp Code<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. 26010</span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 2:</strong> Full Name<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. Dr. Rajesh Sharma</span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 3:</strong> Official Email<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. rajesh@ctu.edu.in</span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 4:</strong> Mobile / Phone<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. 9876543210</span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 5:</strong> Department<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. School of Engineering</span>
                        </div>
                        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <strong style={{ color: '#2563eb' }}>Col 6:</strong> Designation / Role<br/>
                          <span style={{ color: '#64748b', fontSize: '10px' }}>e.g. Assistant Professor</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '8px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <span>💡 <strong>How to Upload:</strong> Copy rows directly from Excel or Google Sheets (Ctrl+C) and paste (Ctrl+V) into the text box below. Header row is optional!</span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const sampleText = importCategory === 'faculty'
                              ? "26010\tDr. Rajesh Sharma\trajesh.sharma@ctu.edu.in\t9876543210\tSchool of Engineering & Technology\tAssistant Professor\n26011\tDr. Preeti Verma\tpreeti.verma@ctu.edu.in\t9876543211\tSchool of Management & Sciences\tAssociate Professor"
                              : "10005\tMs. Pooja Rani\tpooja.hr@ctu.edu.in\t9812345678\tHuman Resources\tHR Lead\n10006\tMr. Suresh Grover\tsuresh.accounts@ctu.edu.in\t9812345679\tAccounts & Finance\tFinance Officer";
                            setPastedText(sampleText);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            border: '1px solid #93c5fd',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          📋 Auto-Fill Sample Excel Text Format
                        </button>
                      </div>
                    </div>

                    {/* Textarea for Pasting */}
                    <textarea
                      rows={4}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste copied rows from Excel here (e.g. 26010    Dr. Rajesh Sharma    rajesh@ctu.edu.in    9876543210)..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />

                    <button
                      onClick={handleParsePastedText}
                      style={{
                        marginTop: '8px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>Parse & Stage Pasted Data</span>
                    </button>
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  ── OR PREVIEW / LOAD CURRENT MASTER DIRECTORY DATA ──
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleLoadCurrentMasterData}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #93c5fd',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} color="#2563eb" />
                    <span>📊 Load Current Directory Data ({safeTeamCount} Staff Members)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetSelect(importCategory)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={14} color={importCategory === 'faculty' ? '#2563eb' : '#059669'} />
                    <span>Load Sample Spreadsheet</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Selected File Details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: importCategory === 'faculty' ? '#eff6ff' : '#ecfdf5',
                borderRadius: '10px',
                marginBottom: '16px',
                border: `1px solid ${importCategory === 'faculty' ? '#bfdbfe' : '#a7f3d0'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileSpreadsheet size={20} color={importCategory === 'faculty' ? '#2563eb' : '#059669'} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedFileName}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                      Parsed {stagingRows.length} Rows • Ready for Upload
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedFileName(null); setIsParsed(false); setStagingRows([]); setPastedText(''); }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Choose Different File
                </button>
              </div>

              {/* Staging Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#dcfce7', border: '1px solid #86efac', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>{stagingRows.length}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534' }}>Parsed Rows</div>
                </div>

                <div style={{ padding: '10px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#1d4ed8' }}>{importCategory === 'faculty' ? 'Faculty' : 'Admin'}</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af' }}>Target Section</div>
                </div>
              </div>

              {/* Staging Preview Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      Staged Employee Data ({stagingRows.length} Staff Records)
                    </span>
                    <button
                      onClick={handleAddEmptyRow}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>+ Add Empty Row</span>
                    </button>
                    <button
                      onClick={handleClearAllStagingRows}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '600', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: importCategory === 'faculty' ? '#2563eb' : '#059669' }}>
                    Category: {importCategory === 'faculty' ? '🎓 Faculty' : '🏛️ Admin'}
                  </span>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', position: 'sticky', top: 0, zIndex: 5 }}>
                        <th style={{ padding: '8px 10px', width: '55px' }}>Sr. No</th>
                        <th style={{ padding: '8px 10px', width: '110px' }}>EMP ID *</th>
                        <th style={{ padding: '8px 10px', width: '160px' }}>Name *</th>
                        <th style={{ padding: '8px 10px', width: '160px' }}>Official Email ID</th>
                        <th style={{ padding: '8px 10px', width: '120px' }}>Contact No</th>
                        <th style={{ padding: '8px 10px', width: '160px' }}>School / Dept</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagingRows.map((row) => (
                        <tr key={row.id || `row-${row.rowNum}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              placeholder=""
                              value={row.rowNum}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'rowNum', e.target.value)}
                              style={{ width: '42px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              placeholder="EMP ID"
                              value={row.empId}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'empId', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', fontWeight: '700', color: '#2563eb', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              placeholder="Enter Name"
                              value={row.displayName}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'displayName', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', fontWeight: '600', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="email"
                              placeholder="Official Email"
                              value={row.email}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'email', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              placeholder="Phone No"
                              value={row.phone}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'phone', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              placeholder="School / Dept"
                              value={row.dept}
                              onChange={(e) => handleUpdateStagingRow(row.id, 'dept', e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemoveStagingRow(row.id)}
                              style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
                              title="Delete Row"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '14px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Cancel
          </button>

          {isParsed && (
            <button
              onClick={handleExecuteImport}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: importCategory === 'faculty' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <CheckCircle size={16} />
              <span>Confirm & Upload {stagingRows.length} {importCategory === 'faculty' ? 'Faculty' : 'Admin'} Records</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
