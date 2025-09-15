import React, { useState, useEffect, useRef } from 'react';
import './EditorStyles.css';

const NotionEditor = ({ subjectId, radarId, subjectName, onSave, onAddToKanban }) => {
  // État des blocs de contenu
  const [blocks, setBlocks] = useState([
    {
      id: '1',
      type: 'h1',
      content: `Plan complet - ${subjectName || 'Matière'}`,
      indent: 0,
      collapsed: false,
      checked: false
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuBlockId, setSlashMenuBlockId] = useState(null);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());

  // Types de blocs disponibles
  const blockTypes = [
    { type: 'h1', label: 'Titre 1 - Chapitre', icon: '#', shortcut: '# ', description: 'Grand titre de chapitre' },
    { type: 'h2', label: 'Titre 2 - Section', icon: '##', shortcut: '## ', description: 'Sous-chapitre' },
    { type: 'h3', label: 'Titre 3 - Sous-section', icon: '###', shortcut: '### ', description: 'Petite section' },
    { type: 'text', label: 'Texte', icon: 'T', shortcut: '', description: 'Texte simple' },
    { type: 'bullet', label: 'Liste à puces', icon: '•', shortcut: '- ', description: 'Liste non ordonnée' },
    { type: 'numbered', label: 'Liste numérotée', icon: '1.', shortcut: '1. ', description: 'Liste ordonnée' },
    { type: 'todo', label: 'Case à cocher', icon: '☐', shortcut: '[] ', description: 'Tâche à cocher' },
    { type: 'toggle', label: 'Toggle', icon: '▶', shortcut: '> ', description: 'Bloc dépliable' },
    { type: 'divider', label: 'Séparateur', icon: '—', shortcut: '---', description: 'Ligne de séparation' },
    { type: 'callout', label: 'Callout', icon: '💡', shortcut: '/callout', description: 'Bloc de mise en évidence' },
    { type: 'code', label: 'Code', icon: '</>', shortcut: '```', description: 'Bloc de code' },
    { type: 'quote', label: 'Citation', icon: '"', shortcut: '> ', description: 'Bloc de citation' }
  ];

  // Charger les données sauvegardées pour cette matière spécifique
  useEffect(() => {
    if (!subjectId || !radarId) return;

    const savedKey = `notion-content-${radarId}-${subjectId}`;
    const saved = localStorage.getItem(savedKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.blocks && parsed.blocks.length > 0) {
          setBlocks(parsed.blocks);
        }
      } catch (e) {
        console.error('Erreur de chargement du contenu:', e);
      }
    }
  }, [subjectId, radarId]);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (!subjectId || !radarId) return;

    const saveTimeout = setTimeout(() => {
      const savedKey = `notion-content-${radarId}-${subjectId}`;
      const dataToSave = {
        blocks,
        lastModified: new Date().toISOString(),
        subjectId,
        radarId
      };

      localStorage.setItem(savedKey, JSON.stringify(dataToSave));
      setLastSaved(new Date());

      if (onSave) {
        onSave(blocks);
      }
    }, 1000); // Sauvegarde après 1 seconde d'inactivité

    return () => clearTimeout(saveTimeout);
  }, [blocks, subjectId, radarId, onSave]);

  // Créer un nouveau bloc
  const createBlock = (afterId, type = 'text', content = '', indent = 0) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      indent: Math.min(indent, 5), // Maximum 5 niveaux d'indentation
      collapsed: false,
      checked: false,
      toggleContent: type === 'toggle' ? [] : undefined,
      calloutEmoji: type === 'callout' ? '💡' : undefined
    };

    const index = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];

    if (index === -1) {
      newBlocks.push(newBlock);
    } else {
      newBlocks.splice(index + 1, 0, newBlock);
    }

    setBlocks(newBlocks);
    return newBlock.id;
  };

  // Mettre à jour un bloc
  const updateBlock = (id, updates) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  // Supprimer un bloc
  const deleteBlock = (id) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  // Gérer les raccourcis clavier
  const handleKeyDown = (e, blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Enter - créer nouveau bloc
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newId = createBlock(blockId, 'text', '', block.indent);

      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newId}"]`);
        if (el) {
          el.focus();
        }
      }, 50);
    }

    // Tab - indenter
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      updateBlock(blockId, { indent: Math.min(block.indent + 1, 5) });
    }

    // Shift+Tab - désindenter
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      updateBlock(blockId, { indent: Math.max(block.indent - 1, 0) });
    }

    // Backspace sur bloc vide - supprimer et fusionner
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      const index = blocks.findIndex(b => b.id === blockId);

      if (index > 0) {
        deleteBlock(blockId);
        const prevBlock = blocks[index - 1];

        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${prevBlock.id}"]`);
          if (el) {
            el.focus();
            // Placer le curseur à la fin
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 50);
      }
    }

    // Flèche haut/bas pour naviguer entre blocs
    if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      const index = blocks.findIndex(b => b.id === blockId);
      if (index > 0) {
        const prevBlock = blocks[index - 1];
        const el = document.querySelector(`[data-block-id="${prevBlock.id}"]`);
        if (el) el.focus();
      }
    }

    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      const index = blocks.findIndex(b => b.id === blockId);
      if (index < blocks.length - 1) {
        const nextBlock = blocks[index + 1];
        const el = document.querySelector(`[data-block-id="${nextBlock.id}"]`);
        if (el) el.focus();
      }
    }
  };

  // Gérer le changement de contenu
  const handleInput = (e, blockId) => {
    const content = e.target.innerText;
    const block = blocks.find(b => b.id === blockId);

    // Détecter le slash menu
    if (content === '/') {
      const rect = e.target.getBoundingClientRect();
      setSlashMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
      setShowSlashMenu(true);
      setSlashMenuBlockId(blockId);
      return;
    }

    // Fermer le slash menu si on continue à taper
    if (showSlashMenu && !content.startsWith('/')) {
      setShowSlashMenu(false);
    }

    // Détecter les raccourcis markdown
    const shortcuts = {
      '# ': 'h1',
      '## ': 'h2',
      '### ': 'h3',
      '- ': 'bullet',
      '* ': 'bullet',
      '1. ': 'numbered',
      '[] ': 'todo',
      '[ ] ': 'todo',
      '[x] ': 'todo',
      '> ': 'quote',
      '---': 'divider',
      '```': 'code'
    };

    for (const [shortcut, type] of Object.entries(shortcuts)) {
      if (content === shortcut || content.startsWith(shortcut + ' ')) {
        e.target.innerText = content.replace(shortcut, '').trim();
        updateBlock(blockId, {
          type,
          content: content.replace(shortcut, '').trim(),
          checked: shortcut === '[x]'
        });
        return;
      }
    }

    updateBlock(blockId, { content });
  };

  // Sélectionner depuis le slash menu
  const selectFromSlashMenu = (type) => {
    if (slashMenuBlockId) {
      const block = blocks.find(b => b.id === slashMenuBlockId);
      updateBlock(slashMenuBlockId, { type, content: '' });

      const el = document.querySelector(`[data-block-id="${slashMenuBlockId}"]`);
      if (el) {
        el.innerText = '';
        el.focus();
      }
    }
    setShowSlashMenu(false);
  };

  // Envoyer au Kanban
  const sendToKanban = (block) => {
    if (!onAddToKanban) return;

    const blockIndex = blocks.findIndex(b => b.id === block.id);
    const children = [];
    const blockIndent = block.indent;

    // Collecter tous les enfants (blocs avec indentation supérieure)
    for (let i = blockIndex + 1; i < blocks.length; i++) {
      if (blocks[i].indent > blockIndent) {
        children.push(blocks[i]);
      } else {
        break;
      }
    }

    const kanbanTask = {
      id: `task-${Date.now()}`,
      title: block.content || 'Nouvelle tâche',
      description: children.map(c => {
        const prefix = c.type === 'bullet' ? '• ' :
                       c.type === 'numbered' ? '1. ' :
                       c.type === 'todo' ? (c.checked ? '☑ ' : '☐ ') : '';
        return prefix + c.content;
      }).join('\n'),
      type: block.type,
      status: 'todo',
      createdFrom: 'notion-editor',
      originalBlockId: block.id
    };

    onAddToKanban(kanbanTask);

    // Feedback visuel
    const el = document.querySelector(`[data-block-id="${block.id}"]`);
    if (el) {
      el.style.backgroundColor = '#10B981';
      el.style.color = 'white';
      setTimeout(() => {
        el.style.backgroundColor = '';
        el.style.color = '';
      }, 500);
    }
  };

  // Gérer le drag & drop
  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetId) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex(b => b.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);

    // Insérer après le bloc cible
    const insertIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
    newBlocks.splice(insertIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedBlockId(null);
  };

  // Rendu du style du bloc
  const getBlockStyle = (block) => {
    const baseStyle = {
      paddingLeft: `${block.indent * 28 + 8}px`,
      minHeight: '28px',
      lineHeight: '1.5',
      outline: 'none',
      width: '100%'
    };

    const typeStyles = {
      h1: { fontSize: '24px', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px' },
      h2: { fontSize: '20px', fontWeight: 'bold', marginTop: '12px', marginBottom: '6px' },
      h3: { fontSize: '16px', fontWeight: 'bold', marginTop: '8px', marginBottom: '4px' },
      text: { fontSize: '14px' },
      bullet: { fontSize: '14px' },
      numbered: { fontSize: '14px' },
      todo: { fontSize: '14px', textDecoration: block.checked ? 'line-through' : 'none', opacity: block.checked ? 0.5 : 1 },
      quote: { fontSize: '14px', fontStyle: 'italic', borderLeft: '3px solid #E5E7EB', paddingLeft: `${block.indent * 28 + 20}px`, color: '#6B7280' },
      code: { fontSize: '13px', fontFamily: 'monospace', backgroundColor: '#F3F4F6', padding: '8px', borderRadius: '4px' },
      callout: { fontSize: '14px', backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '4px', border: '1px solid #FCD34D' }
    };

    return { ...baseStyle, ...(typeStyles[block.type] || {}) };
  };

  // Rendu d'un bloc
  const renderBlock = (block, index) => {
    if (block.type === 'divider') {
      return (
        <div
          key={block.id}
          className="my-4"
          style={{ paddingLeft: `${block.indent * 28}px` }}
        >
          <hr className="border-gray-300" />
        </div>
      );
    }

    return (
      <div
        key={block.id}
        className={`block-wrapper group relative flex items-start py-1 px-2 hover:bg-gray-50 rounded transition-colors ${
          selectedBlockId === block.id ? 'bg-blue-50' : ''
        } ${draggedBlockId === block.id ? 'opacity-50' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, block.id)}
        onClick={() => setSelectedBlockId(block.id)}
      >
        {/* Poignée de drag */}
        <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move p-1">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM15 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM15 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM15 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          </svg>
        </div>

        {/* Actions du bloc (visible au survol) */}
        <div className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {(block.type === 'h1' || block.type === 'h2' || block.type === 'h3') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendToKanban(block);
              }}
              className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              title="Ajouter au Kanban"
            >
              +📋
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(block.id);
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Supprimer"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Contenu du bloc */}
        <div className="flex-1 flex items-start" style={{ marginLeft: '20px' }}>
          {/* Préfixe selon le type */}
          {block.type === 'todo' && (
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              className="mr-2 mt-1"
            />
          )}

          {block.type === 'bullet' && (
            <span className="mr-2 text-gray-500">•</span>
          )}

          {block.type === 'numbered' && (
            <span className="mr-2 text-gray-500">{index + 1}.</span>
          )}

          {block.type === 'toggle' && (
            <button
              onClick={() => updateBlock(block.id, { collapsed: !block.collapsed })}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {block.collapsed ? '▶' : '▼'}
            </button>
          )}

          {block.type === 'callout' && (
            <span className="mr-2">{block.calloutEmoji || '💡'}</span>
          )}

          {/* Zone éditable */}
          <div
            data-block-id={block.id}
            contentEditable
            suppressContentEditableWarning
            style={getBlockStyle(block)}
            className={`flex-1 ${block.checked ? 'line-through text-gray-400' : ''}`}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            onInput={(e) => handleInput(e, block.id)}
            dangerouslySetInnerHTML={{ __html: block.content }}
            placeholder={
              block.type === 'h1' ? 'Chapitre...' :
              block.type === 'h2' ? 'Section...' :
              block.type === 'h3' ? 'Sous-section...' :
              'Tapez "/" pour les commandes ou commencez à écrire...'
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="notion-editor-container">
      {/* Conteneur principal sans header superflu */}
      <div className="notion-editor bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Barre d'info simple */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📝 Carte de {subjectName || 'la matière'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>💾 Sauvegardé {lastSaved.toLocaleTimeString()}</span>
            <span>•</span>
            <span>Tapez "/" pour les commandes</span>
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          {blocks.length === 0 ? (
            <div
              className="text-gray-400 cursor-text p-2"
              onClick={() => {
                const newId = createBlock(null, 'text');
                setTimeout(() => {
                  const el = document.querySelector(`[data-block-id="${newId}"]`);
                  if (el) el.focus();
                }, 50);
              }}
            >
              Cliquez ici pour commencer à écrire ou tapez "/" pour les commandes...
            </div>
          ) : (
            <div className="space-y-0">
              {blocks.map((block, index) => renderBlock(block, index))}
            </div>
          )}
        </div>

        {/* Menu slash */}
        {showSlashMenu && (
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[250px] max-h-[400px] overflow-y-auto"
            style={{
              top: `${slashMenuPosition.top}px`,
              left: `${slashMenuPosition.left}px`
            }}
          >
            <div className="text-xs text-gray-500 px-2 py-1 font-semibold uppercase tracking-wider">
              Blocs disponibles
            </div>
            {blockTypes.map(type => (
              <button
                key={type.type}
                onClick={() => selectFromSlashMenu(type.type)}
                onMouseDown={(e) => e.preventDefault()} // Empêche la perte de focus
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded text-sm text-left transition-colors"
              >
                <span className="w-8 text-center text-gray-600 font-mono">{type.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
                {type.shortcut && (
                  <span className="text-xs text-gray-400 font-mono">{type.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Aide contextuelle */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-start gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Tab</kbd>
              <span>Indenter</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Shift+Tab</kbd>
              <span>Désindenter</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">#</kbd>
              <span>Titre</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">[]</kbd>
              <span>Case</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600">→📋</span>
              <span>Envoyer au Kanban</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionEditor;