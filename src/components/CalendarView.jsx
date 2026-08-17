import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { formatDueDateWithDayTime, getUrgentCountdownInfo } from '../data/initialData';

export default function CalendarView({ tasks = [], onEditTask, onOpenChat, onMoveStage }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Map Tasks by Date String YYYY-MM-DD
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const dateKey = t.dueDate.split('T')[0];
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(t);
  });

  // Build Calendar Days Cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: ''
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    calendarCells.push({
      dayNum: d,
      isCurrentMonth: true,
      dateStr,
      tasks: tasksByDate[dateStr] || []
    });
  }

  // Next month leading days to complete grid (42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      dayNum: i,
      isCurrentMonth: false,
      dateStr: ''
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {monthNames[month]} {year}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              CT University Interactive Academic Task Calendar ({tasks.length} Total Deadlines)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button
            onClick={handleToday}
            style={{ padding: '8px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
          >
            Today
          </button>

          <button
            onClick={handleNextMonth}
            style={{ padding: '8px 12px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px', textAlign: 'center', fontWeight: '800', fontSize: '12px', color: '#475569' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
          <div key={w} style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {w}
          </div>
        ))}
      </div>

      {/* 42-Cell Calendar Month Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const dayTasks = cell.tasks || [];

          return (
            <div
              key={idx}
              style={{
                minHeight: '110px',
                padding: '8px',
                borderRadius: '10px',
                background: cell.isCurrentMonth ? (isToday ? '#eff6ff' : '#ffffff') : '#f8fafc',
                border: isToday ? '2px solid #2563eb' : cell.isCurrentMonth ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                opacity: cell.isCurrentMonth ? 1 : 0.4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Day Number Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: isToday ? '900' : '700',
                  color: isToday ? '#2563eb' : (cell.isCurrentMonth ? '#0f172a' : '#94a3b8'),
                  background: isToday ? '#dbeafe' : 'none',
                  padding: isToday ? '2px 6px' : '0',
                  borderRadius: '6px'
                }}>
                  {cell.dayNum}
                </span>

                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '1px 5px', borderRadius: '10px' }}>
                    {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                  </span>
                )}
              </div>

              {/* Tasks List inside Day Cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                {dayTasks.map((t) => {
                  const urgent = getUrgentCountdownInfo(t.dueDate, t.dueTime, t.stage);
                  const isCompleted = t.stage === 'Accepted' || t.stage === 'Completed';

                  return (
                    <div
                      key={t.id}
                      onClick={() => onEditTask && onEditTask(t)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        background: isCompleted ? '#ecfdf5' : urgent ? urgent.bgColor : '#eff6ff',
                        border: `1px solid ${isCompleted ? '#a7f3d0' : urgent ? urgent.borderColor : '#bfdbfe'}`,
                        color: isCompleted ? '#047857' : urgent ? urgent.textColor : '#1d4ed8',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        lineHeight: '1.2'
                      }}
                      title={`${t.id}: ${t.title} (${t.stage})`}
                    >
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {urgent?.isOverdue ? '🚨 ' : urgent ? '🔥 ' : ''}<strong>{t.id}</strong>: {t.title}
                      </div>

                      <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.dueTime || '17:00'}</span>
                        <span>{t.assigneeName ? t.assigneeName.split(' ')[0] : 'Faculty'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
