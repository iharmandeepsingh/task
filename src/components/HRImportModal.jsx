import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, FileText, ArrowRight, FolderPlus, UserCheck, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function HRImportModal({ isOpen, onClose, onImportSuccess }) {
  const [importCategory, setImportCategory] = useState('faculty'); // 'faculty' or 'admin'
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [isParsed, setIsParsed] = useState(false);
  const [stagingRows, setStagingRows] = useState([]);
  const [sheetName, setSheetName] = useState('');
  
  // Staging metrics
  const [metrics, setMetrics] = useState({ valid: 0, warning: 0, error: 0, duplicate: 0 });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process raw parsed JS objects into normalized staging rows
  const processRawRows = (rawRows, fileName, sheetTitle = 'Sheet1', category = importCategory) => {
    const seenIds = new Set();
    const processed = [];
    const counts = { valid: 0, warning: 0, error: 0, duplicate: 0 };

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // Row 1 is header
      const rowKeys = Object.keys(row);

      // Ultra-flexible column detection from any spreadsheet format
      const findKey = (candidates) => {
        for (const candidate of candidates) {
          const match = rowKeys.find(k => k.trim().toLowerCase() === candidate.toLowerCase());
          if (match && row[match] !== undefined && String(row[match]).trim() !== '') return row[match];
        }
        return null;
      };

      // Positional fallbacks if headers are unnamed (e.g. col 0, col 1)
      const colValues = Object.values(row).map(v => String(v).trim()).filter(Boolean);

      const rawId = findKey(['emp code', 'employee id', 'emp id', 'staff id', 'id', 'code', 'sr no', 's.no']) || colValues[0] || `260${10 + index}`;
      const rawName = findKey(['faculty name', 'name', 'employee name', 'staff name', 'full name']) || colValues[1] || `Staff Member ${index + 1}`;
      const rawEmail = findKey(['email', 'e-mail', 'official email', 'mail']) || colValues[2] || `${String(rawName).toLowerCase().replace(/\s+/g, '.')}@ctu.edu.in`;
      const rawPhone = findKey(['contact no', 'mobile', 'phone', 'contact']) || colValues[3] || '';
      const rawDept = findKey(['department', 'dept', 'school', 'branch']) || colValues[4] || (category === 'faculty' ? 'School of Management & Sciences' : 'University Administration');
      const rawDesignation = findKey(['designation', 'role', 'title', 'post']) || colValues[5] || (category === 'faculty' ? 'Faculty Member' : 'Administrative Officer');

      const empId = String(rawId).trim();
      const displayName = String(rawName).trim();
      const emailStr = String(rawEmail).trim();
      const phoneStr = String(rawPhone).trim();
      const dept = String(rawDept).trim();

      const errors = [];
      const warnings = [];
      let status = 'VALID';

      if (!empId) errors.push('Missing Employee ID');
      if (!displayName) errors.push('Missing Name');

      // Duplicate check
      if (empId && seenIds.has(empId)) {
        status = 'DUPLICATE';
        warnings.push(`Duplicate Employee ID "${empId}"`);
      } else if (empId) {
        seenIds.add(empId);
      }

      if (status === 'VALID' && errors.length > 0) {
        status = 'ERROR';
      } else if (status === 'VALID' && warnings.length > 0) {
        status = 'WARNING';
      }

      if (status === 'VALID') counts.valid++;
      else if (status === 'WARNING') counts.warning++;
      else if (status === 'ERROR') counts.error++;
      else if (status === 'DUPLICATE') counts.duplicate++;

      processed.push({
        rowNum,
        empId,
        displayName,
        email: emailStr.split(/[\/,;\s]+/)[0] || emailStr,
        phone: phoneStr,
        dept,
        designation: rawDesignation,
        targetRole: category === 'faculty' ? 'Faculty' : 'Admin',
        status,
        warnings: warnings.join(', '),
        errors: errors.join(', ')
      });
    });

    setStagingRows(processed);
    setMetrics(counts);
    setSelectedFileName(fileName);
    setSheetName(sheetTitle);
    setIsParsed(true);
  };

  // Handle Real Native File Selection
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
        
        // Parse with raw header detection
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('Selected file contains no data rows.');
          return;
        }

        processRawRows(rawJson, file.name, firstSheetName, importCategory);
      } catch (err) {
        alert('Failed to parse Excel/CSV spreadsheet. Please ensure a valid .xlsx or .csv file.');
      }
    };
    reader.readAsArrayBuffer(file);
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

    alert(`Successfully uploaded & saved ${stagingRows.length} ${importCategory === 'faculty' ? 'Faculty' : 'Admin'} records into the Employee Directory!`);
    onClose();
  };

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
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
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
                Upload Real Excel / CSV Spreadsheet into Master Directory
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
          {/* File Upload Dropzone */}
          {!isParsed ? (
            <div style={{
              border: `2px dashed ${importCategory === 'faculty' ? '#3b82f6' : '#10b981'}`,
              borderRadius: '14px',
              padding: '30px 20px',
              textAlign: 'center',
              background: importCategory === 'faculty' ? '#eff6ff40' : '#ecfdf540',
              transition: 'all 0.2s ease'
            }}>
              <Upload size={40} color={importCategory === 'faculty' ? '#2563eb' : '#059669'} style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#1e293b' }}>
                Select {importCategory === 'faculty' ? 'Faculty / Staff' : 'Admin'} Spreadsheet File (.xlsx / .csv)
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px 0' }}>
                Select any spreadsheet file from your device. All records will be imported directly into the directory.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <button
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }}
                >
                  <FolderPlus size={18} />
                  <span>Choose File from Computer / Mobile</span>
                </button>

                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  ── OR LOAD PRESET DEMO FILE ──
                </div>

                <button
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
                  <span>Load Preset {importCategory === 'faculty' ? 'Faculty' : 'Admin'} Spreadsheet</span>
                </button>
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
                  onClick={() => { setSelectedFileName(null); setIsParsed(false); setStagingRows([]); }}
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
                        <tr key={row.rowNum} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
