import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, MessageSquare, Clock, AlertTriangle, FileCheck, CheckCircle2, ChevronRight, Send, UserCheck, Layers } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recent';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recent';
  }
}

export default function NotificationBell({ tasks = [], authUser, onOpenChat, onOpenExtensionModal, onOpenReviewModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    const saved = localStorage.getItem('ctu_read_notif_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const dropdownRef = useRef(null);
  const bellButtonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 60, left: 'auto', right: '16px' });

  // Compute exact viewport coordinates for fixed position popover
  useEffect(() => {
    if (isOpen && bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      
      if (rect.left < vw / 2) {
        const safeLeft = Math.max(12, Math.min(rect.left, vw - 352));
        setDropdownPos({
          top: rect.bottom + 8,
          left: `${safeLeft}px`,
          right: 'auto'
        });
      } else {
        const safeRight = Math.max(12, vw - rect.right);
        setDropdownPos({
          top: rect.bottom + 8,
          left: 'auto',
          right: `${safeRight}px`
        });
      }
    }
  }, [isOpen]);

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
  const rawNotifications = [];

  tasks.forEach((t) => {
    const authEmpId = (authUser?.employeeId || '').trim();
    const authId = (authUser?.id || '').trim();
    const authName = (authUser?.name || '').trim().toLowerCase();

    const taskAssigneeId = (t.assigneeId || '').trim();
    const taskAssigneeName = (t.assigneeName || '').trim().toLowerCase();
    const taskCreatorId = (t.creatorId || '').trim();
    const taskCreatorName = (t.creatorName || '').trim().toLowerCase();
    const taskDelegatedById = (t.delegatedById || '').trim();
    const taskDelegatedByName = (t.delegatedByName || '').trim().toLowerCase();

    const isAssignee =
      (authId && taskAssigneeId === authId) ||
      (authEmpId && taskAssigneeId === authEmpId) ||
      (authName && taskAssigneeName === authName);

    const isCreator =
      (authId && taskCreatorId === authId) ||
      (authEmpId && taskCreatorId === authEmpId) ||
      (authName && taskCreatorName === authName);

    const isDelegator =
      (authId && taskDelegatedById === authId) ||
      (authName && taskDelegatedByName === authName);

    const isSuperAdmin =
      authUser?.role === 'superAdmin' ||
      ['10001', '24051', '17572', '001'].includes(authEmpId) ||
      ['usr-0', 'usr-10001', 'usr-24051'].includes(authId);

    const taskCreatedTime = t.createdAt ? new Date(t.createdAt).getTime() : (t.dueDate ? new Date(t.dueDate).getTime() : Date.now());
    const taskDelegatedTime = t.delegatedAt ? new Date(t.delegatedAt).getTime() : taskCreatedTime;

    // 1. Delegated / Forwarded Task Notification (Highest Priority for Faculty & Admin)
    if (t.delegatedByName && isAssignee) {
      rawNotifications.push({
        id: `notif-fwd-${t.id}-${t.delegatedAt || 'fwd'}`,
        type: 'FORWARDED_TO_YOU',
        title: `↗️ Task Forwarded to You: ${t.title}`,
        message: `Forwarded by ${t.delegatedByName} (originated by ${t.creatorName || 'Super Admin'})${t.delegationNotes ? ` • Note: "${t.delegationNotes}"` : ''}`,
        sortTimestamp: taskDelegatedTime,
        timeLabel: formatRelativeTime(t.delegatedAt || t.createdAt),
        task: t,
        action: 'CHAT',
        icon: <Send size={16} color="#16a34a" />
      });
    } else if (t.delegatedByName && isDelegator) {
      rawNotifications.push({
        id: `notif-delegated-confirm-${t.id}`,
        type: 'DELEGATED_BY_YOU',
        title: `ℹ️ Task Delegated: ${t.title}`,
        message: `Assigned to ${t.assigneeName} (${t.assigneeDept || 'Faculty'}) • Due: ${formatDueDateWithDayTime(t.dueDate, t.dueTime)}`,
        sortTimestamp: taskDelegatedTime,
        timeLabel: formatRelativeTime(t.delegatedAt || t.createdAt),
        task: t,
        action: 'CHAT',
        icon: <UserCheck size={16} color="#2563eb" />
      });
    } else if (isAssignee) {
      // Direct Assignment
      rawNotifications.push({
        id: `notif-assign-${t.id}`,
        type: 'ASSIGNMENT',
        title: `📌 Task Assigned: ${t.title}`,
        message: `Assigned by ${t.creatorName || 'Super Admin'} • Due: ${formatDueDateWithDayTime(t.dueDate, t.dueTime)}`,
        sortTimestamp: taskCreatedTime,
        timeLabel: formatRelativeTime(t.createdAt || t.dueDate),
        task: t,
        action: 'CHAT',
        icon: <FileCheck size={16} color="#2563eb" />
      });
    }

    // 2. Chat Replies & Activity
    if (t.chatMessages && t.chatMessages.length > 0) {
      const lastMsg = t.chatMessages[t.chatMessages.length - 1];
      const msgTime = lastMsg.timestamp ? new Date(lastMsg.timestamp).getTime() : Date.now();
      if (lastMsg.senderName !== authUser?.name && (isAssignee || isCreator || isDelegator || isSuperAdmin)) {
        rawNotifications.push({
          id: `notif-chat-${t.id}-${lastMsg.id || t.chatMessages.length}`,
          type: 'CHAT',
          title: `💬 Message on "${t.title}"`,
          message: `${lastMsg.senderName || 'Colleague'}: "${lastMsg.text}"`,
          sortTimestamp: msgTime,
          timeLabel: formatRelativeTime(lastMsg.timestamp || lastMsg.time),
          task: t,
          action: 'CHAT',
          icon: <MessageSquare size={16} color="#059669" />
        });
      }
    }

    // 3. Extension Requests & Approvals
    if (t.extensions && t.extensions.length > 0) {
      const lastExt = t.extensions[t.extensions.length - 1];
      const extTime = lastExt.requestedAt ? new Date(lastExt.requestedAt).getTime() : Date.now();
      const extDate = lastExt.requestedDeadline || lastExt.requestedDate;
      if (lastExt.status === 'PENDING' && (isCreator || isDelegator || isSuperAdmin)) {
        rawNotifications.push({
          id: `notif-ext-${t.id}-${lastExt.requestedAt || 'req'}`,
          type: 'EXTENSION_PENDING',
          title: `⏳ Extension Requested: ${t.title}`,
          message: `${t.assigneeName} requested extension until ${extDate}. Reason: "${lastExt.reason}"`,
          sortTimestamp: extTime,
          timeLabel: formatRelativeTime(lastExt.requestedAt),
          task: t,
          action: 'EXTENSION',
          icon: <Clock size={16} color="#d97706" />
        });
      } else if (lastExt.status === 'APPROVED' && isAssignee) {
        rawNotifications.push({
          id: `notif-ext-app-${t.id}-${lastExt.id || 'app'}`,
          type: 'EXTENSION_APPROVED',
          title: `✅ Deadline Extension Approved!`,
          message: `Your deadline for "${t.title}" has been extended to ${extDate}.`,
          sortTimestamp: extTime + 1000,
          timeLabel: formatRelativeTime(lastExt.requestedAt),
          task: t,
          action: 'EXTENSION',
          icon: <CheckCircle2 size={16} color="#10b981" />
        });
      }
    }

    // 4. Submission & Review Notifications
    if (t.stage === 'Submitted for Review' && (isCreator || isDelegator || isSuperAdmin)) {
      const subTime = t.submittedAt ? new Date(t.submittedAt).getTime() : (t.updatedAt ? new Date(t.updatedAt).getTime() : Date.now());
      rawNotifications.push({
        id: `notif-sub-${t.id}`,
        type: 'REVIEW_NEEDED',
        title: `📥 Submission Received: ${t.title}`,
        message: `${t.assigneeName} submitted task work for review and sign-off.`,
        sortTimestamp: subTime,
        timeLabel: formatRelativeTime(t.submittedAt || t.updatedAt),
        task: t,
        action: 'REVIEW',
        icon: <AlertTriangle size={16} color="#7c3aed" />
      });
    } else if (t.stage === 'Re-issued' && isAssignee) {
      const revTime = t.updatedAt ? new Date(t.updatedAt).getTime() : Date.now();
      rawNotifications.push({
        id: `notif-reissue-${t.id}`,
        type: 'REISSUE',
        title: `🔄 Task Re-issued with Feedback`,
        message: `Task "${t.title}" requires revisions: "${t.review?.feedback || 'Please review directives'}"`,
        sortTimestamp: revTime,
        timeLabel: formatRelativeTime(t.updatedAt),
        task: t,
        action: 'REVIEW',
        icon: <AlertTriangle size={16} color="#dc2626" />
      });
    }
  });

  // ⚡ Crucial: Sort notifications by timestamp DESCENDING (most recent first on top!)
  const notifications = rawNotifications.sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));

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
    <div ref={dropdownRef} style={{ display: 'inline-block' }}>
      {/* Bell Button */}
      <button
        ref={bellButtonRef}
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

      {/* Notification Fixed Popover Window - Immune to parent overflow clipping */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: `${dropdownPos.top}px`,
          left: dropdownPos.left,
          right: dropdownPos.right,
          width: '360px',
          maxWidth: 'calc(100vw - 24px)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid #cbd5e1',
          zIndex: 99999,
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
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Activity & Directives</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '10px', background: '#ef4444', color: '#ffffff', padding: '1px 6px', borderRadius: '10px' }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Sorted recent first</div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={13} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notifications Scroll List */}
          <div style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '6px',
            background: '#f8fafc'
          }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>All caught up!</div>
                <div style={{ fontSize: '11px' }}>No pending notifications or directives.</div>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readNotifIds.includes(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNotif(n)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      marginBottom: '6px',
                      background: isRead ? '#ffffff' : '#f0f9ff',
                      border: isRead ? '1px solid #e2e8f0' : '1px solid #bae6fd',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isRead ? '#f1f5f9' : '#e0f2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {n.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isRead ? '700' : '800',
                          color: isRead ? '#334155' : '#0369a1',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '10px', color: isRead ? '#94a3b8' : '#0284c7', fontWeight: '700', flexShrink: 0 }}>
                          {n.timeLabel}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '11px',
                        color: isRead ? '#64748b' : '#334155',
                        margin: 0,
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {n.message}
                      </p>
                    </div>

                    <ChevronRight size={14} color="#94a3b8" style={{ marginTop: '8px', flexShrink: 0 }} />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '8px 12px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleClearNotifs}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} />
                <span>Dismiss All Notifications</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
