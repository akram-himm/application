import React from 'react';

const HeadingBlock = ({
  level,
  content,
  onChange,
  onDelete,
  onCreateNew,
  isSelected
}) => {
  const Tag = `h${level}`;

  const handleKeyDown = (e) => {
    const text = e.currentTarget.textContent;

    // Créer un nouveau bloc avec Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = onCreateNew('text', '');

      setTimeout(() => {
        const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
        if (newBlock) newBlock.focus();
      }, 0);
    }

    // Supprimer le bloc avec Backspace si vide
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.textContent);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <Tag
      className={`heading-block heading-${level}`}
      contentEditable
      suppressContentEditableWarning
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onPaste={handlePaste}
      placeholder={`Heading ${level}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default HeadingBlock;