import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, MessageSquare, Clock, AlertTriangle, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';

export default function NotificationBell({ tasks = [], authUser, onOpenChat, onOpenExtensionModal, onOpenReviewModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    const saved = localStorage.getItem('ctu_read_notif_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate Real-time Notification Feed from Tasks & Activities
  const notifications = [];

  tasks.forEach((t) => {
    const isAssignee = authUser?.name === t.assigneeName || authUser?.id === t.assigneeId;
    const isCreator = authUser?.name === t.creatorName || authUser?.id === t.creatorId;

    // 1. Task Assignment Notification
    if (isAssignee) {
      notifications.push({
        id: `notif-assign-${t.id}`,
        type: 'ASSIGNMENT',
        title: `📌 Task Assigned: ${t.title}`,
        message: `Assigned by ${t.creatorName || 'Super Admin'} • Due: ${formatDueDateWithDayTime(t.dueDate, t.dueTime)}`,
        timestamp: t.dueDate || 'Recent',
        task: t,
        icon: <FileCheck size={16} color="#2563eb" />
      });
    }

    // 2. Chat Replies & Activity
    if (t.chatMessages && t.chatMessages.length > 0) {
      const lastMsg = t.chatMessages[t.chatMessages.length - 1];
      if (lastMsg.sender !== authUser?.name && (isAssignee || isCreator)) {
        notifications.push({
          id: `notif-chat-${t.id}-${lastMsg.id || t.chatMessages.length}`,
          type: 'CHAT',
          title: `💬 New Message on "${t.title}"`,
          message: `${lastMsg.sender}: "${lastMsg.text}"`,
          timestamp: lastMsg.time || 'Just now',
          task: t,
          action: 'CHAT',
          icon: <MessageSquare size={16} color="#059669" />
        });
      }
    }

    // 3. Extension Requests & Approvals
    if (t.extensions && t.extensions.length > 0) {
      const lastExt = t.extensions[t.extensions.length - 1];
      if (lastExt.status === 'PENDING' && isCreator) {
        notifications.push({
          id: `notif-ext-${t.id}-${lastExt.requestedAt || 'req'}`,
          type: 'EXTENSION_PENDING',
          title: `⏳ Extension Requested: ${t.title}`,
          message: `${t.assigneeName} requested extension until ${lastExt.requestedDate}. Reason: "${lastExt.reason}"`,
          timestamp: 'Action Needed',
          task: t,
          action: 'EXTENSION',
          icon: <Clock size={16} color="#d97706" />
        });
      } else if (lastExt.status === 'APPROVED' && isAssignee) {
        notifications.push({
          id: `notif-ext-app-${t.id}`,
          type: 'EXTENSION_APPROVED',
          title: `✅ Deadline Extension Approved!`,
          message: `Your deadline for "${t.title}" has been extended to ${lastExt.requestedDate}.`,
          timestamp: 'Approved',
          task: t,
          icon: <CheckCircle2 size={16} color="#10b981" />
        });
      }
    }

    // 4. Submission & Review Notifications
    if (t.stage === 'Submitted for Review' && isCreator) {
      notifications.push({
        id: `notif-sub-${t.id}`,
        type: 'REVIEW_NEEDED',
        title: `📥 Submission Received: ${t.title}`,
        message: `${t.assigneeName} submitted task work for final review and sign-off.`,
        timestamp: 'Review Needed',
        task: t,
        action: 'REVIEW',
        icon: <AlertTriangle size={16} color="#7c3aed" />
      });
    } else if (t.stage === 'Re-issued' && isAssignee) {
      notifications.push({
        id: `notif-reissue-${t.id}`,
        type: 'REISSUE',
        title: `🔄 Task Re-issued with Feedback`,
        message: `Task "${t.title}" requires revisions: "${t.review?.feedback || 'Please update subtasks'}"`,
        timestamp: 'Revision Needed',
        task: t,
        action: 'REVIEW',
        icon: <AlertTriangle size={16} color="#dc2626" />
      });
    }
  });

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('ctu_read_notif_ids', JSON.stringify(allIds));
  };

  const handleClearNotifs = () => {
    handleMarkAllRead();
    setIsOpen(false);
  };

  const handleSelectNotif = (n) => {
    if (!readNotifIds.includes(n.id)) {
      const updated = [...readNotifIds, n.id];
      setReadNotifIds(updated);
      localStorage.setItem('ctu_read_notif_ids', JSON.stringify(updated));
    }

    if (n.action === 'CHAT' && onOpenChat) {
      onOpenChat(n.task);
    } else if (n.action === 'EXTENSION' && onOpenExtensionModal) {
      onOpenExtensionModal(n.task);
    } else if (n.action === 'REVIEW' && onOpenReviewModal) {
      onOpenReviewModal(n.task);
    }

    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px 12px',
          borderRadius: '10px',
          background: isOpen ? '#eff6ff' : '#f8fafc',
          border: '1px solid #cbd5e1',
          color: '#1e293b',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
      >
        <Bell size={18} color={unreadCount > 0 ? '#2563eb' : '#64748b'} />
        <span style={{ fontSize: '12px', fontWeight: '700' }}>Notifications</span>

        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '900',
            padding: '2px 6px',
            borderRadius: '10px',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '46px',
          right: 0,
          width: '340px',
          maxWidth: 'calc(100vw - 24px)',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
          boxSizing: 'border-box'
        }}>
          {/* Dropdown Header */}
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#60a5fa" />
              <strong style={{ fontSize: '13px' }}>In-App Notifications</strong>
              {unreadCount > 0 && (
                <span style={{ background: '#3b82f6', color: '#ffffff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notifications List with Viewport Safety Scroll */}
          <div style={{ maxHeight: 'calc(70vh - 100px)', minHeight: '120px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                🔔 No recent notifications. You are all caught up!
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readNotifIds.includes(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNotif(n)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: isRead ? '#ffffff' : '#f0f9ff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: isRead ? '600' : '800', color: isRead ? '#334155' : '#0f172a', marginBottom: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{n.title}</span>
                        {!isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
                        {n.timestamp}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#cbd5e1" style={{ marginTop: '4px' }} />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {notifications.length > 0 && (
            <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button
                onClick={handleClearNotifs}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                Dismiss Menu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
