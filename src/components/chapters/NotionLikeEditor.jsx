import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const NotionLikeEditor = ({ tasks, onAddToKanban, onUpdateTask, onAddTask }) => {
  const [blocks, setBlocks] = useState(tasks?.length > 0 ? tasks : [
    { id: '1', type: 'text', content: '', bgColor: null }
  ]);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [colorMenuBlockId, setColorMenuBlockId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [menuBlockId, setMenuBlockId] = useState(null);
  const updateTimeoutRef = useRef(null);

  const blockTypes = [
    {
      type: 'text',
      label: 'Texte',
      icon: '📄',
      description: 'Commencez à écrire avec du texte brut.',
      category: 'basic'
    },
    {
      type: 'h1',
      label: 'Titre 1',
      icon: '🄗',
      description: 'Titre de grande taille',
      category: 'basic'
    },
    {
      type: 'h2',
      label: 'Titre 2',
      icon: '📤',
      description: 'Titre de taille moyenne',
      category: 'basic'
    },
    {
      type: 'h3',
      label: 'Titre 3',
      icon: '📦',
      description: 'Petit titre',
      category: 'basic'
    },
    {
      type: 'bullet',
      label: 'Liste à puces',
      icon: '•',
      description: 'Créer une liste simple',
      category: 'basic'
    },
    {
      type: 'number',
      label: 'Liste numérotée',
      icon: '1.',
      description: 'Créer une liste numérotée.',
      category: 'basic'
    },
    {
      type: 'todo',
      label: 'Case à cocher',
      icon: '☑',
      description: 'Suivre les tâches avec une case à cocher',
      category: 'basic'
    },
    {
      type: 'divider',
      label: 'Séparateur',
      icon: '—',
      description: 'Séparer visuellement les blocs.',
      category: 'basic'
    },
    {
      type: 'callout',
      label: 'Encadré',
      icon: '📝',
      description: 'Bloc mis en évidence avec fond coloré',
      category: 'basic'
    },
    {
      type: 'quote',
      label: 'Citation',
      icon: '“',
      description: 'Bloc de citation avec bordure',
      category: 'basic'
    },
    {
      type: 'miniblock',
      label: 'Mini-bloc',
      icon: '▦',
      description: 'Petit bloc carré coloré',
      category: 'basic'
    },
    {
      type: 'card',
      label: 'Carte',
      icon: '🗂',
      description: 'Carte avec titre et contenu',
      category: 'basic'
    },
    {
      type: 'alert',
      label: 'Alerte',
      icon: '⚠️',
      description: 'Bloc d’avertissement coloré',
      category: 'basic'
    },
    {
      type: 'info',
      label: 'Info',
      icon: 'ℹ️',
      description: 'Bloc d’information',
      category: 'basic'
    }
  ];

  const backgroundColors = [
    { name: 'Défaut', value: null, color: 'transparent' },
    { name: 'Gris', value: 'gray', color: '#f3f4f6' },
    { name: 'Marron', value: 'brown', color: '#fef3c7' },
    { name: 'Orange', value: 'orange', color: '#fed7aa' },
    { name: 'Jaune', value: 'yellow', color: '#fef08a' },
    { name: 'Vert', value: 'green', color: '#bbf7d0' },
    { name: 'Bleu', value: 'blue', color: '#bfdbfe' },
    { name: 'Violet', value: 'purple', color: '#e9d5ff' },
    { name: 'Rose', value: 'pink', color: '#fce7f3' },
    { name: 'Rouge', value: 'red', color: '#fecaca' }
  ];

  const getBlockStyle = (type) => {
    switch(type) {
      case 'h1': return 'text-3xl font-bold text-gray-900 leading-tight mt-2 mb-1';
      case 'h2': return 'text-2xl font-semibold text-gray-900 leading-tight mt-1.5 mb-0.5';
      case 'h3': return 'text-xl font-medium text-gray-900 leading-tight mt-1';
      case 'bullet': return 'text-base text-gray-700';
      case 'number': return 'text-base text-gray-700';
      case 'todo': return 'text-base text-gray-700';
      case 'callout': return 'text-base text-gray-700';
      case 'quote': return 'text-base text-gray-700 italic';
      case 'miniblock': return 'text-sm text-gray-700';
      case 'card': return 'text-base text-gray-700';
      case 'alert': return 'text-sm text-orange-800';
      case 'info': return 'text-sm text-blue-800';
      default: return 'text-base text-gray-700';
    }
  };

  const getBackgroundColor = (colorValue) => {
    const color = backgroundColors.find(c => c.value === colorValue);
    return color ? color.color : 'transparent';
  };

  const handleKeyDown = (e, blockId, blockIndex) => {
    const block = blocks.find(b => b.id === blockId);

    // Gérer le menu slash
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
        const input = document.getElementById(`block-${blockId}`);
        if (input) {
          input.value = block.content.replace('/', '');
          handleContentChange({ target: input }, blockId);
        }
        return;
      }
    }

    // Navigation entre blocs avec flèches
    if (e.key === 'ArrowUp' && e.target.selectionStart === 0) {
      e.preventDefault();
      if (blockIndex > 0) {
        const prevInput = document.getElementById(`block-${blocks[blockIndex - 1].id}`);
        if (prevInput) {
          prevInput.focus();
          prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
        }
      }
    }
    if (e.key === 'ArrowDown' && e.target.selectionStart === block.content.length) {
      e.preventDefault();
      if (blockIndex < blocks.length - 1) {
        const nextInput = document.getElementById(`block-${blocks[blockIndex + 1].id}`);
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(0, 0);
        }
      }
    }

    // Créer un nouveau bloc avec Entrée (seulement pour les inputs, pas les textareas)
    const isTextarea = block.type === 'miniblock' || block.type === 'card' ||
                      block.type === 'alert' || block.type === 'info' ||
                      block.type === 'callout' || block.type === 'quote';

    if (e.key === 'Enter' && !e.shiftKey && !isTextarea) {
      e.preventDefault();
      const newBlock = {
        id: Date.now().toString(),
        type: 'text',
        content: '',
        bgColor: null
      };
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      setBlocks(newBlocks);

      // Focus sur le nouveau bloc
      setTimeout(() => {
        const newInput = document.getElementById(`block-${newBlock.id}`);
        if (newInput) newInput.focus();
      }, 0);
    }

    // Supprimer le bloc avec Backspace si vide
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = blocks.filter(b => b.id !== blockId);
      setBlocks(newBlocks);

      // Focus sur le bloc précédent
      if (blockIndex > 0) {
        setTimeout(() => {
          const prevBlock = newBlocks[blockIndex - 1];
          if (prevBlock && prevBlock.type !== 'divider') {
            const prevInput = document.getElementById(`block-${prevBlock.id}`);
            if (prevInput) {
              prevInput.focus();
              prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
            }
          }
        }, 0);
      }
    }

    // Supprimer avec Delete
    if (e.key === 'Delete' && e.ctrlKey) {
      e.preventDefault();
      if (blocks.length > 1) {
        const newBlocks = blocks.filter(b => b.id !== blockId);
        setBlocks(newBlocks);
      }
    }
  };

  const handleContentChange = (e, blockId) => {
    const value = e.target.value;
    const block = blocks.find(b => b.id === blockId);

    // Détecter les raccourcis Notion
    if (value === '# ' && block.type === 'text') {
      setBlocks(blocks.map(b =>
        b.id === blockId ? { ...b, type: 'h1', content: '' } : b
      ));
      return;
    }
    if (value === '## ' && block.type === 'text') {
      setBlocks(blocks.map(b =>
        b.id === blockId ? { ...b, type: 'h2', content: '' } : b
      ));
      return;
    }
    if (value === '### ' && block.type === 'text') {
      setBlocks(blocks.map(b =>
        b.id === blockId ? { ...b, type: 'h3', content: '' } : b
      ));
      return;
    }
    if (value === '- ' && block.type === 'text') {
      setBlocks(blocks.map(b =>
        b.id === blockId ? { ...b, type: 'bullet', content: '' } : b
      ));
      return;
    }
    if (value === '[] ' && block.type === 'text') {
      setBlocks(blocks.map(b =>
        b.id === blockId ? { ...b, type: 'todo', content: '', completed: false } : b
      ));
      return;
    }

    // Détecter le slash command
    if (value === '/') {
      const rect = e.target.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
      setShowMenu(true);
      setSelectedMenuIndex(0);
      setMenuBlockId(blockId);
    } else if (!value.includes('/')) {
      setShowMenu(false);
    }

    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, content: value } : block
    ));
  };

  const selectBlockType = (blockType) => {
    if (menuBlockId) {
      setBlocks(blocks.map(block =>
        block.id === menuBlockId
          ? { ...block, type: blockType.type, content: block.content.replace('/', '') }
          : block
      ));
      // Focus et sélectionner le texte après changement
      setTimeout(() => {
        const input = document.getElementById(`block-${menuBlockId}`);
        if (input) {
          input.focus();
          input.setSelectionRange(0, input.value.length);
        }
      }, 0);
    }
    setShowMenu(false);
    setMenuBlockId(null);
  };

  const renderBlock = (block, index) => {
    const blockStyle = getBlockStyle(block.type);

    if (block.type === 'divider') {
      return (
        <div key={block.id} data-block-id={block.id} className="notion-block group relative my-4">
          <hr className="border-gray-300" />
          {/* Bouton pour ajouter après le séparateur */}
          <button
            onClick={() => {
              const newBlock = {
                id: Date.now().toString(),
                type: 'text',
                content: '',
                bgColor: null
              };
              const newBlocks = [...blocks];
              newBlocks.splice(index + 1, 0, newBlock);
              setBlocks(newBlocks);
              setTimeout(() => {
                const input = document.getElementById(`block-${newBlock.id}`);
                if (input) input.focus();
              }, 0);
            }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-400 hover:text-gray-600"
          >
            + Ajouter un bloc
          </button>
        </div>
      );
    }

    const isBoxedBlock = block.type === 'callout' || block.type === 'quote' ||
                          block.type === 'miniblock' || block.type === 'card' ||
                          block.type === 'alert' || block.type === 'info';
    const hasBackground = block.bgColor || isBoxedBlock;

    // Styles spécifiques par type de bloc
    const getBlockClasses = () => {
      let classes = 'group relative rounded transition-all ';

      switch(block.type) {
        case 'miniblock':
          classes += 'inline-block px-3 py-1.5 my-1 mx-1 border border-gray-300 shadow-sm ';
          break;
        case 'card':
          classes += 'p-4 my-3 border border-gray-200 shadow-md ';
          break;
        case 'alert':
          classes += 'p-3 my-2 border-l-4 border-orange-400 bg-orange-50 ';
          break;
        case 'info':
          classes += 'p-3 my-2 border-l-4 border-blue-400 bg-blue-50 ';
          break;
        case 'callout':
          classes += 'p-3 my-2 border border-gray-200 ';
          break;
        case 'quote':
          classes += 'p-3 my-2 border-l-4 border-gray-400 ';
          break;
        default:
          if (hasBackground) {
            classes += 'px-2 py-1 -mx-2 ';
          } else {
            classes += 'hover:bg-gray-50/50 px-2 -mx-2 ';
          }
      }

      return classes;
    };

    return (
      <div
        key={block.id}
        data-block-id={block.id}
        className={`notion-block ${getBlockClasses()}`}
        style={{
          backgroundColor: block.bgColor ? getBackgroundColor(block.bgColor) :
                          block.type === 'alert' ? '#fff7ed' :
                          block.type === 'info' ? '#eff6ff' :
                          block.type === 'miniblock' ? '#f9fafb' :
                          block.type === 'card' ? '#ffffff' :
                          block.type === 'callout' ? '#f9fafb' :
                          'transparent'
        }}
        onMouseEnter={() => setActiveBlockId(block.id)}
        onMouseLeave={() => setActiveBlockId(null)}
      >
        {/* Handle Notion-style au survol - Positionné à droite pour ne pas gêner */}
        <div className="absolute -right-2 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm border border-gray-200 p-0.5">
            <button
              className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              title="Glisser pour déplacer"
              onMouseDown={(e) => e.preventDefault()}
            >
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM5 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM5 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const el = document.getElementById(`block-${block.id}`);
                if (el) {
                  el.innerHTML = '/';
                  el.focus();
                  const rect = el.getBoundingClientRect();
                  setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
                  setShowMenu(true);
                  setSelectedMenuIndex(0);
                  setMenuBlockId(block.id);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Menu commandes (/)"
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <path d="M8 4v8M4 8h8"/>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setColorMenuBlockId(block.id);
                setShowColorMenu(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPosition({ x: rect.right - 240, y: rect.bottom + 5 });
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Couleur de fond"
            >
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8" cy="5" r="1.5"/>
                <circle cx="5.5" cy="9" r="1.5"/>
                <circle cx="10.5" cy="9" r="1.5"/>
              </svg>
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Supprimer ce bloc ?')) {
                  const newBlocks = blocks.filter(b => b.id !== block.id);
                  setBlocks(newBlocks.length > 0 ? newBlocks : [
                    { id: Date.now().toString(), type: 'text', content: '', bgColor: null }
                  ]);
                }
              }}
              className="p-1 hover:bg-red-50 rounded group/delete"
              title="Supprimer le bloc"
            >
              <svg className="w-3 h-3 text-gray-400 group-hover/delete:text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>

        {/* Contenu du bloc */}
        <div className={`relative py-1 ${block.type === 'todo' ? 'flex items-start gap-2' : ''}`}>
          {block.type === 'todo' && (
            <input
              type="checkbox"
              checked={block.completed || false}
              onChange={(e) => {
                setBlocks(blocks.map(b =>
                  b.id === block.id ? { ...b, completed: e.target.checked } : b
                ));
              }}
              className="mt-1"
            />
          )}

          {block.type === 'bullet' && (
            <span className="absolute -left-4 text-gray-400">•</span>
          )}

          {block.type === 'number' && (
            <span className="absolute -left-6 text-gray-400">{index + 1}.</span>
          )}

          {/* ContentEditable pour tous les blocs permettant le formatage riche */}
          <div
            id={`block-${block.id}`}
            contentEditable
            suppressContentEditableWarning={true}
            dir="ltr"
            lang="fr"
            spellCheck="false"
            style={{
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'plaintext',
              minHeight: '1.5em',
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text'
            }}
            onInput={(e) => {
              const html = e.currentTarget.innerHTML;

              // Annuler le timeout précédent
              if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
              }

              // Débouncer la mise à jour pour éviter les problèmes de curseur
              updateTimeoutRef.current = setTimeout(() => {
                setBlocks(prevBlocks =>
                  prevBlocks.map(b =>
                    b.id === block.id ? { ...b, content: html } : b
                  )
                );
              }, 300);
            }}
            onFocus={(e) => {
              // S'assurer que le curseur est bien positionné
              if (e.currentTarget.innerHTML === '') {
                e.currentTarget.innerHTML = '';
              }
            }}
            onKeyDown={(e) => {
              // Détecter le slash pour le menu
              if (e.key === '/' && e.currentTarget.textContent === '') {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
                setShowMenu(true);
                setSelectedMenuIndex(0);
                setMenuBlockId(block.id);
                return;
              }

              // Gérer le menu
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

              // Nouveau bloc avec Entrée (sauf pour les blocs boxed)
              const isBoxed = ['miniblock', 'card', 'alert', 'info', 'callout', 'quote'].includes(block.type);
              if (e.key === 'Enter' && !e.shiftKey && !isBoxed) {
                e.preventDefault();
                const newBlock = {
                  id: Date.now().toString(),
                  type: 'text',
                  content: '',
                  bgColor: null
                };
                const newBlocks = [...blocks];
                newBlocks.splice(index + 1, 0, newBlock);
                setBlocks(newBlocks);
                setTimeout(() => {
                  const newEl = document.getElementById(`block-${newBlock.id}`);
                  if (newEl) newEl.focus();
                }, 0);
              }

              // Supprimer si vide avec Backspace
              if (e.key === 'Backspace' && e.currentTarget.textContent === '' && blocks.length > 1) {
                e.preventDefault();
                const newBlocks = blocks.filter(b => b.id !== block.id);
                setBlocks(newBlocks);
                if (index > 0) {
                  setTimeout(() => {
                    const prevEl = document.getElementById(`block-${blocks[index - 1].id}`);
                    if (prevEl) {
                      prevEl.focus();
                      // Placer le curseur à la fin
                      const range = document.createRange();
                      const sel = window.getSelection();
                      range.selectNodeContents(prevEl);
                      range.collapse(false);
                      sel.removeAllRanges();
                      sel.addRange(range);
                    }
                  }, 0);
                }
              }
            }}
            onPaste={(e) => {
              // Coller comme texte brut pour éviter les problèmes de formatage
              e.preventDefault();
              const text = e.clipboardData.getData('text/plain');
              document.execCommand('insertText', false, text);
            }}
            className={`w-full bg-transparent border-none outline-none focus:outline-none ${blockStyle} ${
              block.completed ? 'line-through text-gray-400' : ''
            }`}
            style={{
              minHeight: block.type === 'h1' ? '40px' :
                        block.type === 'h2' ? '32px' :
                        block.type === 'h3' ? '28px' :
                        '24px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal'
            }}
          />
        </div>
      </div>
    );
  };

  // Initialiser le contenu des blocs
  useEffect(() => {
    blocks.forEach(block => {
      const el = document.getElementById(`block-${block.id}`);
      if (el && block.content && el.innerHTML === '') {
        el.innerHTML = block.content;
      }
    });
  }, []);


  // Sauvegarder automatiquement
  useEffect(() => {
    if (onUpdateTask) {
      onUpdateTask(blocks);
    }
  }, [blocks]);

  return (
    <>
      <style>{`
        [contenteditable] {
          caret-color: #000;
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: embed !important;
        }
        [contenteditable]:focus {
          caret-color: #000;
          outline: none;
        }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .notion-block {
          direction: ltr !important;
          text-align: left !important;
        }
        .notion-block [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: plaintext !important;
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
        }
        /* Permettre la sélection à travers les blocs */
        .space-y-0\\.5 {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
        }
        ::selection {
          background-color: rgba(59, 130, 246, 0.3);
          color: inherit;
        }
        ::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3);
          color: inherit;
        }
      `}</style>
    <div
      className="relative min-h-[400px] max-w-4xl mx-auto"
      onClick={(e) => {
        // Si on clique sur le conteneur principal (pas sur un bloc)
        if (e.target === e.currentTarget || e.target.classList.contains('click-area')) {
          // Ajouter un nouveau bloc
          const newBlock = {
            id: Date.now().toString(),
            type: 'text',
            content: '',
            bgColor: null
          };
          setBlocks([...blocks, newBlock]);
          setTimeout(() => {
            const newEl = document.getElementById(`block-${newBlock.id}`);
            if (newEl) newEl.focus();
          }, 0);
        }
      }}
    >
      <div className="px-4">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500">Notes et planification</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Barre d'outils de formatage */}
        <div className="sticky top-0 z-40 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 mb-4 flex items-center gap-1 shadow-md" style={{ backgroundColor: '#f5f5f5' }}>
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
          <select
            onChange={(e) => {
              if (e.target.value) {
                document.execCommand('fontSize', false, e.target.value);
              }
            }}
            className="px-2 py-1 rounded bg-white border border-gray-200 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
            title="Taille du texte"
            defaultValue=""
          >
            <option value="" disabled>Taille</option>
            <option value="1">Très petit</option>
            <option value="2">Petit</option>
            <option value="3">Normal</option>
            <option value="4">Moyen</option>
            <option value="5">Grand</option>
            <option value="6">Très grand</option>
            <option value="7">Énorme</option>
          </select>
          <div className="relative">
            <input
              type="color"
              onChange={(e) => {
                document.execCommand('foreColor', false, e.target.value);
              }}
              className="absolute opacity-0 w-8 h-8 cursor-pointer"
              title="Couleur du texte"
            />
            <button
              className="px-2 py-1 rounded hover:bg-white bg-white border border-gray-200 text-gray-700 pointer-events-none"
            >
              🎨
            </button>
          </div>
        </div>

        {/* Blocs éditables */}
        <div className="space-y-0.5 pl-10">
          {blocks.map((block, index) => (
            <div key={`wrapper-${block.id}`} className="relative">
              {/* Zone cliquable pour insérer entre les blocs */}
              {index === 0 && (
                <div
                  className="h-2 -mt-2 cursor-text hover:bg-gray-100/50 transition-colors"
                  onClick={() => {
                    const newBlock = {
                      id: Date.now().toString(),
                      type: 'text',
                      content: '',
                      bgColor: null
                    };
                    const newBlocks = [...blocks];
                    newBlocks.splice(0, 0, newBlock);
                    setBlocks(newBlocks);
                    setTimeout(() => {
                      const input = document.getElementById(`block-${newBlock.id}`);
                      if (input) input.focus();
                    }, 0);
                  }}
                />
              )}

              {renderBlock(block, index)}

              {/* Zone cliquable après chaque bloc */}
              <div
                className="h-1 cursor-text hover:bg-gray-100/50 transition-colors relative group"
                onClick={() => {
                  const newBlock = {
                    id: Date.now().toString(),
                    type: 'text',
                    content: '',
                    bgColor: null
                  };
                  const newBlocks = [...blocks];
                  newBlocks.splice(index + 1, 0, newBlock);
                  setBlocks(newBlocks);
                  setTimeout(() => {
                    const input = document.getElementById(`block-${newBlock.id}`);
                    if (input) input.focus();
                  }, 0);
                }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Zone cliquable pour ajouter du contenu */}
        <div
          className="min-h-[200px] cursor-text"
          onClick={(e) => {
            // Si on clique directement sur cette zone
            if (e.target === e.currentTarget) {
              const newBlock = {
                id: Date.now().toString(),
                type: 'text',
                content: '',
                bgColor: null
              };
              setBlocks([...blocks, newBlock]);
              setTimeout(() => {
                const newEl = document.getElementById(`block-${newBlock.id}`);
                if (newEl) newEl.focus();
              }, 0);
            }
          }}
        >
          {blocks.length === 0 && (
            <p className="text-center text-gray-400 pt-8">
              Cliquez n'importe où pour commencer à écrire...
            </p>
          )}
        </div>
      </div>

      {/* Menu de couleurs */}
      {showColorMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 p-3 w-64"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div className="text-xs font-medium text-gray-500 mb-2">COULEUR DE FOND</div>
          <div className="grid grid-cols-5 gap-1.5">
          {backgroundColors.map(color => (
            <button
              key={color.value || 'default'}
              onClick={() => {
                if (colorMenuBlockId) {
                  setBlocks(blocks.map(block =>
                    block.id === colorMenuBlockId
                      ? { ...block, bgColor: color.value }
                      : block
                  ));
                }
                setShowColorMenu(false);
                setColorMenuBlockId(null);
              }}
              className="p-1.5 rounded hover:ring-2 hover:ring-blue-300 transition-all"
              title={color.name}
            >
              <div
                className={`w-8 h-8 rounded border ${
                  color.value === null ? 'border-gray-400 border-dashed' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.color }}
              >
                {color.value === null && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    ×
                  </div>
                )}
              </div>
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Menu slash Notion-style */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-100 w-72 max-h-80 overflow-y-auto"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div className="p-2">
            <div className="px-2 py-1 mb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Blocs de base</p>
            </div>
            {blockTypes.map((blockType, index) => (
              <button
                key={blockType.type}
                onClick={() => selectBlockType(blockType)}
                onMouseEnter={() => setSelectedMenuIndex(index)}
                className={`w-full px-2 py-2 text-left flex items-start gap-3 rounded transition-colors ${
                  index === selectedMenuIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                  index === selectedMenuIndex ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-50'
                }`}>
                  <span className="text-lg">{blockType.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{blockType.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{blockType.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default NotionLikeEditor;