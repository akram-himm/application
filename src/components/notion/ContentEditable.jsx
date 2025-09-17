import React, { useRef, useEffect, useState } from 'react';

const ContentEditable = ({
  value = '',
  onChange,
  onKeyDown,
  placeholder = '',
  readOnly = false,
  focused = false,
  isCode = false,
  className = ''
}) => {
  const ref = useRef(null);
  const [showPlaceholder, setShowPlaceholder] = useState(!value);
  const [selection, setSelection] = useState(null);

  // Focus management
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus();

      // Placer le curseur à la fin
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [focused]);

  // Mettre à jour le contenu depuis les props
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      // Sauvegarder la position du curseur
      const sel = window.getSelection();
      const wasAtEnd = sel.rangeCount > 0 &&
        sel.getRangeAt(0).endOffset === ref.current.textContent?.length;

      ref.current.textContent = value;

      // Restaurer la position du curseur
      if (wasAtEnd && value) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    setShowPlaceholder(!value);
  }, [value]);

  const handleInput = (e) => {
    const newValue = e.target.textContent;
    onChange(newValue);
    setShowPlaceholder(!newValue);
  };

  const handleKeyDown = (e) => {
    // Empêcher les sauts de ligne dans le code inline
    if (!isCode && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }

    // Passer l'événement au parent
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Récupérer le texte brut
    const text = e.clipboardData.getData('text/plain');

    // Insérer le texte à la position du curseur
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);

      // Déclencher l'événement input
      handleInput({ target: ref.current });
    }
  };

  // Gérer le formatage inline
  const handleFormat = (format) => {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        break;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(formattedText));

    // Déclencher la mise à jour
    handleInput({ target: ref.current });
  };

  // Menu de formatage flottant
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ x: 0, y: 0 });

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && !sel.isCollapsed && !readOnly) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setFormatMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowFormatMenu(true);
    } else {
      setShowFormatMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [readOnly]);

  return (
    <>
      <div className="relative inline-block w-full">
        <div
          ref={ref}
          contentEditable={!readOnly}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`outline-none ${className}`}
          style={{
            minHeight: '1.5em',
            wordBreak: 'break-word',
            whiteSpace: isCode ? 'pre' : 'pre-wrap'
          }}
        />

        {/* Placeholder */}
        {showPlaceholder && placeholder && (
          <div className="absolute inset-0 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Menu de formatage flottant */}
      {showFormatMenu && (
        <div
          className="fixed bg-gray-900 text-white rounded-lg shadow-lg p-1 flex items-center gap-1 z-50"
          style={{
            left: `${formatMenuPosition.x}px`,
            top: `${formatMenuPosition.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormat('bold');
            }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Gras"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 15.5H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5m-3.5-9h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H10v-3m5.6 1.29c.97-.68 1.65-1.79 1.65-3.04 0-2.07-1.68-3.75-3.75-3.75H7v14h7.04c2 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42z" />
            </svg>
          </button>

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormat('italic');
            }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Italique"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 5v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V5h-8z" />
            </svg>
          </button>

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormat('underline');
            }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Souligné"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2v8c0 2.21-1.79 4-4 4s-4-1.79-4-4V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
            </svg>
          </button>

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormat('strikethrough');
            }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Barré"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
            </svg>
          </button>

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormat('code');
            }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Code"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default ContentEditable;