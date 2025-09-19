import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ContentEditable from './ContentEditable';
import BlockMenu from './BlockMenu';

// Placeholders selon le type de bloc
const PLACEHOLDERS = {
  text: "Tapez '/' pour les commandes ou commencez à écrire...",
  heading1: "Titre 1",
  heading2: "Titre 2",
  heading3: "Titre 3",
  bullet: "Liste à puces",
  numbered: "Liste numérotée",
  todo: "Tâche à faire",
  toggle: "Liste déroulante",
  quote: "Citation",
  callout: "Message important",
  code: "// Tapez votre code ici"
};

// Styles selon le type de bloc
const BLOCK_STYLES = {
  text: "text-gray-900",
  heading1: "text-3xl font-bold text-gray-900",
  heading2: "text-2xl font-semibold text-gray-900",
  heading3: "text-xl font-medium text-gray-900",
  bullet: "text-gray-900",
  numbered: "text-gray-900",
  todo: "text-gray-900",
  toggle: "text-gray-900 font-medium",
  quote: "text-gray-700 italic border-l-4 border-gray-300 pl-4",
  callout: "text-gray-900",
  code: "font-mono text-sm bg-gray-50 p-3 rounded text-gray-900"
};

const NotionBlock = ({
  block,
  isFirst,
  isLast,
  isFocused,
  readOnly,
  onUpdate,
  onDelete,
  onAddBlock,
  onTransform,
  onDuplicate,
  onMoveFocus,
  onSlashCommand,
  onFocus
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(block.properties?.isOpen ?? true);
  const blockRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Gérer les raccourcis clavier
  const handleKeyDown = useCallback((e) => {
    if (readOnly) return;

    // Enter - Créer un nouveau bloc
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Si on est dans un heading et le contenu est vide, transformer en texte
      if (block.type.startsWith('heading') && !block.content) {
        onTransform(block.id, 'text');
        return;
      }

      // Pour les listes, créer un nouveau bloc du même type
      if (['bullet', 'numbered', 'todo'].includes(block.type)) {
        onAddBlock(block.id, block.type, '');
      } else {
        onAddBlock(block.id, 'text', '');
      }
      return;
    }

    // Backspace sur bloc vide - Supprimer ou transformer
    if (e.key === 'Backspace' && !block.content) {
      e.preventDefault();

      // Si c'est un bloc spécial, d'abord transformer en texte
      if (block.type !== 'text') {
        onTransform(block.id, 'text');
        return;
      }

      // Sinon supprimer le bloc (sauf si c'est le premier)
      if (!isFirst) {
        onDelete(block.id);
      }
      return;
    }

    // Tab/Shift+Tab - Indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentIndent = block.properties?.indent || 0;
      const newIndent = e.shiftKey
        ? Math.max(0, currentIndent - 1)
        : Math.min(5, currentIndent + 1);

      onUpdate(block.id, {
        properties: { ...block.properties, indent: newIndent }
      });
      return;
    }

    // Flèches pour naviguer entre blocs
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      onMoveFocus(block.id, 'up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      onMoveFocus(block.id, 'down');
    }

    // Ctrl+D - Dupliquer
    if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      onDuplicate(block.id);
    }

    // / pour ouvrir le slash menu
    if (e.key === '/' && !block.content) {
      e.preventDefault();
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        onSlashCommand(block.id, true, {
          x: rect.left,
          y: rect.bottom
        });
      }
    }
  }, [block, isFirst, readOnly, onUpdate, onDelete, onAddBlock, onTransform, onDuplicate, onMoveFocus, onSlashCommand]);

  // Gérer le changement de contenu
  const handleContentChange = useCallback((newContent) => {
    // Détection automatique de transformation (markdown shortcuts)
    if (!block.content && newContent) {
      // # → Heading 1
      if (newContent === '# ') {
        onTransform(block.id, 'heading1');
        onUpdate(block.id, { content: '' });
        return;
      }
      // ## → Heading 2
      if (newContent === '## ') {
        onTransform(block.id, 'heading2');
        onUpdate(block.id, { content: '' });
        return;
      }
      // ### → Heading 3
      if (newContent === '### ') {
        onTransform(block.id, 'heading3');
        onUpdate(block.id, { content: '' });
        return;
      }
      // - ou * → Bullet list
      if (newContent === '- ' || newContent === '* ') {
        onTransform(block.id, 'bullet');
        onUpdate(block.id, { content: '' });
        return;
      }
      // 1. → Numbered list
      if (newContent.match(/^\d+\.\s$/)) {
        onTransform(block.id, 'numbered');
        onUpdate(block.id, { content: '' });
        return;
      }
      // [] → Todo
      if (newContent === '[] ' || newContent === '[ ] ') {
        onTransform(block.id, 'todo');
        onUpdate(block.id, { content: '' });
        return;
      }
      // > → Quote
      if (newContent === '> ') {
        onTransform(block.id, 'quote');
        onUpdate(block.id, { content: '' });
        return;
      }
    }

    onUpdate(block.id, { content: newContent });
  }, [block.id, block.content, onTransform, onUpdate]);

  // Toggle pour les blocs expandables
  const handleToggleExpand = () => {
    if (block.type === 'toggle') {
      setIsExpanded(!isExpanded);
      onUpdate(block.id, {
        properties: { ...block.properties, isOpen: !isExpanded }
      });
    }
  };

  // Gérer la checkbox pour les todos
  const handleTodoToggle = () => {
    onUpdate(block.id, {
      properties: {
        ...block.properties,
        checked: !block.properties?.checked
      }
    });
  };

  // Calculer l'indentation
  const indent = block.properties?.indent || 0;
  const indentStyle = { paddingLeft: `${indent * 24}px` };

  // Rendu du contenu principal du bloc
  const renderBlockContent = () => {
    switch (block.type) {
      case 'divider':
        return <hr className="my-4 border-gray-200" />;

      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.properties?.checked || false}
              onChange={handleTodoToggle}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={readOnly}
            />
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[block.type]}
              readOnly={readOnly}
              focused={isFocused}
              className={`flex-1 ${block.properties?.checked ? 'line-through text-gray-400' : BLOCK_STYLES[block.type]}`}
            />
          </div>
        );

      case 'toggle':
        return (
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleExpand}
                className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                disabled={readOnly}
              >
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 10l4 4 4-4H6z" />
                </svg>
              </button>
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[block.type]}
                readOnly={readOnly}
                focused={isFocused}
                className={BLOCK_STYLES[block.type]}
              />
            </div>
            {isExpanded && block.children && (
              <div className="ml-6 mt-2">
                {/* Ici on rendrait les blocs enfants */}
                <div className="text-gray-500 text-sm">Blocs enfants...</div>
              </div>
            )}
          </>
        );

      case 'callout':
        const emoji = block.properties?.emoji || '💡';
        const bgColor = block.properties?.color || 'blue';
        const bgClasses = {
          blue: 'bg-blue-50 border-blue-200',
          yellow: 'bg-yellow-50 border-yellow-200',
          red: 'bg-red-50 border-red-200',
          green: 'bg-green-50 border-green-200',
          gray: 'bg-gray-50 border-gray-200'
        };
        return (
          <div className={`flex gap-3 p-3 rounded-lg border ${bgClasses[bgColor] || bgClasses.gray}`}>
            <span className="text-2xl select-none">{emoji}</span>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[block.type]}
              readOnly={readOnly}
              focused={isFocused}
              className={`flex-1 ${BLOCK_STYLES[block.type]}`}
            />
          </div>
        );

      case 'bullet':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 select-none mt-0.5">•</span>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[block.type]}
              readOnly={readOnly}
              focused={isFocused}
              className={`flex-1 ${BLOCK_STYLES[block.type]}`}
            />
          </div>
        );

      case 'numbered':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 select-none mt-0.5">1.</span>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[block.type]}
              readOnly={readOnly}
              focused={isFocused}
              className={`flex-1 ${BLOCK_STYLES[block.type]}`}
            />
          </div>
        );

      default:
        return (
          <ContentEditable
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDERS[block.type] || PLACEHOLDERS.text}
            readOnly={readOnly}
            focused={isFocused}
            isCode={block.type === 'code'}
            className={BLOCK_STYLES[block.type] || BLOCK_STYLES.text}
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...indentStyle }}
      {...attributes}
      className={`group relative ${block.type === 'divider' ? 'my-2' : 'mb-1'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={blockRef}
        className="flex items-start gap-2"
        onClick={() => !readOnly && onFocus()}
      >
        {/* Handle de drag - Visible au hover */}
        {!readOnly && isHovered && (
          <div
            {...listeners}
            className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            </svg>
          </div>
        )}

        {/* Bouton menu à 3 points - Visible au hover */}
        {!readOnly && isHovered && (
          <div className="absolute -left-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBlockMenu(!showBlockMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Menu du bloc"
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            {/* Menu du bloc - Affiché uniquement si showBlockMenu est true */}
            {showBlockMenu && (
              <BlockMenu
                blockId={block.id}
                blockType={block.type}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onTransform={onTransform}
                onClose={() => setShowBlockMenu(false)}
              />
            )}
          </div>
        )}

        {/* Contenu du bloc */}
        <div className="flex-1 min-w-0">
          {renderBlockContent()}
        </div>
      </div>
    </div>
  );
};

export default NotionBlock;