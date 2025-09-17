import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import NotionBlock from './NotionBlock';
import SlashMenu from './SlashMenu';
import { savePageContent } from '../../services/pageService';

const NotionEditor = ({ pageId, initialBlocks = [], readOnly = false }) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashMenuBlockId, setSlashMenuBlockId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save avec debounce
  useEffect(() => {
    if (readOnly) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      const success = savePageContent(pageId, blocks);
      setSaveStatus(success ? 'saved' : 'error');
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, pageId, readOnly]);

  // Créer un nouveau bloc
  const createBlock = (type = 'text', content = '', properties = {}) => ({
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    properties
  });

  // Ajouter un bloc
  const addBlock = useCallback((afterBlockId = null, type = 'text', content = '', properties = {}) => {
    const newBlock = createBlock(type, content, properties);

    setBlocks(prevBlocks => {
      if (!afterBlockId) {
        return [...prevBlocks, newBlock];
      }

      const index = prevBlocks.findIndex(b => b.id === afterBlockId);
      if (index === -1) {
        return [...prevBlocks, newBlock];
      }

      const newBlocks = [...prevBlocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });

    // Focus sur le nouveau bloc
    setTimeout(() => {
      setFocusedBlockId(newBlock.id);
    }, 50);

    return newBlock.id;
  }, []);

  // Mettre à jour un bloc
  const updateBlock = useCallback((blockId, updates) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, []);

  // Supprimer un bloc
  const deleteBlock = useCallback((blockId) => {
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(b => b.id === blockId);
      if (index === -1) return prevBlocks;

      const newBlocks = prevBlocks.filter(b => b.id !== blockId);

      // Si on a supprimé le dernier bloc, ajouter un bloc vide
      if (newBlocks.length === 0) {
        return [createBlock()];
      }

      // Focus sur le bloc précédent ou suivant
      if (index > 0) {
        setTimeout(() => setFocusedBlockId(prevBlocks[index - 1].id), 50);
      } else if (index < prevBlocks.length - 1) {
        setTimeout(() => setFocusedBlockId(prevBlocks[index + 1].id), 50);
      }

      return newBlocks;
    });
  }, []);

  // Dupliquer un bloc
  const duplicateBlock = useCallback((blockId) => {
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(b => b.id === blockId);
      if (index === -1) return prevBlocks;

      const blockToDuplicate = prevBlocks[index];
      const newBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const newBlocks = [...prevBlocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
  }, []);

  // Transformer un bloc en un autre type
  const transformBlock = useCallback((blockId, newType, additionalProperties = {}) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              type: newType,
              properties: { ...block.properties, ...additionalProperties }
            }
          : block
      )
    );
  }, []);

  // Gérer le slash menu
  const handleSlashCommand = useCallback((blockId, show, position = null) => {
    setShowSlashMenu(show);
    setSlashMenuBlockId(blockId);
    if (position) {
      setSlashMenuPosition(position);
    }
  }, []);

  // Sélectionner une commande du slash menu
  const handleSlashMenuSelect = useCallback((command) => {
    if (slashMenuBlockId) {
      transformBlock(slashMenuBlockId, command.type, command.properties || {});

      // Si c'est une commande qui nécessite un contenu par défaut
      if (command.defaultContent) {
        updateBlock(slashMenuBlockId, { content: command.defaultContent });
      }
    }
    setShowSlashMenu(false);
  }, [slashMenuBlockId, transformBlock, updateBlock]);

  // Gérer le déplacement de focus entre blocs
  const moveFocus = useCallback((currentBlockId, direction) => {
    const currentIndex = blocks.findIndex(b => b.id === currentBlockId);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(blocks.length - 1, currentIndex + 1);
    }

    if (newIndex !== currentIndex) {
      setFocusedBlockId(blocks[newIndex].id);
    }
  }, [blocks]);

  // Gérer le drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Ajouter un premier bloc si vide
  useEffect(() => {
    if (blocks.length === 0) {
      addBlock(null, 'text', '');
    }
  }, []);

  if (readOnly) {
    return (
      <div className="notion-editor-readonly max-w-4xl mx-auto p-6">
        {blocks.map(block => (
          <NotionBlock
            key={block.id}
            block={block}
            readOnly={true}
            onUpdate={() => {}}
            onDelete={() => {}}
            onAddBlock={() => {}}
            onTransform={() => {}}
            onDuplicate={() => {}}
            onMoveFocus={() => {}}
            onSlashCommand={() => {}}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={editorRef} className="notion-editor min-h-screen bg-white">
      {/* Status de sauvegarde */}
      <div className="fixed top-4 right-4 text-sm text-gray-500 z-10">
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Enregistrement...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Enregistré
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="flex items-center gap-2 text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Erreur de sauvegarde
          </span>
        )}
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto p-6 pb-32">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, index) => (
              <NotionBlock
                key={block.id}
                block={block}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                isFocused={focusedBlockId === block.id}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onAddBlock={addBlock}
                onTransform={transformBlock}
                onDuplicate={duplicateBlock}
                onMoveFocus={moveFocus}
                onSlashCommand={handleSlashCommand}
                onFocus={() => setFocusedBlockId(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Bouton pour ajouter un bloc à la fin */}
        {blocks.length > 0 && (
          <button
            className="mt-4 px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 group"
            onClick={() => addBlock(blocks[blocks.length - 1].id)}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              + Ajouter un bloc
            </span>
          </button>
        )}
      </div>

      {/* Slash Menu */}
      {showSlashMenu && (
        <SlashMenu
          position={slashMenuPosition}
          onSelect={handleSlashMenuSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
};

export default NotionEditor;