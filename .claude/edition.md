# 📝 Spécifications Complètes - Éditeur de Page Style Notion

## 🎯 Vue d'Ensemble
L'éditeur Notion est un système de blocs modulaires où chaque élément (paragraphe, titre, liste, etc.) est un bloc indépendant et manipulable. Voici l'architecture complète pour recréer cette expérience.

## 🏗️ Architecture de l'Éditeur

### Concept Fondamental : Le Système de Blocs
```typescript
// Structure de base d'un bloc
interface Block {
  id: string;
  type: BlockType;
  content: string | any;
  properties: BlockProperties;
  children?: Block[];
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

type BlockType = 
  | 'text' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3'
  | 'bullet_list'
  | 'numbered_list'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'code'
  | 'image'
  | 'video'
  | 'bookmark'
  | 'equation'
  | 'table';

interface BlockProperties {
  textColor?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  checked?: boolean; // pour todo
  language?: string; // pour code blocks
  icon?: string; // pour callout
}
```

## 📐 Structure HTML de la Page

### Layout Principal de l'Éditeur
```html
<div class="notion-editor">
  <!-- Header avec contrôles -->
  <div class="editor-header">
    <div class="page-controls">
      <button class="icon-button">🔙</button>
      <div class="breadcrumb">Workspace / Projects / New Page</div>
    </div>
    <div class="page-actions">
      <button class="icon-button">⭐</button>
      <button class="icon-button">...</button>
      <button class="share-button">Share</button>
    </div>
  </div>

  <!-- Zone d'édition principale -->
  <div class="editor-body">
    <div class="editor-content">
      <!-- Cover Image (optionnel) -->
      <div class="page-cover" contenteditable="false">
        <img src="cover.jpg" />
        <button class="change-cover">Change cover</button>
      </div>

      <!-- Icon et Titre -->
      <div class="page-header-section">
        <div class="page-icon-wrapper">
          <button class="page-icon">📄</button>
        </div>
        <h1 class="page-title" contenteditable="true" placeholder="Untitled"></h1>
      </div>

      <!-- Zone des blocs -->
      <div class="blocks-container">
        <!-- Les blocs sont insérés ici dynamiquement -->
      </div>
    </div>
  </div>
</div>
```

## 🔧 Composant Block Détaillé

### Structure d'un Bloc Éditable
```jsx
const EditableBlock = ({ block, updateBlock, deleteBlock }) => {
  return (
    <div className="block-wrapper" data-block-id={block.id}>
      {/* Handle de manipulation (apparaît au hover) */}
      <div className="block-handle">
        <button className="drag-handle">⋮⋮</button>
        <button className="add-block">+</button>
      </div>

      {/* Contenu du bloc */}
      <div className="block-content">
        {renderBlockContent(block)}
      </div>

      {/* Menu slash (apparaît quand on tape /) */}
      {showSlashMenu && <SlashCommandMenu />}
    </div>
  );
};

// CSS pour les blocs
.block-wrapper {
  position: relative;
  margin: 2px 0;
  padding: 3px 0;
  min-height: 28px;
}

.block-wrapper:hover .block-handle {
  opacity: 1;
}

.block-handle {
  position: absolute;
  left: -44px;
  top: 2px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.drag-handle {
  width: 24px;
  height: 24px;
  cursor: grab;
  color: #a0a0a0;
}

.add-block {
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #a0a0a0;
}
```

## 📝 Types de Blocs et Leur Rendu

### 1. Bloc de Texte (Paragraphe)
```jsx
const TextBlock = ({ content, onChange }) => {
  return (
    <div 
      className="text-block"
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.textContent)}
      placeholder="Type '/' for commands"
    >
      {content}
    </div>
  );
};

// Style
.text-block {
  font-size: 16px;
  line-height: 1.5;
  color: #37352f;
  outline: none;
  min-height: 1em;
}

.text-block:empty:before {
  content: attr(placeholder);
  color: #e0e0e0;
}
```

### 2. Blocs de Titres (H1, H2, H3)
```jsx
const HeadingBlock = ({ level, content, onChange }) => {
  const Tag = `h${level}`;
  return (
    <Tag
      className={`heading-block heading-${level}`}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.textContent)}
      placeholder={`Heading ${level}`}
    >
      {content}
    </Tag>
  );
};

// Styles
.heading-1 {
  font-size: 32px;
  font-weight: 700;
  margin: 24px 0 8px;
}

.heading-2 {
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 6px;
}

.heading-3 {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 4px;
}
```

