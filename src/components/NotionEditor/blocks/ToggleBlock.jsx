import React from 'react';

const ToggleBlock = ({ content, onChange, onDelete, onCreateNew }) => {
  return (
    <div className="text-block"
         contentEditable
         suppressContentEditableWarning
         onInput={(e) => onChange(e.currentTarget.textContent)}
         dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ToggleBlock;