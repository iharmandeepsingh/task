import React, { useState } from 'react';
import { X, Send, Paperclip, MessageSquare, User, Clock, CheckCheck } from 'lucide-react';

export default function ChatThreadModal({ isOpen, onClose, task, authUser, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  if (!isOpen || !task) return null;

  const messages = task.chatMessages || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachedFile) return;

    const msgObj = {
      id: `msg-${Date.now()}`,
      sender: authUser?.name || 'CurrentUser',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachedFile ? attachedFile.name : null
    };

    onSendMessage(task.id, msgObj);
    setNewMessage('');
    setAttachedFile(null);
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="modal-card" style={{
        width: '100%', maxWidth: '640px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '620px'
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
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Task Chat Thread: {task.id}</div>
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
              <div>No messages in this task thread yet. Start the conversation below!</div>
            </div>
          ) : (
            messages.map((m) => {
              const isSelf = m.sender.includes(authUser?.name?.split(' ')[0] || '___Self___');
              return (
                <div key={m.id || m.time} style={{
                  alignSelf: isSelf ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: isSelf ? '#3b82f6' : '#ffffff',
                  color: isSelf ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: isSelf ? 'none' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '2px', color: isSelf ? '#93c5fd' : '#64748b' }}>
                    {m.sender}
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{m.text}</div>
                  
                  {m.attachment && (
                    <div style={{ marginTop: '6px', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: isSelf ? 'rgba(255,255,255,0.2)' : '#eff6ff', color: isSelf ? '#ffffff' : '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Paperclip size={12} /> {m.attachment}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>{m.time}</span>
                    <CheckCheck size={12} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '14px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="file"
            id="chat-file-input"
            style={{ display: 'none' }}
            onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => document.getElementById('chat-file-input')?.click()}
            style={{ background: attachedFile ? '#eff6ff' : 'none', border: 'none', color: attachedFile ? '#2563eb' : '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
            title={attachedFile ? `Attached: ${attachedFile.name}` : 'Attach file'}
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to HOD / Faculty..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />

          <button
            type="submit"
            style={{ padding: '10px 16px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
