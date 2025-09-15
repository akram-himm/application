import React, { useRef, useEffect } from 'react';

const TextBlock = ({
  content,
  onChange,
  onDelete,
  onCreateNew,
  onSlashCommand,
  isSelected
}) => {
  const contentRef = useRef(null);

  const handleKeyDown = (e) => {
    const text = e.currentTarget.textContent;

    // Slash command
    if (e.key === '/' && text === '') {
      const rect = e.currentTarget.getBoundingClientRect();
      onSlashCommand({ x: rect.left, y: rect.bottom + 5 });
      return;
    }

    // Créer un nouveau bloc avec Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Obtenir la position du curseur
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const offset = range.startOffset;

      // Diviser le contenu si nécessaire
      const beforeCursor = text.substring(0, offset);
      const afterCursor = text.substring(offset);

      // Mettre à jour le bloc actuel
      onChange(beforeCursor);

      // Créer un nouveau bloc avec le contenu après le curseur
      const newBlockId = onCreateNew('text', afterCursor);

      // Focus sur le nouveau bloc
      setTimeout(() => {
        const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
        if (newBlock) {
          newBlock.focus();
          // Placer le curseur au début
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(newBlock, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    }

    // Supprimer le bloc avec Backspace si vide
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      onDelete();
    }

    // Gérer les raccourcis markdown
    if (e.key === ' ') {
      const shortcuts = {
        '#': 'heading1',
        '##': 'heading2',
        '###': 'heading3',
        '-': 'bullet_list',
        '*': 'bullet_list',
        '1.': 'numbered_list',
        '[]': 'todo',
        '>': 'toggle',
        '"': 'quote'
      };

      for (const [shortcut, type] of Object.entries(shortcuts)) {
        if (text === shortcut) {
          e.preventDefault();
          // Transformer le bloc
          const transformEvent = new CustomEvent('transform-block', {
            detail: { type }
          });
          e.currentTarget.dispatchEvent(transformEvent);
          e.currentTarget.textContent = '';
          return;
        }
      }

      // Divider
      if (text === '---') {
        e.preventDefault();
        const transformEvent = new CustomEvent('transform-block', {
          detail: { type: 'divider' }
        });
        e.currentTarget.dispatchEvent(transformEvent);
      }
    }
  };

  const handleInput = (e) => {
    const text = e.currentTarget.textContent;
    onChange(text);

    // Détecter le slash pour le menu
    if (text.endsWith('/')) {
      const rect = e.currentTarget.getBoundingClientRect();
      onSlashCommand({ x: rect.left, y: rect.bottom + 5 });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Écouter l'événement de transformation
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const handleTransform = (e) => {
      const parent = element.closest('.block-wrapper');
      if (parent) {
        const blockId = parent.dataset.blockId;
        // Appeler la transformation via le parent
        const event = new CustomEvent('block-transform', {
          detail: { blockId, type: e.detail.type },
          bubbles: true
        });
        parent.dispatchEvent(event);
      }
    };

    element.addEventListener('transform-block', handleTransform);
    return () => element.removeEventListener('transform-block', handleTransform);
  }, []);

  return (
    <div
      ref={contentRef}
      className="text-block"
      contentEditable
      suppressContentEditableWarning
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onPaste={handlePaste}
      placeholder="Type '/' for commands"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default TextBlock;