import React from 'react';

const TodoBlock = ({
  content,
  checked,
  onChange,
  onToggle,
  onDelete,
  onCreateNew,
  isSelected
}) => {
  const handleKeyDown = (e) => {
    const text = e.currentTarget.textContent;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = onCreateNew('todo', '');
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
    <div className="todo-block">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <div
        className={`todo-content ${checked ? 'checked' : ''}`}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={(e) => onChange(e.currentTarget.textContent)}
        placeholder="To-do"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default TodoBlock;