### 3. Bloc Liste à Puces
```jsx
const BulletListBlock = ({ content, onChange, indent = 0 }) => {
  return (
    <div className="bullet-list-block" style={{ paddingLeft: `${indent * 28}px` }}>
      <span className="bullet">•</span>
      <div
        className="list-content"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.textContent)}
      >
        {content}
      </div>
    </div>
  );
};

// Style
.bullet-list-block {
  display: flex;
  align-items: flex-start;
  margin: 2px 0;
}

.bullet {
  flex-shrink: 0;
  width: 24px;
  padding-right: 4px;
  color: #37352f;
}
```

### 4. Bloc To-Do (Case à cocher)
```jsx
const TodoBlock = ({ content, checked, onChange, onToggle }) => {
  return (
    <div className="todo-block">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={checked}
        onChange={onToggle}
      />
      <div
        className={`todo-content ${checked ? 'checked' : ''}`}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.textContent)}
      >
        {content}
      </div>
    </div>
  );
};

// Style
.todo-block {
  display: flex;
  align-items: flex-start;
  margin: 4px 0;
}

.todo-checkbox {
  margin-right: 8px;
  margin-top: 3px;
}

.todo-content.checked {
  text-decoration: line-through;
  opacity: 0.5;
}
```

### 5. Bloc Toggle (Accordéon)
```jsx
const ToggleBlock = ({ content, children, isOpen, onToggle, onChange }) => {
  return (
    <div className="toggle-block">
      <div className="toggle-header">
        <button 
          className="toggle-arrow"
          onClick={onToggle}
        >
          {isOpen ? '▼' : '▶'}
        </button>
        <div
          className="toggle-content"
          contentEditable
          onInput={(e) => onChange(e.currentTarget.textContent)}
        >
          {content}
        </div>
      </div>
      {isOpen && (
        <div className="toggle-children">
          {children}
        </div>
      )}
    </div>
  );
};
```

### 6. Bloc Callout
```jsx
const CalloutBlock = ({ icon, content, onChange }) => {
  return (
    <div className="callout-block">
      <div className="callout-icon">{icon || '💡'}</div>
      <div
        className="callout-content"
        contentEditable
        onInput={(e) => onChange(e.currentTarget.textContent)}
      >
        {content}
      </div>
    </div>
  );
};

// Style
.callout-block {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f7f6f3;
  border-radius: 4px;
  margin: 8px 0;
}
```

## 🎨 Menu Slash Command

