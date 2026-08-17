import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Tag, CheckSquare, User, Layers, Search, CheckCircle2, Building2 } from 'lucide-react';
import { STAGES, PRIORITIES, formatDueDateWithDayTime } from '../data/initialData';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, team }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('Assigned');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState(team[0]?.id || '');
  const [facultySearch, setFacultySearch] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStage(taskToEdit.stage || 'Assigned');
      setPriority(taskToEdit.priority || 'Medium');
      setAssigneeId(taskToEdit.assigneeId || team[0]?.id || '');
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setDueTime(taskToEdit.dueTime || (taskToEdit.dueDate && taskToEdit.dueDate.includes('T') ? taskToEdit.dueDate.split('T')[1].substring(0, 5) : '17:00'));
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStage('Assigned');
      setPriority('Medium');
      setAssigneeId(team[0]?.id || '');
      setTagsInput('Academic, CSE');
      setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setDueTime('17:00');
      setSubtasks([]);
    }
    setFacultySearch('');
  }, [taskToEdit, isOpen, team]);

  if (!isOpen) return null;

  // Filter faculty by search query (Name, Staff ID, Department, Role)
  const filteredFaculty = team.filter((m) => {
    const q = facultySearch.trim().toLowerCase();
    if (!q) return true;
    const name = (m.name || '').toLowerCase();
    const empId = (m.employeeId || '').toLowerCase();
    const dept = (m.dept || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    return name.includes(q) || empId.includes(q) || dept.includes(q) || role.includes(q);
  });

  const selectedMember = team.find((m) => m.id === assigneeId) || team[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      id: taskToEdit ? taskToEdit.id : `CTU-CSE-${Math.floor(110 + Math.random() * 900)}`,
      title: title.trim(),
      description: description.trim(),
      stage,
      priority,
      assigneeId: selectedMember?.id || assigneeId,
      assigneeName: selectedMember?.name || 'Faculty Member',
      tags: formattedTags.length > 0 ? formattedTags : ['Academic'],
      dueDate: dueTime ? `${dueDate}T${dueTime}` : dueDate,
      dueTime,
      subtasks,
      progressPercent: stage === 'Accepted' || stage === 'Completed' ? 100 : 0,
      deadlineHealth: 'Green',
      isIdle: false
    });

    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([...subtasks, { id: `s-${Date.now()}`, text: newSubtaskText.trim(), done: false }]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
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
      padding: '16px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '620px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              {taskToEdit ? 'Edit Task Assignment' : 'Assign New Faculty Task'}
            </h3>
            <p style={{ fontSize: '11px', color: '#93c5fd', margin: 0 }}>
              CT University Academic & Department Task Delegation
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              Task Title *
            </label>
            <input 
              type="text" 
              placeholder="e.g. Mid-Semester End Term Exam Question Paper Submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              Detailed Description & Objectives
            </label>
            <textarea 
              rows={3}
              placeholder="Detailed guidelines, Bloom taxonomy rules, or department deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* 🔍 Searchable Assignee Selector */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              Select Assignee (Faculty Member) *
            </label>
            
            {/* Search Input for Faculty */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Search faculty by Name (e.g. Shilpa, Harmanpreet, Arvin) or ID (e.g. 26001, 26010, 309)..."
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {facultySearch && (
                <button
                  type="button"
                  onClick={() => setFacultySearch('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Scrollable Filtered Faculty List */}
            <div style={{
              maxHeight: '140px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '4px'
            }}>
              {filteredFaculty.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                  No faculty members match "<strong>{facultySearch}</strong>"
                </div>
              ) : (
                filteredFaculty.map((m) => {
                  const isSelected = m.id === assigneeId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setAssigneeId(m.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        border: isSelected ? '1px solid #93c5fd' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: isSelected ? '#2563eb' : '#64748b',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {m.avatar || m.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                            {m.name}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '6px' }}>
                            • ID: {m.employeeId || '26010'} ({m.dept || 'Engineering'})
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={16} color="#2563eb" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Currently Selected Faculty Badge */}
            {selectedMember && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#166534" />
                <span>Selected Assignee: <strong>{selectedMember.name}</strong> (Staff ID: {selectedMember.employeeId || '26010'})</span>
              </div>
            )}
          </div>

          {/* 2-Column Responsive Form Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Stage Status
              </label>
              <select 
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Priority Level
              </label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Target Due Date & Time Picker with Day & Hours/Minutes */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Calendar size={13} color="#2563eb" /> Target Due Date
                </label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Clock size={13} color="#2563eb" /> Submission Time (Hours : Mins)
                </label>
                <input 
                  type="time" 
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Real-time Formatted Deadline Preview Box */}
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="#2563eb" />
              <span>Formatted Deadline: <strong>{formatDueDateWithDayTime(dueDate, dueTime)}</strong></span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              Tags (comma separated)
            </label>
            <input 
              type="text" 
              placeholder="Exam, Academic, Curriculum, CSE"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Subtask Checklist
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input 
                type="text" 
                placeholder="Add subtask item..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={handleAddSubtask}
                style={{ padding: '8px 14px', borderRadius: '6px', background: '#3b82f6', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Add Item
              </button>
            </div>

            {subtasks.map((st) => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '4px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#334155' }}>{st.text}</span>
                <button type="button" onClick={() => handleRemoveSubtask(st.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '10px 18px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            >
              {taskToEdit ? 'Save Task Updates' : 'Assign Task to Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
