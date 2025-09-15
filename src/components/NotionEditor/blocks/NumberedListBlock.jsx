import React from 'react';

const NumberedListBlock = ({
  content,
  index,
  onChange,
  onDelete,
  onCreateNew,
  isSelected
}) => {
  const handleKeyDown = (e) => {
    const text = e.currentTarget.textContent;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = onCreateNew('numbered_list', '');
      setTimeout(() => {
        const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
        if (newBlock) newBlock.focus();
      }, 0);
    }

    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div className="numbered-list-block">
      <span className="number">{index}.</span>
      <div
        className="list-content"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={(e) => onChange(e.currentTarget.textContent)}
        placeholder="List item"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default NumberedListBlock;