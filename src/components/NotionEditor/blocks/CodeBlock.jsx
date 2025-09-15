import React from 'react';

const CodeBlock = ({ content, language = 'javascript', onChange, onDelete, onCreateNew }) => {
  return (
    <pre style={{ background: '#f7f6f3', padding: '16px', borderRadius: '4px', fontFamily: 'monospace' }}>
      <code
         contentEditable
         suppressContentEditableWarning
         onInput={(e) => onChange(e.currentTarget.textContent)}
         dangerouslySetInnerHTML={{ __html: content }}
      />
    </pre>
  );
};

export default CodeBlock;