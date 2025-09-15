import React, { useState, useRef, useEffect } from 'react';

const NotionContentEditable = ({ tasks, onUpdateTask }) => {
  const [content, setContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const editorRef = useRef(null);

  const blockTypes = [
    { type: 'h1', label: 'Titre 1', icon: '🔤', command: '#' },
    { type: 'h2', label: 'Titre 2', icon: '📝', command: '##' },
    { type: 'h3', label: 'Titre 3', icon: '📄', command: '###' },
    { type: 'p', label: 'Texte', icon: '📃', command: '' },
    { type: 'ul', label: 'Liste', icon: '•', command: '-' },
    { type: 'hr', label: 'Séparateur', icon: '—', command: '---' }
  ];

  const colors = [
    { name: 'Défaut', value: 'transparent' },
    { name: 'Gris', value: '#f3f4f6' },
    { name: 'Jaune', value: '#fef08a' },
    { name: 'Vert', value: '#bbf7d0' },
    { name: 'Bleu', value: '#bfdbfe' },
    { name: 'Rose', value: '#fce7f3' }
  ];

  // Gérer les raccourcis
  const handleKeyDown = (e) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const text = textNode.textContent;

    // Menu slash
    if (text.endsWith('/')) {
      const rect = range.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
      setShowMenu(true);
      setSelectedMenuIndex(0);
    }

    // Navigation dans le menu
    if (showMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMenuIndex(prev => (prev + 1) % blockTypes.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMenuIndex(prev => prev === 0 ? blockTypes.length - 1 : prev - 1);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertBlock(blockTypes[selectedMenuIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMenu(false);
        return;
      }
    }

    // Transformer avec les raccourcis Markdown
    if (e.key === ' ') {
      const line = getCurrentLine();

      if (line === '#') {
        e.preventDefault();
        transformToHeading('h1');
      } else if (line === '##') {
        e.preventDefault();
        transformToHeading('h2');
      } else if (line === '###') {
        e.preventDefault();
        transformToHeading('h3');
      } else if (line === '-') {
        e.preventDefault();
        transformToList();
      } else if (line === '---') {
        e.preventDefault();
        insertSeparator();
      }
    }
  };

  const getCurrentLine = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const text = textNode.textContent || '';
    const offset = range.startOffset;

    // Trouver le début de la ligne
    let lineStart = text.lastIndexOf('\n', offset - 1) + 1;
    return text.substring(lineStart, offset);
  };

  const transformToHeading = (level) => {
    document.execCommand('formatBlock', false, level);
    clearCurrentLine();
  };

  const transformToList = () => {
    document.execCommand('insertUnorderedList', false);
    clearCurrentLine();
  };

  const insertSeparator = () => {
    document.execCommand('insertHorizontalRule', false);
    clearCurrentLine();
  };

  const clearCurrentLine = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent;
      const offset = range.startOffset;
      let lineStart = text.lastIndexOf('\n', offset - 1) + 1;

      // Supprimer le texte de la ligne
      textNode.textContent = text.substring(0, lineStart) + text.substring(offset);

      // Repositionner le curseur
      range.setStart(textNode, lineStart);
      range.setEnd(textNode, lineStart);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const insertBlock = (blockType) => {
    // Supprimer le "/"
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent;
      const slashIndex = text.lastIndexOf('/');
      if (slashIndex !== -1) {
        textNode.textContent = text.substring(0, slashIndex) + text.substring(slashIndex + 1);
      }
    }

    // Insérer le bloc
    if (blockType.type === 'hr') {
      document.execCommand('insertHorizontalRule', false);
    } else if (blockType.type === 'ul') {
      document.execCommand('insertUnorderedList', false);
    } else {
      document.execCommand('formatBlock', false, blockType.type);
    }

    setShowMenu(false);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      if (onUpdateTask) {
        onUpdateTask(html);
      }
    }
  };

  // Ajouter une couleur de fond à la sélection
  const applyBackgroundColor = (color) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.style.padding = '2px 4px';
      span.style.borderRadius = '3px';

      try {
        range.surroundContents(span);
      } catch (e) {
        // Si la sélection traverse plusieurs éléments
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
    }
  };

  return (
    <div className="relative min-h-[400px] max-w-4xl mx-auto">
      <div className="px-4">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500">Éditeur avec sélection multiple</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Barre d'outils */}
        <div className="flex gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <button
            onClick={() => document.execCommand('bold', false)}
            className="p-2 hover:bg-white rounded"
            title="Gras"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => document.execCommand('italic', false)}
            className="p-2 hover:bg-white rounded"
            title="Italique"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => document.execCommand('underline', false)}
            className="p-2 hover:bg-white rounded"
            title="Souligné"
          >
            <u>U</u>
          </button>
          <div className="w-px bg-gray-300 mx-1" />
          {colors.map(color => (
            <button
              key={color.value}
              onClick={() => applyBackgroundColor(color.value)}
              className="p-1 hover:bg-white rounded"
              title={color.name}
            >
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color.value }}
              />
            </button>
          ))}
        </div>

        {/* Éditeur contentEditable */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[300px] p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#1f2937'
          }}
          suppressContentEditableWarning={true}
        >
          {/* Contenu initial */}
          <p>Commencez à écrire ou tapez '/' pour les commandes...</p>
          <p>Vous pouvez sélectionner plusieurs lignes et les supprimer d'un coup.</p>
          <p>Utilisez # pour les titres, - pour les listes, --- pour un séparateur.</p>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Astuces :</p>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• Sélectionnez du texte avec la souris pour le formater</li>
            <li>• Ctrl+A pour tout sélectionner</li>
            <li>• Ctrl+B pour gras, Ctrl+I pour italique</li>
            <li>• Tapez "/" pour le menu de commandes</li>
            <li>• Cliquez entre les lignes pour insérer du contenu</li>
          </ul>
        </div>
      </div>

      {/* Menu slash */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 w-64 p-2"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          {blockTypes.map((blockType, index) => (
            <button
              key={blockType.type}
              onClick={() => insertBlock(blockType)}
              onMouseEnter={() => setSelectedMenuIndex(index)}
              className={`w-full px-3 py-2 text-left flex items-center gap-3 rounded transition-colors ${
                index === selectedMenuIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{blockType.icon}</span>
              <div>
                <div className="text-sm font-medium">{blockType.label}</div>
                <div className="text-xs text-gray-500">{blockType.command}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotionContentEditable;