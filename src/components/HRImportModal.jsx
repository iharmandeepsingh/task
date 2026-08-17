import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, FileText, ArrowRight, FolderPlus, UserCheck, Shield, ClipboardList, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  // Process raw parsed JS objects into normalized staging rows safely
  const processRawRows = (rawRows, fileName, sheetTitle = 'Sheet1', category = importCategory) => {
    if (!Array.isArray(rawRows)) return;
    const seenIds = new Set();
    const processed = [];
    const counts = { valid: 0, warning: 0, error: 0, duplicate: 0 };

    rawRows.forEach((row, index) => {
      if (!row) return;
      const rowNum = index + 1;
      let empId = '';
      let displayName = '';
      let emailStr = '';
      let phoneStr = '';
      let dept = '';
      let rawDesignation = '';

      if (Array.isArray(row)) {
        empId = String(row[0] || '').trim();
        displayName = String(row[1] || row[0] || '').trim();
        emailStr = String(row[2] || '').trim();
        phoneStr = String(row[3] || '').trim();
        dept = String(row[4] || '').trim();
        rawDesignation = String(row[5] || '').trim();
      } else if (typeof row === 'object' && row !== null) {
        const rowKeys = Object.keys(row);
        const findKey = (candidates) => {
          for (const candidate of candidates) {
            const match = rowKeys.find(k => k.trim().toLowerCase() === candidate.toLowerCase());
            if (match && row[match] !== undefined && String(row[match]).trim() !== '') return row[match];
          }
          return null;
        };

        const colValues = Object.values(row).map(v => String(v).trim()).filter(Boolean);

        empId = String(findKey(['emp code', 'employee id', 'emp id', 'staff id', 'id', 'code', 'sr no', 's.no']) || colValues[0] || `260${10 + index}`).trim();
        displayName = String(findKey(['faculty name', 'name', 'employee name', 'staff name', 'full name']) || colValues[1] || `Staff Member ${index + 1}`).trim();
        emailStr = String(findKey(['email', 'e-mail', 'official email', 'mail']) || colValues[2] || '').trim();
        phoneStr = String(findKey(['contact no', 'mobile', 'phone', 'contact']) || colValues[3] || '').trim();
        dept = String(findKey(['department', 'dept', 'school', 'branch']) || colValues[4] || '').trim();
        rawDesignation = String(findKey(['designation', 'role', 'title', 'post']) || colValues[5] || '').trim();
      }

      if (!empId) empId = `260${10 + index}`;
      if (!displayName) displayName = `Staff Member ${index + 1}`;
      if (!emailStr) emailStr = `${displayName.toLowerCase().replace(/\s+/g, '.')}@ctu.edu.in`;
      if (!dept) dept = category === 'faculty' ? 'School of Management & Sciences' : 'University Administration';
      if (!rawDesignation) rawDesignation = category === 'faculty' ? 'Faculty Member' : 'Administrative Staff';

      let status = 'VALID';
      if (empId && seenIds.has(empId)) {
        status = 'DUPLICATE';
      } else if (empId) {
        seenIds.add(empId);
      }

      counts.valid++;

      processed.push({
        id: `stg-${index}-${Date.now()}`,
        rowNum,
        empId,
        displayName,
        email: emailStr.split(/[\/,;\s]+/)[0] || emailStr,
        phone: phoneStr,
        dept,
        designation: rawDesignation,
        targetRole: category === 'faculty' ? 'Faculty' : 'Admin',
        status
      });
    });

    setStagingRows(processed);
    setMetrics(counts);
    setSelectedFileName(fileName);
    setSheetName(sheetTitle);
    setIsParsed(true);
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
        
        let rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
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

  const handleExecuteImport = () => {
    if (stagingRows.length === 0) {
      alert('No data rows available to import.');
      return;
    }

    if (onImportSuccess) {
      onImportSuccess(stagingRows, importCategory);
    }

    alert(`Successfully uploaded ${stagingRows.length} ${importCategory === 'faculty' ? 'Faculty' : 'Admin'} records into the Master Directory!`);
    onClose();
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
      {/* Native File Input */}
      <input
        id="hr-file-upload-input"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv, text/plain"
        style={{ display: 'none' }}
      />

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
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                Select any <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file, fill form fields, or paste Excel lines below.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <label
                  htmlFor="hr-file-upload-input"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: importCategory === 'faculty' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }}
                >
                  <FolderPlus size={18} />
                  <span>Choose File from Computer / Phone</span>
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
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    Staged Employee Data ({stagingRows.length} Staff Records)
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: importCategory === 'faculty' ? '#2563eb' : '#059669' }}>
                    Category: {importCategory === 'faculty' ? '🎓 Faculty' : '🏛️ Admin'}
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '8px 12px' }}>Row</th>
                        <th style={{ padding: '8px 12px' }}>Staff ID</th>
                        <th style={{ padding: '8px 12px' }}>Name</th>
                        <th style={{ padding: '8px 12px' }}>Department</th>
                        <th style={{ padding: '8px 12px' }}>Designation</th>
                        <th style={{ padding: '8px 12px' }}>Upload Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagingRows.map((row) => (
                        <tr key={row.id || `row-${row.rowNum}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>#{row.rowNum}</td>
                          <td style={{ padding: '8px 12px', fontWeight: '800', color: '#2563eb' }}>{row.empId}</td>
                          <td style={{ padding: '8px 12px', fontWeight: '700' }}>{row.displayName}</td>
                          <td style={{ padding: '8px 12px' }}>{row.dept}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.designation}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#dcfce7',
                              color: '#15803d',
                              fontWeight: '700',
                              fontSize: '10px'
                            }}>
                              Ready to Upload
                            </span>
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
