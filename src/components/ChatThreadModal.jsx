import React, { useState, useRef } from 'react';
import { X, Send, Paperclip, MessageSquare, Clock, CheckCheck, FileText, FileSpreadsheet, Download, Image as ImageIcon, AlertTriangle, ShieldAlert, PlusCircle, CheckCircle } from 'lucide-react';

const FORMAT_EXTENSIONS = {
  EXCEL: { exts: ['xlsx', 'xls', 'csv'], label: 'Excel Spreadsheet (.xlsx, .xls, .csv)', color: '#10b981' },
  PDF:   { exts: ['pdf'],                 label: 'PDF Document (.pdf)',               color: '#ef4444' },
  WORD:  { exts: ['doc', 'docx'],         label: 'Word Document (.docx, .doc)',       color: '#2563eb' },
  IMAGE: { exts: ['png', 'jpg', 'jpeg'],  label: 'Image File (.png, .jpg)',           color: '#8b5cf6' },
};

export default function ChatThreadModal({ isOpen, onClose, task, authUser, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFileObj, setAttachedFileObj] = useState(null);
  const [showDemandPicker, setShowDemandPicker] = useState(false);
  const [demandedFormat, setDemandedFormat] = useState('EXCEL');
  const [demandPrompt, setDemandPrompt] = useState('');
  const [rejectionError, setRejectionError] = useState(null);
  const [activeRequestTarget, setActiveRequestTarget] = useState(null);

  const fileInputRef = useRef(null);
  const requestFileInputRef = useRef(null);

  if (!isOpen || !task) return null;

  const messages = task.chatMessages || [];
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(authUser?.role);

  // Validate file against required format(s)
  const validateFileFormat = (file, targetFormat = null) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    // If uploading against a specific request card
    if (targetFormat && FORMAT_EXTENSIONS[targetFormat]) {
      const allowed = FORMAT_EXTENSIONS[targetFormat].exts;
      if (!allowed.includes(ext)) {
        return {
          valid: false,
          error: `❌ Format Rejected: Assigner strictly demanded a ${FORMAT_EXTENSIONS[targetFormat].label}. Your file "${file.name}" was auto-rejected.`
        };
      }
      return { valid: true, type: targetFormat };
    }

    // If task has overall requiredFormats restriction
    const requiredFormats = task.requiredFormats || ['ANY'];
    if (!requiredFormats.includes('ANY')) {
      const allowedExts = requiredFormats.flatMap(fmt => FORMAT_EXTENSIONS[fmt]?.exts || []);
      if (!allowedExts.includes(ext)) {
        const readableLabels = requiredFormats.map(fmt => FORMAT_EXTENSIONS[fmt]?.label || fmt).join(' OR ');
        return {
          valid: false,
          error: `❌ Format Rejected: This task strictly demands ${readableLabels}. Your file "${file.name}" was auto-rejected.`
        };
      }
    }

    let fileType = 'DOCUMENT';
    if (['pdf'].includes(ext)) fileType = 'PDF';
    else if (['doc', 'docx'].includes(ext)) fileType = 'WORD';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'EXCEL';
    else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) fileType = 'IMAGE';

    return { valid: true, type: fileType };
  };

  const handleFileSelect = (e, targetRequestId = null, targetFormat = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRejectionError(null);
    const result = validateFileFormat(file, targetFormat);

    if (!result.valid) {
      setRejectionError(result.error);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileData = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: result.type,
        dataUrl: evt.target.result,
        fulfillsRequestId: targetRequestId || null
      };

      if (targetRequestId) {
        // Automatically send the fulfillment message
        const msgObj = {
          id: `msg-${Date.now()}`,
          sender: authUser?.name || 'Faculty',
          text: `✅ Submitted demanded file: ${file.name}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: fileData,
          fulfillsRequestId: targetRequestId
        };
        onSendMessage(task.id, msgObj);
        setActiveRequestTarget(null);
      } else {
        setAttachedFileObj(fileData);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachedFileObj) return;

    const msgObj = {
      id: `msg-${Date.now()}`,
      sender: authUser?.name || 'CurrentUser',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachedFileObj ? attachedFileObj : null
    };

    onSendMessage(task.id, msgObj);
    setNewMessage('');
    setAttachedFileObj(null);
    setRejectionError(null);
  };

  // Send an official on-demand File Format Demand
  const handleSendDemand = () => {
    const formatInfo = FORMAT_EXTENSIONS[demandedFormat];
    const msgObj = {
      id: `req-${Date.now()}`,
      sender: authUser?.name || 'Admin Assigner',
      text: demandPrompt.trim() || `Official Directive: Please submit the required file in ${formatInfo.label}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'FILE_REQUEST',
      requestedFormat: demandedFormat,
      status: 'PENDING'
    };

    onSendMessage(task.id, msgObj);
    setShowDemandPicker(false);
    setDemandPrompt('');
  };

  const renderFileIcon = (type) => {
    switch (type) {
      case 'PDF':   return <FileText size={18} color="#ef4444" />;
      case 'EXCEL': return <FileSpreadsheet size={18} color="#10b981" />;
      case 'WORD':  return <FileText size={18} color="#2563eb" />;
      case 'IMAGE': return <ImageIcon size={18} color="#8b5cf6" />;
      default:      return <Paperclip size={18} color="#64748b" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: '680px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '660px'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MessageSquare size={18} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
                Task Chat & Verified File Delivery • {task.id}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#ffffff' }}>{task.title}</h3>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Task Required Formats Banner */}
        {task.requiredFormats && !task.requiredFormats.includes('ANY') && (
          <div style={{
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#166534',
            fontWeight: '700'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} color="#16a34a" />
              <span>Mandatory Task Formats: {task.requiredFormats.map(f => FORMAT_EXTENSIONS[f]?.label || f).join(' OR ')}</span>
            </div>
            <span style={{ fontSize: '10px', background: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>Enforced</span>
          </div>
        )}

        {/* Rejection Alert Banner */}
        {rejectionError && (
          <div style={{
            background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#b91c1c',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <span>{rejectionError}</span>
            </div>
            <button onClick={() => setRejectionError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Message History */}
        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px', fontSize: '13px' }}>
              <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div>No messages in this task thread yet. Send a note, request specific file formats, or upload deliverables!</div>
            </div>
          ) : (
            messages.map((m) => {
              const isSelf = m.sender.includes(authUser?.name?.split(' ')[0] || '___Self___');
              const isFileRequest = m.type === 'FILE_REQUEST';
              const reqFormatInfo = isFileRequest ? FORMAT_EXTENSIONS[m.requestedFormat] : null;

              // If this message is an official Demand Card
              if (isFileRequest) {
                return (
                  <div key={m.id} style={{
                    alignSelf: 'center',
                    width: '92%',
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: `2px solid ${reqFormatInfo?.color || '#3b82f6'}`,
                    padding: '14px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    margin: '6px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: reqFormatInfo?.color || '#3b82f6' }}>
                        <ShieldAlert size={16} color={reqFormatInfo?.color} />
                        <span>OFFICIAL DEMAND: {reqFormatInfo?.label}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{m.time} • by {m.sender}</span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#1e293b', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {m.text}
                    </p>

                    {/* Upload button for faculty */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Allowed: <strong>.{reqFormatInfo?.exts.join(', .')}</strong> (Other formats auto-rejected)
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveRequestTarget({ id: m.id, format: m.requestedFormat });
                          if (requestFileInputRef.current) {
                            requestFileInputRef.current.accept = `.${reqFormatInfo?.exts.join(', .')}`;
                            requestFileInputRef.current.click();
                          }
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: reqFormatInfo?.color || '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                      >
                        <Paperclip size={13} />
                        <span>Upload {m.requestedFormat}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Standard Chat Message
              const att = m.attachment;
              const attName = typeof att === 'object' && att !== null ? att.name : (typeof att === 'string' ? att : null);
              const attSize = typeof att === 'object' && att !== null ? att.size : '';
              const attType = typeof att === 'object' && att !== null ? att.type : 'DOCUMENT';
              const attData = typeof att === 'object' && att !== null ? att.dataUrl : null;

              return (
                <div key={m.id || m.time} style={{
                  alignSelf: isSelf ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: isSelf ? '#2563eb' : '#ffffff',
                  color: isSelf ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  border: isSelf ? 'none' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '4px', color: isSelf ? '#bfdbfe' : '#475569' }}>
                    {m.sender}
                  </div>

                  {m.text && <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{m.text}</div>}

                  {/* Attachment Card */}
                  {attName && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isSelf ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                      border: isSelf ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {renderFileIcon(attType)}
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: isSelf ? '#ffffff' : '#0f172a' }}>{attName}</div>
                          {attSize && <div style={{ fontSize: '10px', color: isSelf ? '#bfdbfe' : '#64748b' }}>{attSize}</div>}
                        </div>
                      </div>

                      {attData ? (
                        <a
                          href={attData}
                          download={attName}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: isSelf ? '#ffffff' : '#2563eb',
                            color: isSelf ? '#2563eb' : '#ffffff',
                            fontSize: '11px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} />
                          <span>View</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: isSelf ? '#bfdbfe' : '#64748b' }}>Attached</span>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '6px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>{m.time}</span>
                    <CheckCheck size={12} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Demand Creator Box (For Admin) */}
        {showDemandPicker && isLeader && (
          <div style={{ padding: '14px 20px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} />
                <span>Demand Specific File Format from Faculty</span>
              </div>
              <button onClick={() => setShowDemandPicker(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.keys(FORMAT_EXTENSIONS).map(fmt => {
                const info = FORMAT_EXTENSIONS[fmt];
                const isSelected = demandedFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setDemandedFormat(fmt)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: isSelected ? `2px solid ${info.color}` : '1px solid #cbd5e1',
                      background: isSelected ? info.color : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={demandPrompt}
                onChange={(e) => setDemandPrompt(e.target.value)}
                placeholder="Optional directive note (e.g. Please upload the revised end-term marksheet)..."
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
              />
              <button
                type="button"
                onClick={handleSendDemand}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#1d4ed8', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Post Demand
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '12px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e)}
          />
          <input
            type="file"
            ref={requestFileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, activeRequestTarget?.id, activeRequestTarget?.format)}
          />

          {/* Admin Demand Button */}
          {isLeader && (
            <button
              type="button"
              onClick={() => setShowDemandPicker(!showDemandPicker)}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                background: showDemandPicker ? '#dbeafe' : '#f8fafc',
                border: '1px solid #93c5fd',
                color: '#1d4ed8',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Demand specific file format from assignee"
            >
              <ShieldAlert size={15} color="#2563eb" />
              <span>Demand File</span>
            </button>
          )}

          {/* General File Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              background: attachedFileObj ? '#eff6ff' : '#f1f5f9',
              border: attachedFileObj ? '1px solid #93c5fd' : '1px solid #cbd5e1',
              color: attachedFileObj ? '#2563eb' : '#475569',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Attach file (verified against required formats)"
          >
            <Paperclip size={15} color={attachedFileObj ? '#2563eb' : '#475569'} />
            <span>Attach</span>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message or attach verified deliverables..."
            style={{ flex: 1, minWidth: '160px', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
          />

          <button
            type="submit"
            style={{ padding: '9px 16px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}


