import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, GitBranch } from 'lucide-react';

const GithubIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function GitHubSyncModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const repoUrl = "https://github.com/iharmandeepsingh/task-assignment.git";
  const repoPage = "https://github.com/iharmandeepsingh";

  const commands = [
    { label: "1. Create repository on GitHub", cmd: "Go to https://github.com/new and create a repo named 'task-assignment'" },
    { label: "2. Initialize local Git repository", cmd: "git init" },
    { label: "3. Add all workspace files", cmd: "git add ." },
    { label: "4. Create initial commit", cmd: 'git commit -m "feat: setup task assignment workspace & application"' },
    { label: "5. Set main branch name", cmd: "git branch -M main" },
    { label: "6. Add GitHub remote origin", cmd: `git remote add origin ${repoUrl}` },
    { label: "7. Push workspace code to GitHub", cmd: "git push -u origin main" }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '8px', color: '#6366f1' }}>
              <GithubIcon size={22} />
            </div>
            <div>
              <h3 className="modal-title">Connect GitHub Repository</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target Profile: <a href={repoPage} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>iharmandeepsingh <ExternalLink size={11} /></a>
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '1.25rem', background: 'rgba(99, 102, 241, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '4px' }}>
            <GitBranch size={16} /> Repository Integration Status
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            The local workspace in <code>Desktop/task assignement</code> has been initialized with Git. Follow these commands to link it to your GitHub profile.
          </p>
        </div>

        <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
          {commands.map((step, idx) => (
            <div key={idx} style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '3px' }}>
                {step.label}
              </div>
              <div className="code-block">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={14} color="#64748b" /> {step.cmd}
                </span>
                <button 
                  className="copy-btn" 
                  onClick={() => handleCopy(step.cmd, idx)}
                >
                  {copiedIndex === idx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-primary" onClick={onClose}>
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}
