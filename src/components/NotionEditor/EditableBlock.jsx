import React, { useRef, useEffect, useState } from 'react';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import BulletListBlock from './blocks/BulletListBlock';
import NumberedListBlock from './blocks/NumberedListBlock';
import TodoBlock from './blocks/TodoBlock';
import ToggleBlock from './blocks/ToggleBlock';
import QuoteBlock from './blocks/QuoteBlock';
import CalloutBlock from './blocks/CalloutBlock';
import DividerBlock from './blocks/DividerBlock';
import CodeBlock from './blocks/CodeBlock';

const EditableBlock = ({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onCreateNew,
  onSlashCommand,
  onDragStart,
  onDragEnd,
  onDragOver,
  isFirst,
  isLast
}) => {
  const [showHandle, setShowHandle] = useState(false);
  const blockRef = useRef(null);

  // Mapper le type de bloc au composant correspondant
  const renderBlockContent = () => {
    const commonProps = {
      content: block.content,
      properties: block.properties,
      onChange: (content) => onUpdate({ content }),
      onDelete,
      onCreateNew,
      onSlashCommand: (position) => onSlashCommand(block.id, position),
      isSelected
    };

    switch (block.type) {
      case 'heading1':
        return <HeadingBlock {...commonProps} level={1} />;
      case 'heading2':
        return <HeadingBlock {...commonProps} level={2} />;
      case 'heading3':
        return <HeadingBlock {...commonProps} level={3} />;
      case 'bullet_list':
        return <BulletListBlock {...commonProps} />;
      case 'numbered_list':
        return <NumberedListBlock {...commonProps} index={block.order + 1} />;
      case 'todo':
        return (
          <TodoBlock
            {...commonProps}
            checked={block.properties?.checked || false}
            onToggle={(checked) => onUpdate({
              properties: { ...block.properties, checked }
            })}
          />
        );
      case 'toggle':
        return (
          <ToggleBlock
            {...commonProps}
            isOpen={block.properties?.isOpen || false}
            onToggle={(isOpen) => onUpdate({
              properties: { ...block.properties, isOpen }
            })}
          />
        );
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'callout':
        return (
          <CalloutBlock
            {...commonProps}
            icon={block.properties?.icon || '💡'}
            onIconChange={(icon) => onUpdate({
              properties: { ...block.properties, icon }
            })}
          />
        );
      case 'divider':
        return <DividerBlock />;
      case 'code':
        return (
          <CodeBlock
            {...commonProps}
            language={block.properties?.language || 'javascript'}
            onLanguageChange={(language) => onUpdate({
              properties: { ...block.properties, language }
            })}
          />
        );
      case 'text':
      default:
        return <TextBlock {...commonProps} />;
    }
  };

  // Gérer les raccourcis clavier markdown
  const handleMarkdownShortcuts = (text) => {
    const shortcuts = {
      '#': 'heading1',
      '##': 'heading2',
      '###': 'heading3',
      '-': 'bullet_list',
      '*': 'bullet_list',
      '1.': 'numbered_list',
      '[]': 'todo',
      '>': 'toggle',
      '"': 'quote',
      '---': 'divider'
    };

    for (const [shortcut, type] of Object.entries(shortcuts)) {
      if (text === shortcut || (text === shortcut + ' ')) {
        onUpdate({ type, content: '' });
        return true;
      }
    }
    return false;
  };

  return (
    <div
      ref={blockRef}
      className={`block-wrapper ${isSelected ? 'selected' : ''} ${showHandle ? 'show-handle' : ''}`}
      data-block-id={block.id}
      onMouseEnter={() => setShowHandle(true)}
      onMouseLeave={() => setShowHandle(false)}
      onClick={onSelect}
      onDragOver={onDragOver}
    >
      {/* Block Handle */}
      <div className="block-handle">
        <button
          className="drag-handle"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          title="Drag to move"
        >
          ⋮⋮
        </button>
        <button
          className="add-block"
          onClick={(e) => {
            e.stopPropagation();
            const newBlockId = onCreateNew('text', '');
            setTimeout(() => {
              const newBlock = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`);
              if (newBlock) newBlock.focus();
            }, 0);
          }}
          title="Add block below"
        >
          +
        </button>
      </div>

      {/* Block Content */}
      <div className="block-content">
        {renderBlockContent()}
      </div>
    </div>
  );
};

export default EditableBlock;