### Structure du Menu
```jsx
const SlashCommandMenu = ({ onSelect, searchTerm }) => {
  const commands = [
    // Blocs Basiques
    { icon: 'Aa', label: 'Text', type: 'text', shortcut: 'Just start typing' },
    { icon: 'H1', label: 'Heading 1', type: 'heading1', shortcut: '# + space' },
    { icon: 'H2', label: 'Heading 2', type: 'heading2', shortcut: '## + space' },
    { icon: 'H3', label: 'Heading 3', type: 'heading3', shortcut: '### + space' },
    
    // Listes
    { icon: '•', label: 'Bulleted list', type: 'bullet_list', shortcut: '- + space' },
    { icon: '1.', label: 'Numbered list', type: 'numbered_list', shortcut: '1. + space' },
    { icon: '☐', label: 'To-do list', type: 'todo', shortcut: '[] + space' },
    { icon: '▶', label: 'Toggle list', type: 'toggle', shortcut: '> + space' },
    
    // Blocs Avancés
    { icon: '"', label: 'Quote', type: 'quote', shortcut: '" + space' },
    { icon: '—', label: 'Divider', type: 'divider', shortcut: '---' },
    { icon: '💡', label: 'Callout', type: 'callout', shortcut: '' },
    { icon: '</>', label: 'Code', type: 'code', shortcut: '```' },
    
    // Media
    { icon: '🖼', label: 'Image', type: 'image', shortcut: '' },
    { icon: '🎥', label: 'Video', type: 'video', shortcut: '' },
    { icon: '🔖', label: 'Bookmark', type: 'bookmark', shortcut: '' },
    { icon: '∑', label: 'Equation', type: 'equation', shortcut: '$$' },
  ];

  return (
    <div className="slash-menu">
      <div className="slash-menu-header">BASIC BLOCKS</div>
      <div className="slash-menu-items">
        {commands.map(cmd => (
          <button
            key={cmd.type}
            className="slash-menu-item"
            onClick={() => onSelect(cmd.type)}
          >
            <span className="item-icon">{cmd.icon}</span>
            <span className="item-label">{cmd.label}</span>
            <span className="item-shortcut">{cmd.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Style du menu
.slash-menu {
  position: absolute;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.slash-menu-item:hover {
  background: #f7f6f3;
}
```

## ⌨️ Raccourcis Clavier

### Markdown Shortcuts
```javascript
const markdownShortcuts = {
  '#': () => transformToHeading(1),
  '##': () => transformToHeading(2),
  '###': () => transformToHeading(3),
  '-': () => transformToBulletList(),
  '1.': () => transformToNumberedList(),
  '[]': () => transformToTodo(),
  '>': () => transformToToggle(),
  '"': () => transformToQuote(),
  '```': () => transformToCode(),
  '---': () => insertDivider(),
};

// Détection et transformation
const handleKeyDown = (e) => {
  // Slash command
  if (e.key === '/') {
    showSlashMenu();
  }
  
  // Nouveau bloc avec Enter
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    createNewBlock();
  }
  
  // Supprimer bloc vide avec Backspace
  if (e.key === 'Backspace' && isBlockEmpty()) {
    e.preventDefault();
    deleteBlock();
  }
  
  // Navigation avec flèches
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    navigateBlocks(e.key);
  }
};
```

## 🎯 Fonctionnalités d'Édition Avancées

### 1. Sélection de Texte et Formatage
```jsx
const TextFormattingToolbar = ({ selection }) => {
  return (
    <div className="formatting-toolbar" style={{
      position: 'absolute',
      top: selection.top - 40,
      left: selection.left
    }}>
      <button onClick={() => format('bold')}>B</button>
      <button onClick={() => format('italic')}>I</button>
      <button onClick={() => format('underline')}>U</button>
      <button onClick={() => format('strikethrough')}>S</button>
      <button onClick={() => format('code')}>{'</>'}</button>
      <button onClick={() => addLink()}>🔗</button>
      <select onChange={(e) => setColor(e.target.value)}>
        <option value="">Color</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>
    </div>
  );
};

// Application du formatage
const format = (style) => {
  document.execCommand(style, false, null);
};
```

### 2. Drag & Drop des Blocs
```javascript
// Configuration du drag & drop
const handleDragStart = (e, blockId) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('blockId', blockId);
  e.target.classList.add('dragging');
};

const handleDragOver = (e) => {
  e.preventDefault();
  const draggingElement = document.querySelector('.dragging');
  const afterElement = getDragAfterElement(e.clientY);
  
  if (afterElement) {
    container.insertBefore(draggingElement, afterElement);
  } else {
    container.appendChild(draggingElement);
  }
};

const handleDragEnd = (e) => {
  e.target.classList.remove('dragging');
  updateBlocksOrder();
};
```

### 3. Gestion des Images
```jsx
const ImageBlock = ({ src, caption, onCaptionChange }) => {
  return (
    <div className="image-block">
      <div className="image-container">
        <img src={src} alt={caption} />
        <div className="image-toolbar">
          <button>↔️ Resize</button>
          <button>🎨 Filter</button>
          <button>🗑️ Delete</button>
        </div>
      </div>
      <input
        className="image-caption"
        placeholder="Add a caption..."
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
      />
    </div>
  );
};
```

## 💾 Sauvegarde et Synchronisation

### Auto-save System
```javascript
class AutoSave {
  constructor() {
    this.saveTimeout = null;
    this.lastSaved = null;
  }

  scheduleSave(content) {
    // Annuler la sauvegarde précédente
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Programmer une nouvelle sauvegarde après 500ms
    this.saveTimeout = setTimeout(() => {
      this.save(content);
    }, 500);
  }

  async save(content) {
    try {
      await api.savePage(content);
      this.lastSaved = new Date();
      this.showSaveIndicator('Saved');
    } catch (error) {
      this.showSaveIndicator('Error saving', 'error');
    }
  }

  showSaveIndicator(message, type = 'success') {
    // Afficher l'indicateur de sauvegarde
    const indicator = document.querySelector('.save-indicator');
    indicator.textContent = message;
    indicator.className = `save-indicator ${type}`;
  }
}
```

## 🎨 Styles CSS Complets

### Variables CSS Principales
```css
:root {
  /* Couleurs */
  --notion-bg: #ffffff;
  --notion-text: #37352f;
  --notion-text-gray: #9b9a97;
  --notion-border: #e9e9e7;
  --notion-hover: rgba(55, 53, 47, 0.08);
  --notion-selection: rgba(35, 131, 226, 0.14);
  
  /* Espacements */
  --block-spacing: 2px;
  --content-padding: 96px;
  --mobile-padding: 24px;
  
  /* Typographie */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
}
```

### Responsive Design
```css
/* Mobile */
@media (max-width: 768px) {
  .editor-content {
    padding: 0 24px;
  }
  
  .block-handle {
    display: none; /* Masquer sur mobile */
  }
  
  .page-title {
    font-size: 28px;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .editor-content {
    padding: 0 48px;
  }
}

/* Desktop Large */
@media (min-width: 1440px) {
  .editor-content {
    max-width: 900px;
    margin: 0 auto;
  }
}
```

## 🚀 Instructions d'Implémentation pour Claude Code

### 1. Structure de Fichiers Recommandée
```
/src
  /components
    /Editor
      Editor.jsx
      EditorContext.jsx
      EditorStyles.css
    /Blocks
      TextBlock.jsx
      HeadingBlock.jsx
      ListBlock.jsx
      TodoBlock.jsx
      ToggleBlock.jsx
      CalloutBlock.jsx
      CodeBlock.jsx
      ImageBlock.jsx
      BlockWrapper.jsx
    /Toolbar
      FormattingToolbar.jsx
      SlashMenu.jsx
      BlockMenu.jsx
  /utils
    blockHelpers.js
    markdownParser.js
    keyboardShortcuts.js
    dragDropHandler.js
  /hooks
    useAutoSave.js
    useSelection.js
    useBlockNavigation.js
  /services
    api.js
    storage.js
```

### 2. État Global de l'Éditeur
```javascript
const EditorState = {
  blocks: [], // Tous les blocs
  selectedBlockId: null,
  isSlashMenuOpen: false,
  isFormattingToolbarOpen: false,
  isDragging: false,
  lastSaved: null,
  history: [], // Pour undo/redo
  historyIndex: -1,
};
```

### 3. Ordre d'Implémentation
1. **Phase 1** : Structure de base et blocs texte simples
2. **Phase 2** : Slash menu et transformation de blocs
3. **Phase 3** : Formatage de texte et toolbar
4. **Phase 4** : Drag & drop
5. **Phase 5** : Auto-save et synchronisation
6. **Phase 6** : Blocs avancés (images, vidéos, etc.)
7. **Phase 7** : Undo/Redo et historique
8. **Phase 8** : Optimisations et performance

## 📋 Checklist de Validation

- [ ] Création de blocs avec Enter
- [ ] Suppression de blocs avec Backspace
- [ ] Menu slash fonctionnel
- [ ] Transformation markdown (# pour titre, etc.)
- [ ] Drag & drop des blocs
- [ ] Formatage de texte (bold, italic, etc.)
- [ ] Navigation au clavier entre blocs
- [ ] Auto-save toutes les 500ms
- [ ] Indicateur de sauvegarde
- [ ] Responsive sur tous les devices
- [ ] Performance fluide avec 100+ blocs
- [ ] Undo/Redo fonctionnel
- [ ] Copier/Coller de blocs
- [ ] Export en Markdown
- [ ] Import de contenu

## 🔑 Points Critiques

1. **ContentEditable** : Utiliser `contentEditable` avec `suppressContentEditableWarning` en React
2. **Performance** : Utiliser `React.memo` pour les blocs et virtualisation pour les longues pages
3. **Sélection** : Gérer `window.getSelection()` pour le formatage
4. **Focus** : Maintenir le focus lors de la transformation de blocs
5. **Histoire** : Implémenter un système de snapshots pour undo/redo
6. **Sauvegarde** : Debounce les sauvegardes pour éviter trop de requêtes

Cette spécification complète devrait permettre à Claude Code de créer un éditeur de page complet style Notion avec toutes les fonctionnalités essentielles.