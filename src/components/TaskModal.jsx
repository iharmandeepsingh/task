import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Tag, CheckSquare, User, Layers } from 'lucide-react';
import { STAGES, PRIORITIES } from '../data/initialData';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, team }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('Assigned');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState(team[0]?.id || '');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
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
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStage('Assigned');
      setPriority('Medium');
      setAssigneeId(team[0]?.id || '');
      setTagsInput('Academic, CSE');
      setDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, team]);

  if (!isOpen) return null;

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
      assigneeId,
      assigneeName: team.find(m => m.id === assigneeId)?.name || 'Faculty Member',
      tags: formattedTags.length > 0 ? formattedTags : ['Academic'],
      dueDate,
      subtasks,
      progressPercent: stage === 'Accepted' ? 100 : 0,
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
        maxWidth: '580px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Assign Faculty Member
              </label>
              <select 
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              >
                {team.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Target Due Date
              </label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
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
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={handleAddSubtask}
                style={{ padding: '8px 14px', borderRadius: '8px', background: '#3b82f6', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {subtasks.map((st) => (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={st.done}
                      onChange={() => handleToggleSubtask(st.id)}
                    />
                    <span style={{ textDecoration: st.done ? 'line-through' : 'none', color: st.done ? '#94a3b8' : '#1e293b' }}>
                      {st.text}
                    </span>
                  </label>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }} onClick={() => handleRemoveSubtask(st.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)' }}
            >
              {taskToEdit ? 'Save Changes' : 'Assign Faculty Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
