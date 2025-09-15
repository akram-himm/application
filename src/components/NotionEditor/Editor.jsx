import React, { useState, useRef, useEffect } from 'react';
import './EditorStyles.css';
import EditableBlock from './EditableBlock';
import SlashMenu from './SlashMenu';

const NotionEditor = () => {
  const [blocks, setBlocks] = useState([
    {
      id: '1',
      type: 'text',
      content: '',
      properties: {},
      order: 0
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashMenuBlockId, setSlashMenuBlockId] = useState(null);
  const [draggedBlockId, setDraggedBlockId] = useState(null);

  // Créer un nouveau bloc
  const createNewBlock = (afterBlockId, type = 'text', content = '') => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content,
      properties: {},
      order: blocks.length
    };

    const blockIndex = blocks.findIndex(b => b.id === afterBlockId);
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    // Réorganiser les ordres
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    setBlocks(newBlocks);
    return newBlock.id;
  };

  // Mettre à jour un bloc
  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  // Supprimer un bloc
  const deleteBlock = (blockId) => {
    if (blocks.length === 1) {
      // Ne pas supprimer le dernier bloc, juste le vider
      updateBlock(blockId, { content: '', type: 'text' });
      return;
    }

    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);

    // Focus sur le bloc précédent après suppression
    if (blockIndex > 0) {
      const prevBlockId = blocks[blockIndex - 1].id;
      setTimeout(() => {
        const prevBlock = document.querySelector(`[data-block-id="${prevBlockId}"] [contenteditable]`);
        if (prevBlock) {
          prevBlock.focus();
          // Placer le curseur à la fin
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(prevBlock);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    }

    setBlocks(newBlocks);
  };

  // Transformer un bloc en un autre type
  const transformBlock = (blockId, newType) => {
    updateBlock(blockId, { type: newType });
    setShowSlashMenu(false);
  };

  // Gérer le slash menu
  const handleSlashCommand = (blockId, position) => {
    setSlashMenuBlockId(blockId);
    setSlashMenuPosition(position);
    setShowSlashMenu(true);
  };

  // Gérer la sélection d'une commande
  const handleCommandSelect = (command) => {
    if (slashMenuBlockId) {
      // Effacer le "/" du contenu
      const block = blocks.find(b => b.id === slashMenuBlockId);
      if (block && block.content.endsWith('/')) {
        updateBlock(slashMenuBlockId, {
          content: block.content.slice(0, -1)
        });
      }

      // Transformer le bloc
      transformBlock(slashMenuBlockId, command.type);
    }
    setShowSlashMenu(false);
  };

  // Gérer le drag & drop
  const handleDragStart = (blockId) => {
    setDraggedBlockId(blockId);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
  };

  const handleDragOver = (e, blockId) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === blockId) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex(b => b.id === blockId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    // Réorganiser les ordres
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    setBlocks(newBlocks);
  };

  // Auto-save (simple implementation)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      // Sauvegarder dans localStorage pour cet exemple
      localStorage.setItem('notion-editor-content', JSON.stringify(blocks));
      console.log('Auto-saved');
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [blocks]);

  // Charger le contenu sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem('notion-editor-content');
    if (saved) {
      try {
        const parsedBlocks = JSON.parse(saved);
        if (parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
        }
      } catch (e) {
        console.error('Failed to load saved content');
      }
    }
  }, []);

  return (
    <div className="notion-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="page-controls">
          <button className="icon-button">←</button>
          <div className="breadcrumb">Workspace / Projects / New Page</div>
        </div>
        <div className="page-actions">
          <button className="icon-button">⭐</button>
          <button className="icon-button">...</button>
          <button className="share-button">Share</button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="editor-body">
        <div className="editor-content">
          {/* Page Header */}
          <div className="page-header-section">
            <div className="page-icon-wrapper">
              <button className="page-icon">📄</button>
            </div>
            <h1
              className="page-title"
              contentEditable
              suppressContentEditableWarning
              placeholder="Untitled"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Créer le premier bloc si nécessaire
                  if (blocks.length === 0) {
                    const newBlockId = createNewBlock(null, 'text');
                    setTimeout(() => {
                      const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
                      if (newBlock) newBlock.focus();
                    }, 0);
                  } else {
                    // Focus sur le premier bloc
                    const firstBlock = document.querySelector('[data-block-id] [contenteditable]');
                    if (firstBlock) firstBlock.focus();
                  }
                }
              }}
            >
              Untitled
            </h1>
          </div>

          {/* Blocks Container */}
          <div className="blocks-container">
            {blocks.map((block, index) => (
              <EditableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => setSelectedBlockId(block.id)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onCreateNew={(type, content) => createNewBlock(block.id, type, content)}
                onSlashCommand={handleSlashCommand}
                onDragStart={() => handleDragStart(block.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, block.id)}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              />
            ))}

            {/* Ajouter un nouveau bloc si vide */}
            {blocks.length === 0 && (
              <div
                className="empty-editor-prompt"
                onClick={() => {
                  const newBlockId = createNewBlock(null, 'text');
                  setTimeout(() => {
                    const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
                    if (newBlock) newBlock.focus();
                  }, 0);
                }}
              >
                Click here or press '/' for commands
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slash Menu */}
      {showSlashMenu && (
        <SlashMenu
          position={slashMenuPosition}
          onSelect={handleCommandSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Save Indicator */}
      <div className="save-indicator">
        <span className="save-text">All changes saved</span>
      </div>
    </div>
  );
};

export default NotionEditor;