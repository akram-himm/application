// Fichier: src/components/NotionEditor/Editor.jsx
// REMPLACER COMPLÈTEMENT le fichier existant

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EditorStyles.css';

const NotionEditor = ({ subjectId, radarId, subjectName, onSave, onAddToKanban }) => {
  // État initial avec un bloc vide
  const [blocks, setBlocks] = useState([
    {
      id: 'initial-block',
      type: 'text',
      content: '',
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

  // Références pour gérer le focus
  const blockRefs = useRef({});

  // Types de blocs disponibles
  const blockTypes = [
    { type: 'h1', label: 'Titre 1', icon: 'H1', shortcut: '# ' },
    { type: 'h2', label: 'Titre 2', icon: 'H2', shortcut: '## ' },
    { type: 'h3', label: 'Titre 3', icon: 'H3', shortcut: '### ' },
    { type: 'text', label: 'Texte', icon: 'T', shortcut: '' },
    { type: 'bullet', label: 'Liste à puces', icon: '•', shortcut: '- ' },
    { type: 'numbered', label: 'Liste numérotée', icon: '1.', shortcut: '1. ' },
    { type: 'todo', label: 'Case à cocher', icon: '☐', shortcut: '[] ' },
    { type: 'divider', label: 'Séparateur', icon: '—', shortcut: '---' },
    { type: 'code', label: 'Code', icon: '</>', shortcut: '```' },
    { type: 'quote', label: 'Citation', icon: '"', shortcut: '> ' }
  ];

  // Charger les données sauvegardées
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
        console.error('Erreur de chargement:', e);
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
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [blocks, subjectId, radarId, onSave]);

  // Créer un nouveau bloc
  const createBlock = (afterId, type = 'text', content = '', indent = 0) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      indent: Math.min(indent, 5),
      collapsed: false,
      checked: false
    };

    const index = afterId ? blocks.findIndex(b => b.id === afterId) : -1;
    const newBlocks = [...blocks];

    if (index === -1) {
      newBlocks.push(newBlock);
    } else {
      newBlocks.splice(index + 1, 0, newBlock);
    }

    setBlocks(newBlocks);

    // Focus sur le nouveau bloc après création
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id];
      if (el) {
        el.focus();
        // Placer le curseur au début
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 100);

    return newBlock.id;
  };

  // Mettre à jour un bloc
  const updateBlock = useCallback((id, updates) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, []);

  // Supprimer un bloc
  const deleteBlock = (id) => {
    if (blocks.length > 1) {
      const index = blocks.findIndex(b => b.id === id);
      const newBlocks = blocks.filter(b => b.id !== id);
      setBlocks(newBlocks);

      // Focus sur le bloc précédent après suppression
      if (index > 0 && newBlocks[index - 1]) {
        setTimeout(() => {
          const prevBlockId = newBlocks[index - 1].id;
          const el = blockRefs.current[prevBlockId];
          if (el) {
            el.focus();
            // Placer le curseur à la fin
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }, 50);
      }
    }
  };

  // Gérer les raccourcis clavier
  const handleKeyDown = (e, blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Enter - créer nouveau bloc
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const currentEl = blockRefs.current[blockId];

      // Récupérer le texte avant et après le curseur
      const fullText = currentEl.textContent || '';
      const beforeCursor = fullText.substring(0, range.startOffset);
      const afterCursor = fullText.substring(range.startOffset);

      // Mettre à jour le bloc actuel avec le texte avant le curseur
      updateBlock(blockId, { content: beforeCursor });

      // Créer un nouveau bloc avec le texte après le curseur
      const newBlockId = createBlock(blockId, 'text', afterCursor, block.indent);
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

    // Backspace sur bloc vide
    if (e.key === 'Backspace') {
      const el = blockRefs.current[blockId];
      if (el && el.textContent === '') {
        e.preventDefault();

        // Si c'est un bloc spécial, le convertir en texte
        if (block.type !== 'text') {
          updateBlock(blockId, { type: 'text' });
        } else if (blocks.length > 1) {
          // Sinon supprimer le bloc
          deleteBlock(blockId);
        }
      }
    }

    // Flèches pour naviguer
    if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Si on est au début du bloc
      if (range.startOffset === 0) {
        e.preventDefault();
        const index = blocks.findIndex(b => b.id === blockId);
        if (index > 0) {
          const prevBlock = blocks[index - 1];
          const el = blockRefs.current[prevBlock.id];
          if (el) {
            el.focus();
            // Placer le curseur à la fin
            const newRange = document.createRange();
            newRange.selectNodeContents(el);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }

    if (e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const el = blockRefs.current[blockId];

      // Si on est à la fin du bloc
      if (el && selection.focusOffset === el.textContent.length) {
        e.preventDefault();
        const index = blocks.findIndex(b => b.id === blockId);
        if (index < blocks.length - 1) {
          const nextBlock = blocks[index + 1];
          const nextEl = blockRefs.current[nextBlock.id];
          if (nextEl) {
            nextEl.focus();
            // Placer le curseur au début
            const newRange = document.createRange();
            newRange.selectNodeContents(nextEl);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }
  };

  // Gérer le changement de contenu
  const handleInput = (e, blockId) => {
    const text = e.target.textContent || '';
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Détecter le slash menu
    if (text === '/') {
      const rect = e.target.getBoundingClientRect();
      setSlashMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
      setShowSlashMenu(true);
      setSlashMenuBlockId(blockId);
      return;
    }

    // Fermer le slash menu
    if (showSlashMenu && !text.startsWith('/')) {
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
      '> ': 'quote',
      '```': 'code'
    };

    // Vérifier les raccourcis
    for (const [shortcut, type] of Object.entries(shortcuts)) {
      if (text === shortcut || (text.startsWith(shortcut) && block.type === 'text')) {
        e.preventDefault();
        const newContent = text.replace(shortcut, '').trim();
        updateBlock(blockId, { type, content: newContent });

        // Vider le contenu et refocus
        e.target.textContent = newContent;

        // Replacer le curseur
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(e.target);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }

    // Ligne de séparation
    if (text === '---' && block.type === 'text') {
      e.preventDefault();
      updateBlock(blockId, { type: 'divider', content: '' });
      e.target.textContent = '';
      // Créer un nouveau bloc après
      createBlock(blockId);
      return;
    }

    // Mettre à jour le contenu normal
    updateBlock(blockId, { content: text });
  };

  // Sélectionner depuis le slash menu
  const selectFromSlashMenu = (type) => {
    if (slashMenuBlockId) {
      updateBlock(slashMenuBlockId, { type, content: '' });
      const el = blockRefs.current[slashMenuBlockId];
      if (el) {
        el.textContent = '';
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

    // Collecter les enfants
    for (let i = blockIndex + 1; i < blocks.length; i++) {
      if (blocks[i].indent > block.indent) {
        children.push(blocks[i]);
      } else {
        break;
      }
    }

    onAddToKanban({
      id: `task-${Date.now()}`,
      title: block.content || 'Nouvelle tâche',
      description: children.map(c => c.content).join('\n'),
      type: block.type,
      status: 'todo'
    });

    // Feedback visuel
    const el = blockRefs.current[block.id];
    if (el) {
      el.style.backgroundColor = '#10B981';
      el.style.color = 'white';
      setTimeout(() => {
        el.style.backgroundColor = '';
        el.style.color = '';
      }, 300);
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
    newBlocks.splice(targetIndex, 0, draggedBlock);

    setBlocks(newBlocks);
    setDraggedBlockId(null);
  };

  // Rendu d'un bloc
  const renderBlock = (block, index) => {
    if (block.type === 'divider') {
      return (
        <div
          key={block.id}
          className="notion-block-divider"
          style={{ marginLeft: `${block.indent * 40}px` }}
        >
          <div className="divider-line" />
        </div>
      );
    }

    return (
      <div
        key={block.id}
        className={`notion-block group ${selectedBlockId === block.id ? 'selected' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, block.id)}
        onClick={() => setSelectedBlockId(block.id)}
        style={{ paddingLeft: `${block.indent * 40}px` }}
      >
        {/* Poignée de drag (visible au hover) */}
        <div className="block-handle">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="2" cy="2" r="1" />
            <circle cx="2" cy="5" r="1" />
            <circle cx="2" cy="8" r="1" />
            <circle cx="5" cy="2" r="1" />
            <circle cx="5" cy="5" r="1" />
            <circle cx="5" cy="8" r="1" />
          </svg>
        </div>

        {/* Actions (visible au hover) */}
        <div className="block-actions">
          {(block.type === 'h1' || block.type === 'h2' || block.type === 'h3') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendToKanban(block);
              }}
              className="action-btn kanban-btn"
              title="Ajouter au Kanban"
            >
              +📋
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newType = createBlock(block.id);
            }}
            className="action-btn add-btn"
            title="Ajouter un bloc"
          >
            +
          </button>
        </div>

        {/* Préfixes */}
        {block.type === 'todo' && (
          <input
            type="checkbox"
            checked={block.checked || false}
            onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
            className="todo-checkbox"
          />
        )}

        {block.type === 'bullet' && (
          <span className="list-marker">•</span>
        )}

        {block.type === 'numbered' && (
          <span className="list-marker">{index + 1}.</span>
        )}

        {/* Zone de contenu éditable */}
        <div
          ref={el => blockRefs.current[block.id] = el}
          contentEditable
          suppressContentEditableWarning
          className={`block-content block-${block.type} ${block.checked ? 'checked' : ''}`}
          onKeyDown={(e) => handleKeyDown(e, block.id)}
          onInput={(e) => handleInput(e, block.id)}
          placeholder={
            block.type === 'h1' ? 'Titre 1' :
            block.type === 'h2' ? 'Titre 2' :
            block.type === 'h3' ? 'Titre 3' :
            'Tapez "/" pour les commandes'
          }
        >
          {block.content}
        </div>
      </div>
    );
  };

  // Synchroniser le contenu des blocs avec le DOM
  useEffect(() => {
    blocks.forEach(block => {
      const el = blockRefs.current[block.id];
      if (el && el.textContent !== block.content) {
        // Sauvegarder la position du curseur
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const startOffset = range && range.startContainer === el.firstChild ? range.startOffset : -1;

        // Mettre à jour le contenu
        el.textContent = block.content;

        // Restaurer la position du curseur si l'élément avait le focus
        if (document.activeElement === el && startOffset !== -1) {
          const newRange = document.createRange();
          if (el.firstChild) {
            newRange.setStart(el.firstChild, Math.min(startOffset, block.content.length));
            newRange.setEnd(el.firstChild, Math.min(startOffset, block.content.length));
          } else {
            newRange.selectNodeContents(el);
            newRange.collapse(true);
          }
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    });
  }, [blocks]);

  return (
    <div className="notion-editor-page">
      {/* Barre d'outils simple (optionnelle) */}
      <div className="notion-toolbar">
        <div className="toolbar-info">
          <span className="page-title">{subjectName || 'Sans titre'}</span>
          <span className="save-status">Sauvegardé {lastSaved.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Zone de contenu principale - comme une vraie page */}
      <div className="notion-page-content">
        {blocks.length === 0 ? (
          // Si aucun bloc, créer un bloc initial
          <div
            className="empty-page-prompt"
            onClick={() => createBlock(null, 'text')}
          >
            Cliquez ici pour commencer à écrire ou tapez "/" pour les commandes...
          </div>
        ) : (
          // Afficher tous les blocs
          blocks.map((block, index) => renderBlock(block, index))
        )}

        {/* Zone cliquable en bas pour ajouter un nouveau bloc */}
        <div
          className="add-block-area"
          onClick={() => {
            if (blocks.length > 0) {
              createBlock(blocks[blocks.length - 1].id, 'text');
            } else {
              createBlock(null, 'text');
            }
          }}
        >
          <span className="add-hint">Cliquez pour ajouter un bloc...</span>
        </div>
      </div>

      {/* Menu slash */}
      {showSlashMenu && (
        <div
          className="notion-slash-menu"
          style={{
            top: `${slashMenuPosition.top}px`,
            left: `${slashMenuPosition.left}px`
          }}
        >
          <div className="slash-menu-header">BLOCS DE BASE</div>
          {blockTypes.map(type => (
            <button
              key={type.type}
              onClick={() => selectFromSlashMenu(type.type)}
              onMouseDown={(e) => e.preventDefault()}
              className="slash-menu-item"
            >
              <span className="menu-icon">{type.icon}</span>
              <span className="menu-label">{type.label}</span>
              <span className="menu-shortcut">{type.shortcut}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotionEditor;