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
  const [isLocalFocused, setIsLocalFocused] = useState(false);
  const lastValueRef = useRef(value);

  // Focus management
  useEffect(() => {
    if (focused && ref.current && !isLocalFocused) {
      ref.current.focus();

      // Placer le curseur à la fin
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [focused, isLocalFocused]);

  // Mettre à jour le contenu depuis les props seulement si nécessaire
  useEffect(() => {
    if (!ref.current) return;

    // Ne mettre à jour que si la valeur a vraiment changé de l'extérieur
    if (value !== lastValueRef.current && ref.current.textContent !== value) {
      // Sauvegarder la position du curseur
      const sel = window.getSelection();
      let savedRange = null;

      if (sel.rangeCount > 0 && ref.current.contains(sel.anchorNode)) {
        savedRange = sel.getRangeAt(0);
      }

      ref.current.textContent = value;
      lastValueRef.current = value;

      // Restaurer la position du curseur si l'élément a le focus
      if (savedRange && isLocalFocused) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        } catch (e) {
          // Si impossible de restaurer, placer à la fin
          const range = document.createRange();
          range.selectNodeContents(ref.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }, [value, isLocalFocused]);

  const handleInput = (e) => {
    const newValue = e.target.textContent;
    lastValueRef.current = newValue;
    onChange(newValue);
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

  const handleFocus = () => {
    setIsLocalFocused(true);
  };

  const handleBlur = () => {
    setIsLocalFocused(false);
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

  // Déterminer si on doit afficher le placeholder
  const shouldShowPlaceholder = !value && isLocalFocused && placeholder;

  return (
    <div className="relative w-full">
      <div
        ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`outline-none ${className}`}
        style={{
          minHeight: '1.5em',
          wordBreak: 'break-word',
          whiteSpace: isCode ? 'pre' : 'pre-wrap'
        }}
      />

      {/* Placeholder - Visible seulement si vide ET focus */}
      {shouldShowPlaceholder && (
        <div
          className="absolute inset-0 text-gray-400 pointer-events-none select-none"
          style={{ lineHeight: 'inherit' }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default ContentEditable;