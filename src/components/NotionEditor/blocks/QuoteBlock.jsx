import React from 'react';

const QuoteBlock = ({ content, onChange, onDelete, onCreateNew }) => {
  return (
    <blockquote className="quote-block"
         contentEditable
         suppressContentEditableWarning
         onInput={(e) => onChange(e.currentTarget.textContent)}
         dangerouslySetInnerHTML={{ __html: content }}
         style={{ borderLeft: '3px solid black', paddingLeft: '16px', fontStyle: 'italic' }}
    />
  );
};

export default QuoteBlock;