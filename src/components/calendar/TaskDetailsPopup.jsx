import React from 'react';
import ReactDOM from 'react-dom';

const TaskDetailsPopup = ({ task, position, onClose, onEdit, onDelete }) => {
  if (!task || !position) return null;

  const popupContent = (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        minWidth: '280px',
        maxWidth: '350px',
        border: '1px solid rgba(0,0,0,0.08)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header avec titre et bouton fermer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1f2937',
          margin: 0,
          paddingRight: '12px',
          wordBreak: 'break-word'
        }}>
          {task.name || 'Sans titre'}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>

      {/* Contenu */}
      <div style={{ marginBottom: '16px' }}>
        {task.description && (
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            {task.description}
          </p>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {task.time && task.time !== '-' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#9ca3af">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {task.time} {task.endTime && `- ${task.endTime}`}
              </span>
            </div>
          )}
          
          {task.status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: task.status === 'Terminé' ? '#dcfce7' : 
                               task.status === 'En cours' ? '#fef3c7' : '#f3f4f6',
                color: task.status === 'Terminé' ? '#166534' : 
                       task.status === 'En cours' ? '#92400e' : '#374151'
              }}>
                {task.status}
              </span>
            </div>
          )}

          {task.radarName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6'
              }}>
                {task.radarName} {task.subjectName && `/ ${task.subjectName}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Modifier
        </button>
        <button
          onClick={onDelete}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
        >
          Supprimer
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(popupContent, document.body);
};

export default TaskDetailsPopup;