import React, { useState, useRef, useEffect } from 'react';

const SimpleNotionEditor = () => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  const blockTypes = [
    { type: 'h1', label: 'Titre 1', icon: '📄', command: '#' },
    { type: 'h2', label: 'Titre 2', icon: '📑', command: '##' },
    { type: 'h3', label: 'Titre 3', icon: '📃', command: '###' },
    { type: 'p', label: 'Texte', icon: '📝', command: '' },
    { type: 'ul', label: 'Liste', icon: '•', command: '-' },
    { type: 'blockquote', label: 'Citation', icon: '💬', command: '>' },
    { type: 'hr', label: 'Séparateur', icon: '—', command: '---' }
  ];

  const handleKeyDown = (e) => {
    // Menu slash
    if (e.key === '/') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();

        // Position relative à l'éditeur
        setMenuPosition({
          x: rect.left - editorRect.left,
          y: rect.bottom - editorRect.top + 5
        });
        setShowMenu(true);
        setSelectedMenuIndex(0);
      }
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
        selectBlockType(blockTypes[selectedMenuIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMenu(false);
        return;
      }
    }

    // Formatage avec raccourcis
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false);
      }
      if (e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false);
      }
      if (e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline', false);
      }
    }

    // Transformer avec Enter après un pattern
    if (e.key === ' ') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const block = range.startContainer.parentElement;
      const text = block.textContent;

      if (text === '#') {
        e.preventDefault();
        transformBlock(block, 'h1');
      } else if (text === '##') {
        e.preventDefault();
        transformBlock(block, 'h2');
      } else if (text === '###') {
        e.preventDefault();
        transformBlock(block, 'h3');
      } else if (text === '-') {
        e.preventDefault();
        transformBlock(block, 'ul');
      } else if (text === '>') {
        e.preventDefault();
        transformBlock(block, 'blockquote');
      } else if (text === '---') {
        e.preventDefault();
        insertSeparator(block);
      }
    }

    // Nouvelle ligne avec Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertParagraph', false);
    }
  };

  const transformBlock = (block, type) => {
    block.textContent = '';

    if (type === 'h1') {
      const h1 = document.createElement('h1');
      h1.className = 'text-3xl font-bold mb-2';
      h1.innerHTML = '<br>';
      block.replaceWith(h1);
      setCursorAtStart(h1);
    } else if (type === 'h2') {
      const h2 = document.createElement('h2');
      h2.className = 'text-2xl font-semibold mb-2';
      h2.innerHTML = '<br>';
      block.replaceWith(h2);
      setCursorAtStart(h2);
    } else if (type === 'h3') {
      const h3 = document.createElement('h3');
      h3.className = 'text-xl font-medium mb-2';
      h3.innerHTML = '<br>';
      block.replaceWith(h3);
      setCursorAtStart(h3);
    } else if (type === 'ul') {
      const li = document.createElement('li');
      li.className = 'ml-6 list-disc';
      li.innerHTML = '<br>';
      block.replaceWith(li);
      setCursorAtStart(li);
    } else if (type === 'blockquote') {
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'border-l-4 border-gray-400 pl-4 italic text-gray-600';
      blockquote.innerHTML = '<br>';
      block.replaceWith(blockquote);
      setCursorAtStart(blockquote);
    }
  };

  const insertSeparator = (block) => {
    const hr = document.createElement('hr');
    hr.className = 'my-4 border-gray-300';
    block.replaceWith(hr);

    const newDiv = document.createElement('div');
    newDiv.innerHTML = '<br>';
    hr.after(newDiv);
    setCursorAtStart(newDiv);
  };

  const setCursorAtStart = (element) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(element, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const selectBlockType = (blockType) => {
    // Supprimer le "/"
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const block = range.startContainer.parentElement;
    const text = block.textContent;

    if (text.endsWith('/')) {
      block.textContent = text.slice(0, -1);
    }

    // Transformer le bloc
    if (blockType.type === 'hr') {
      insertSeparator(block);
    } else {
      transformBlock(block, blockType.type);
    }

    setShowMenu(false);
  };

  // Fonction simple pour tout montrer
  const expandAll = () => {
    const editor = editorRef.current;
    if (!editor) return;

    // Utiliser execCommand pour insérer du CSS temporaire
    const style = document.createElement('style');
    style.id = 'expand-style';

    // Supprimer l'ancien style s'il existe
    const oldStyle = document.getElementById('expand-style');
    if (oldStyle) oldStyle.remove();

    style.innerHTML = `
      #simple-editor * {
        display: block !important;
        visibility: visible !important;
      }
    `;
    document.head.appendChild(style);
  };

  // Fonction simple pour tout cacher sauf les titres
  const collapseAll = () => {
    const editor = editorRef.current;
    if (!editor) return;

    // Utiliser execCommand pour insérer du CSS temporaire
    const style = document.createElement('style');
    style.id = 'collapse-style';

    // Supprimer l'ancien style s'il existe
    const oldStyle = document.getElementById('collapse-style');
    if (oldStyle) oldStyle.remove();
    const expandStyle = document.getElementById('expand-style');
    if (expandStyle) expandStyle.remove();

    style.innerHTML = `
      #simple-editor > *:not(h1):not(h2):not(h3) {
        display: none !important;
      }
      #simple-editor h1,
      #simple-editor h2,
      #simple-editor h3 {
        display: block !important;
      }
    `;
    document.head.appendChild(style);
  };

  // Fonction pour reset (montrer tout normalement)
  const resetView = () => {
    const collapseStyle = document.getElementById('collapse-style');
    if (collapseStyle) collapseStyle.remove();
    const expandStyle = document.getElementById('expand-style');
    if (expandStyle) expandStyle.remove();
  };

  return (
    <div ref={containerRef} className="relative min-h-[400px] max-w-4xl mx-auto">
      <style>{`
        #simple-editor {
          direction: ltr !important;
          text-align: left !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        #simple-editor * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
        }
        #simple-editor:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        #simple-editor:focus-visible {
          outline: none !important;
        }
        ::selection {
          background-color: rgba(59, 130, 246, 0.3);
          color: inherit;
        }
      `}</style>

      <div className="px-4">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500">Notes et planification</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Barre d'outils */}
        <div className="sticky top-0 z-40 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 mb-4 flex items-center gap-1" style={{ backgroundColor: '#f5f5f5' }}>
          <button
            onClick={() => document.execCommand('bold', false)}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 font-bold text-gray-700"
            title="Gras (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={() => document.execCommand('italic', false)}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 italic text-gray-700"
            title="Italique (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={() => document.execCommand('underline', false)}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 underline text-gray-700"
            title="Souligné (Ctrl+U)"
          >
            U
          </button>
          <div className="w-px h-6 bg-gray-400 mx-2" />
          <button
            onClick={() => document.execCommand('formatBlock', false, 'h1')}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
          >
            H1
          </button>
          <button
            onClick={() => document.execCommand('formatBlock', false, 'h2')}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
          >
            H2
          </button>
          <button
            onClick={() => document.execCommand('formatBlock', false, 'h3')}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
          >
            H3
          </button>
          <div className="w-px h-6 bg-gray-400 mx-2" />
          <div className="relative flex items-center gap-1">
            <span className="text-xs text-gray-600">Couleur:</span>
            <input
              type="color"
              onChange={(e) => {
                document.execCommand('foreColor', false, e.target.value);
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Couleur du texte"
            />
            <button
              onClick={() => {
                const color = prompt('Entrez un code couleur (ex: #ff0000 ou red):');
                if (color) {
                  document.execCommand('foreColor', false, color);
                }
              }}
              className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
              title="Couleur personnalisée"
            >
              🎨
            </button>
          </div>
          <div className="w-px h-6 bg-gray-400 mx-2" />
          <button
            onClick={() => document.execCommand('hiliteColor', false, 'yellow')}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
            title="Surligner en jaune"
          >
            <span style={{ backgroundColor: 'yellow', padding: '0 4px' }}>Ab</span>
          </button>
          <div className="w-px h-6 bg-gray-400 mx-2" />
          <button
            onClick={expandAll}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
            title="Tout afficher"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
            title="Afficher seulement les titres"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700"
            title="Vue normale"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Conteneur de l'éditeur avec position relative pour le menu */}
        <div className="relative">
          <div
            id="simple-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className="min-h-[400px] p-4 bg-transparent border-none outline-none"
            onKeyDown={handleKeyDown}
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#1f2937',
              border: 'none',
              outline: 'none'
            }}
          >
            <div>Commencez à écrire ou tapez '/' pour les commandes...</div>
            <div>Vous pouvez maintenant sélectionner plusieurs lignes avec la souris.</div>
            <div>Utilisez # pour les titres, - pour les listes, > pour les citations.</div>
          </div>

          {/* Menu slash - à l'intérieur du conteneur relatif */}
          {showMenu && (
            <div
              className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-100 w-64 p-2"
              style={{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }}
            >
              {blockTypes.map((blockType, index) => (
                <button
                  key={blockType.type}
                  onClick={() => selectBlockType(blockType)}
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

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Astuces :</p>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• Sélectionnez du texte sur plusieurs lignes avec la souris</li>
            <li>• Ctrl+A pour tout sélectionner</li>
            <li>• Ctrl+B pour gras, Ctrl+I pour italique</li>
            <li>• Tapez "/" pour le menu de commandes</li>
            <li>• # puis espace pour un titre, - puis espace pour une liste</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleNotionEditor;