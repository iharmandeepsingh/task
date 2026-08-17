import React, { useState } from 'react';
import { X, Send, Paperclip, MessageSquare, User, Clock, CheckCheck, FileText, FileSpreadsheet, Download, Image as ImageIcon } from 'lucide-react';

export default function ChatThreadModal({ isOpen, onClose, task, authUser, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFileObj, setAttachedFileObj] = useState(null);

  if (!isOpen || !task) return null;

  const messages = task.chatMessages || [];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    let fileType = 'DOCUMENT';
    if (['pdf'].includes(fileExt)) fileType = 'PDF';
    else if (['doc', 'docx'].includes(fileExt)) fileType = 'DOC';
    else if (['xls', 'xlsx', 'csv'].includes(fileExt)) fileType = 'EXCEL';
    else if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExt)) fileType = 'IMAGE';

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedFileObj({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: fileType,
        dataUrl: evt.target.result
      });
    };
    reader.readAsDataURL(file);
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
  };

  const renderFileIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText size={18} color="#ef4444" />;
      case 'EXCEL': return <FileSpreadsheet size={18} color="#10b981" />;
      case 'DOC': return <FileText size={18} color="#2563eb" />;
      case 'IMAGE': return <ImageIcon size={18} color="#8b5cf6" />;
      default: return <Paperclip size={18} color="#64748b" />;
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
        width: '100%', maxWidth: '660px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '640px'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
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
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Task Chat & Document Attachments • {task.id}</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#ffffff' }}>{task.title}</h3>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Message History Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px', fontSize: '13px' }}>
              <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div>No messages in this task thread yet. Send a note or attach research PDFs / rubrics below!</div>
            </div>
          ) : (
            messages.map((m) => {
              const isSelf = m.sender.includes(authUser?.name?.split(' ')[0] || '___Self___');
              const att = m.attachment;
              const attName = typeof att === 'object' && att !== null ? att.name : (typeof att === 'string' ? att : null);
              const attSize = typeof att === 'object' && att !== null ? att.size : '';
              const attType = typeof att === 'object' && att !== null ? att.type : 'DOC';
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
                  
                  {/* File Attachment Card inside Message */}
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

        {/* File Preview before Sending */}
        {attachedFileObj && (
          <div style={{ padding: '8px 20px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {renderFileIcon(attachedFileObj.type)}
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af' }}>
                Attached: {attachedFileObj.name} ({attachedFileObj.size})
              </span>
            </div>
            <button onClick={() => setAttachedFileObj(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '14px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="file"
            id="chat-file-input"
            accept=".pdf, .doc, .docx, .xls, .xlsx, .csv, .png, .jpg, .jpeg"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          <button
            type="button"
            onClick={() => document.getElementById('chat-file-input')?.click()}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: attachedFileObj ? '#eff6ff' : '#f1f5f9',
              border: attachedFileObj ? '1px solid #93c5fd' : '1px solid #cbd5e1',
              color: attachedFileObj ? '#2563eb' : '#475569',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Attach PDF, Word Manuscript, or Excel Annexure"
          >
            <Paperclip size={16} color={attachedFileObj ? '#2563eb' : '#475569'} />
            <span>Attach File</span>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message or attach manuscript / rubric PDF..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />

          <button
            type="submit"
            style={{ padding: '10px 18px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
