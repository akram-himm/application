import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ContentEditable from './ContentEditable';
import BlockMenu from './BlockMenu';

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
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

      onAddBlock(block.id, 'text', '');
      return;
    }

    // Backspace sur bloc vide - Supprimer ou transformer
    if (e.key === 'Backspace' && !block.content) {
      e.preventDefault();

      // Si c'est un heading, d'abord transformer en texte
      if (block.type !== 'text') {
        onTransform(block.id, 'text');
        return;
      }

      // Sinon supprimer le bloc
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
        : Math.min(3, currentIndent + 1);

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
    // Détection automatique de transformation
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
      // - → Bullet list
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
      // [] ou [ ] → Todo
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
  }, [block, onUpdate, onTransform]);

  // Rendu du contenu selon le type
  const renderContent = () => {
    const indent = block.properties?.indent || 0;
    const indentClass = indent > 0 ? `ml-${indent * 8}` : '';

    switch (block.type) {
      case 'heading1':
        return (
          <h1 className={`text-3xl font-bold text-gray-900 ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Titre 1"
              readOnly={readOnly}
              focused={isFocused}
            />
          </h1>
        );

      case 'heading2':
        return (
          <h2 className={`text-2xl font-bold text-gray-800 ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Titre 2"
              readOnly={readOnly}
              focused={isFocused}
            />
          </h2>
        );

      case 'heading3':
        return (
          <h3 className={`text-xl font-semibold text-gray-700 ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Titre 3"
              readOnly={readOnly}
              focused={isFocused}
            />
          </h3>
        );

      case 'bullet':
        return (
          <div className={`flex items-start gap-2 ${indentClass}`}>
            <span className="text-gray-400 mt-1">•</span>
            <div className="flex-1">
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Liste"
                readOnly={readOnly}
                focused={isFocused}
              />
            </div>
          </div>
        );

      case 'numbered':
        return (
          <div className={`flex items-start gap-2 ${indentClass}`}>
            <span className="text-gray-400 mt-1">{block.properties?.number || 1}.</span>
            <div className="flex-1">
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Liste numérotée"
                readOnly={readOnly}
                focused={isFocused}
              />
            </div>
          </div>
        );

      case 'todo':
        return (
          <div className={`flex items-start gap-2 ${indentClass}`}>
            <input
              type="checkbox"
              checked={block.properties?.checked || false}
              onChange={(e) => onUpdate(block.id, {
                properties: { ...block.properties, checked: e.target.checked }
              })}
              className="mt-1 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              disabled={readOnly}
            />
            <div className={`flex-1 ${block.properties?.checked ? 'line-through text-gray-400' : ''}`}>
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Tâche"
                readOnly={readOnly}
                focused={isFocused}
              />
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className={`border-l-3 border-gray-300 pl-4 italic text-gray-600 ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Citation"
              readOnly={readOnly}
              focused={isFocused}
            />
          </div>
        );

      case 'divider':
        return <hr className="my-4 border-gray-200" />;

      case 'code':
        return (
          <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="// Code"
              readOnly={readOnly}
              focused={isFocused}
              isCode={true}
            />
          </pre>
        );

      case 'callout':
        return (
          <div className={`p-4 rounded-lg flex gap-3 ${
            block.properties?.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            block.properties?.type === 'error' ? 'bg-red-50 border border-red-200' :
            block.properties?.type === 'success' ? 'bg-green-50 border border-green-200' :
            'bg-blue-50 border border-blue-200'
          } ${indentClass}`}>
            <span className="text-2xl">
              {block.properties?.emoji || '💡'}
            </span>
            <div className="flex-1">
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Callout"
                readOnly={readOnly}
                focused={isFocused}
              />
            </div>
          </div>
        );

      case 'toggle':
        return (
          <details className={`group ${indentClass}`}>
            <summary className="flex items-center gap-2 cursor-pointer select-none">
              <svg
                className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <ContentEditable
                value={block.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Toggle"
                readOnly={readOnly}
                focused={isFocused}
              />
            </summary>
            <div className="ml-6 mt-2">
              {block.properties?.children && (
                <div className="text-gray-600">
                  {block.properties.children}
                </div>
              )}
            </div>
          </details>
        );

      default: // text
        return (
          <div className={`text-gray-900 ${indentClass}`}>
            <ContentEditable
              value={block.content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Tapez '/' pour les commandes"
              readOnly={readOnly}
              focused={isFocused}
            />
          </div>
        );
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        blockRef.current = node;
      }}
      style={style}
      {...attributes}
      className={`notion-block relative group ${isDragging ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onFocus}
    >
      {/* Poignée de drag et menu */}
      {!readOnly && isHovered && (
        <div className="absolute -left-12 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Poignée de drag */}
          <div
            {...listeners}
            className="p-1 hover:bg-gray-100 rounded cursor-move"
          >
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
            </svg>
          </div>

          {/* Menu d'actions */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      )}

      {/* Menu contextuel */}
      {showMenu && !readOnly && (
        <BlockMenu
          blockId={block.id}
          blockType={block.type}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onTransform={onTransform}
          onClose={() => setShowMenu(false)}
        />
      )}

      {/* Contenu du bloc */}
      <div className="py-1">{renderContent()}</div>
    </div>
  );
};

export default NotionBlock;