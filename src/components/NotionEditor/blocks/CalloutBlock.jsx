import React from 'react';

const CalloutBlock = ({ content, icon = '💡', onChange, onDelete, onCreateNew }) => {
  return (
    <div className="callout-block" style={{ display: 'flex', padding: '16px', background: '#f7f6f3', borderRadius: '4px' }}>
      <span style={{ fontSize: '24px', marginRight: '12px' }}>{icon}</span>
      <div
         contentEditable
         suppressContentEditableWarning
         onInput={(e) => onChange(e.currentTarget.textContent)}
         dangerouslySetInnerHTML={{ __html: content }}
         style={{ flex: 1 }}
      />
    </div>
  );
};

export default CalloutBlock;