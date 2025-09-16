// Fichier: src/components/NotionEditor/Editor.jsx
// REMPLACER COMPLÈTEMENT le fichier existant

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [colorMenuBlockId, setColorMenuBlockId] = useState(null);

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
    { type: 'quote', label: 'Citation', icon: '"', shortcut: '> ' },
    { type: 'color', label: 'Couleur du texte', icon: '🎨', shortcut: '' }
  ];

  // Couleurs disponibles pour le texte
  const textColors = [
    { name: 'Par défaut', value: 'inherit', hex: '#374151' },
    { name: 'Rouge', value: 'red', hex: '#EF4444' },
    { name: 'Orange', value: 'orange', hex: '#F97316' },
    { name: 'Jaune', value: 'yellow', hex: '#EAB308' },
    { name: 'Vert', value: 'green', hex: '#22C55E' },
    { name: 'Bleu', value: 'blue', hex: '#3B82F6' },
    { name: 'Violet', value: 'purple', hex: '#A855F7' },
    { name: 'Rose', value: 'pink', hex: '#EC4899' },
    { name: 'Gris', value: 'gray', hex: '#6B7280' }
  ];

  // Fermer les menus si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSlashMenu && !e.target.closest('.notion-slash-menu')) {
        setShowSlashMenu(false);
      }
      if (showColorMenu && !e.target.closest('.notion-color-menu')) {
        setShowColorMenu(false);
      }
    };

    const handleResize = () => {
      // Fermer les menus si la fenêtre est redimensionnée (sidebar ouverte/fermée)
      if (showSlashMenu) setShowSlashMenu(false);
      if (showColorMenu) setShowColorMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [showSlashMenu, showColorMenu]);

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
      checked: false,
      color: 'inherit'
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
    setBlocks(prevBlocks => {
      const blockIndex = prevBlocks.findIndex(b => b.id === id);
      if (blockIndex === -1) return prevBlocks;

      const currentBlock = prevBlocks[blockIndex];
      // Vérifier si une mise à jour est vraiment nécessaire
      const hasChanges = Object.keys(updates).some(key => currentBlock[key] !== updates[key]);

      if (!hasChanges) return prevBlocks;

      const newBlocks = [...prevBlocks];
      newBlocks[blockIndex] = { ...currentBlock, ...updates };
      return newBlocks;
    });
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

    // Navigation dans le menu slash
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMenuIndex(prev =>
          prev < blockTypes.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMenuIndex(prev =>
          prev > 0 ? prev - 1 : blockTypes.length - 1
        );
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedType = blockTypes[selectedMenuIndex];
        selectFromSlashMenu(selectedType.type);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        // Effacer le slash
        const el = blockRefs.current[blockId];
        if (el && el.textContent === '/') {
          el.textContent = '';
          updateBlock(blockId, { content: '' });
        }
        return;
      }
    }

    // Navigation dans le menu couleur
    if (showColorMenu) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowColorMenu(false);
        return;
      }
    }

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

      // Logique pour continuer ou sortir du type
      let newType = 'text';
      let newIndent = block.indent;

      // Si le bloc actuel est vide et qu'on appuie sur Enter
      if (fullText === '' || beforeCursor === '') {
        // Sortir du type spécial et revenir au texte normal
        if (block.type === 'bullet' || block.type === 'numbered' || block.type === 'todo') {
          newType = 'text';
          // Optionnel : désindenter aussi
          if (block.indent > 0) {
            newIndent = block.indent - 1;
          }
        } else {
          newType = 'text';
        }
      } else {
        // Continuer avec le même type pour les listes et todos
        if (block.type === 'bullet' || block.type === 'numbered' || block.type === 'todo') {
          newType = block.type;
        } else if (block.type === 'h1' || block.type === 'h2' || block.type === 'h3') {
          // Les titres ne se continuent pas
          newType = 'text';
        } else {
          // Pour les autres types, continuer avec le même
          newType = block.type;
        }
      }

      // Créer un nouveau bloc avec le type approprié
      const newBlockId = createBlock(blockId, newType, afterCursor, newIndent);

      // Pour les todos, initialiser avec checked à false
      if (newType === 'todo') {
        setTimeout(() => {
          updateBlock(newBlockId, { checked: false });
        }, 10);
      }
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

    // Backspace sur bloc vide ou au début
    if (e.key === 'Backspace') {
      const el = blockRefs.current[blockId];
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Si le curseur est au début du bloc
      if (range.startOffset === 0 && range.endOffset === 0) {
        e.preventDefault();

        // Si le bloc est vide
        if (!el.textContent || el.textContent === '') {
          // Si c'est un bloc spécial, le convertir en texte
          if (block.type !== 'text') {
            updateBlock(blockId, { type: 'text', indent: Math.max(0, block.indent - 1) });
          } else if (blocks.length > 1) {
            // Fusionner avec le bloc précédent
            const index = blocks.findIndex(b => b.id === blockId);
            if (index > 0) {
              const prevBlock = blocks[index - 1];
              const prevEl = blockRefs.current[prevBlock.id];
              if (prevEl) {
                const prevContent = prevBlock.content || '';
                const currentContent = block.content || '';

                // Fusionner les contenus
                updateBlock(prevBlock.id, { content: prevContent + currentContent });

                // Supprimer le bloc actuel
                deleteBlock(blockId);

                // Placer le curseur à la jonction
                setTimeout(() => {
                  prevEl.focus();
                  const newRange = document.createRange();
                  const textNode = prevEl.firstChild || prevEl;
                  const offset = prevContent.length;

                  try {
                    newRange.setStart(textNode, offset);
                    newRange.setEnd(textNode, offset);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                  } catch (e) {
                    // En cas d'erreur, placer le curseur à la fin
                    newRange.selectNodeContents(prevEl);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                  }
                }, 50);
              }
            }
          }
        } else {
          // Le bloc n'est pas vide, mais le curseur est au début
          // Pour les listes et todos, convertir en texte
          if (block.type === 'bullet' || block.type === 'numbered' || block.type === 'todo') {
            updateBlock(blockId, { type: 'text' });
          }
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

    // Si le contenu n'a pas changé, ne pas mettre à jour pour éviter la resynchronisation
    if (block.content === text) {
      return;
    }

    // Sauvegarder la position du curseur
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const cursorPosition = range ? range.startOffset : 0;

    // Détecter le slash menu
    if (text === '/') {
      // Créer un élément temporaire pour obtenir la position exacte du /
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Créer un span temporaire à la position du curseur
      const tempSpan = document.createElement('span');
      tempSpan.textContent = '\u200b'; // Caractère de largeur zéro
      range.insertNode(tempSpan);

      // Obtenir la position du span
      const spanRect = tempSpan.getBoundingClientRect();

      // Nettoyer le span temporaire
      tempSpan.parentNode.removeChild(tempSpan);

      // Normaliser le texte pour éviter les nœuds de texte fragmentés
      e.target.normalize();

      const menuHeight = 350; // Hauteur approximative du menu
      const menuWidth = 280; // Largeur du menu
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Position verticale - juste sous le curseur
      let top = spanRect.bottom + 2;
      let placement = 'below';

      // Si pas assez de place en dessous, mettre au-dessus
      if (spanRect.bottom + menuHeight > windowHeight - 20) {
        top = spanRect.top - menuHeight - 2;
        placement = 'above';
      }

      // Position horizontale - aligné avec le slash
      let left = spanRect.left;

      // Ajuster si le menu dépasse à droite
      if (left + menuWidth > windowWidth - 20) {
        left = windowWidth - menuWidth - 20;
      }

      // S'assurer que le menu ne sort pas à gauche
      if (left < 10) {
        left = 10;
      }

      setSlashMenuPosition({
        top: top,
        left: left,
        placement: placement
      });
      setShowSlashMenu(true);
      setSlashMenuBlockId(blockId);
      setSelectedMenuIndex(0); // Reset l'index sélectionné
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

        // Marquer qu'on est en train de faire un changement de type
        e.target.dataset.changingType = 'true';

        updateBlock(blockId, { type, content: newContent });

        // Vider le contenu et refocus
        e.target.textContent = newContent;

        // Replacer le curseur
        setTimeout(() => {
          const selection = window.getSelection();
          const range = document.createRange();

          if (e.target.firstChild) {
            range.setStart(e.target.firstChild, newContent.length);
            range.setEnd(e.target.firstChild, newContent.length);
          } else {
            range.selectNodeContents(e.target);
            range.collapse(false);
          }

          selection.removeAllRanges();
          selection.addRange(range);

          delete e.target.dataset.changingType;
        }, 0);

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
    if (type === 'color') {
      // Ouvrir le menu de couleurs
      setShowColorMenu(true);
      setColorMenuBlockId(slashMenuBlockId);
      setShowSlashMenu(false);
    } else if (slashMenuBlockId) {
      updateBlock(slashMenuBlockId, { type, content: '' });
      const el = blockRefs.current[slashMenuBlockId];
      if (el) {
        el.textContent = '';
        el.focus();
      }
      setShowSlashMenu(false);
    }
  };

  // Sélectionner une couleur
  const selectColor = (color) => {
    if (colorMenuBlockId) {
      updateBlock(colorMenuBlockId, { color: color });
      const el = blockRefs.current[colorMenuBlockId];
      if (el) {
        el.textContent = '';
        el.focus();
      }
    }
    setShowColorMenu(false);
    setColorMenuBlockId(null);
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
          ref={el => {
            blockRefs.current[block.id] = el;
            // Définir le contenu initial si l'élément vient d'être créé
            if (el && !el.hasAttribute('data-initialized')) {
              el.textContent = block.content || '';
              el.setAttribute('data-initialized', 'true');
            }
          }}
          contentEditable
          suppressContentEditableWarning
          className={`block-content block-${block.type} ${block.checked ? 'checked' : ''}`}
          style={{
            color: block.color && block.color !== 'inherit'
              ? textColors.find(c => c.value === block.color)?.hex || block.color
              : 'inherit'
          }}
          onKeyDown={(e) => handleKeyDown(e, block.id)}
          onInput={(e) => handleInput(e, block.id)}
          onFocus={(e) => {
            // Marquer que cet élément a le focus
            e.target.dataset.hasFocus = 'true';
          }}
          onBlur={(e) => {
            // Retirer le marqueur de focus et synchroniser le contenu final
            delete e.target.dataset.hasFocus;
            const text = e.target.textContent || '';
            if (block.content !== text) {
              updateBlock(block.id, { content: text });
            }
          }}
          placeholder={
            block.type === 'h1' ? 'Titre 1' :
            block.type === 'h2' ? 'Titre 2' :
            block.type === 'h3' ? 'Titre 3' :
            'Tapez "/" pour les commandes'
          }
        />
      </div>
    );
  };

  // Synchroniser le contenu des blocs avec le DOM
  useEffect(() => {
    blocks.forEach(block => {
      const el = blockRefs.current[block.id];
      if (!el) return;

      // Ne jamais synchroniser si l'élément a le focus
      if (el.dataset.hasFocus === 'true' || document.activeElement === el) {
        return;
      }

      // Ne synchroniser que si le contenu est différent
      if (el.textContent !== block.content) {
        // Ignorer si on est en train de changer le type
        if (el.dataset.changingType === 'true') {
          return;
        }

        // Mettre à jour le contenu
        el.textContent = block.content;
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

      {/* Portals pour les menus - rendus directement dans body */}
      {showSlashMenu && ReactDOM.createPortal(
        <div
          className="notion-slash-menu"
          style={{
            position: 'fixed',
            top: `${slashMenuPosition.top}px`,
            left: `${slashMenuPosition.left}px`,
            zIndex: 99999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="slash-menu-header">BLOCS DE BASE</div>
          <div className="slash-menu-content">
            {blockTypes.map((type, index) => (
              <button
                key={type.type}
                onClick={() => selectFromSlashMenu(type.type)}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setSelectedMenuIndex(index)}
                className={`slash-menu-item ${index === selectedMenuIndex ? 'selected' : ''}`}
              >
                <span className="menu-icon">{type.icon}</span>
                <span className="menu-label">{type.label}</span>
                <span className="menu-shortcut">{type.shortcut}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Menu de couleurs - rendu dans body */}
      {showColorMenu && ReactDOM.createPortal(
        <div
          className="notion-color-menu"
          style={{
            position: 'fixed',
            top: `${slashMenuPosition.top}px`,
            left: `${slashMenuPosition.left}px`,
            zIndex: 99999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="color-menu-header">COULEURS DU TEXTE</div>
          <div className="color-grid">
            {textColors.map(color => (
              <button
                key={color.value}
                onClick={() => selectColor(color.value)}
                onMouseDown={(e) => e.preventDefault()}
                className="color-item"
                title={color.name}
                style={{
                  backgroundColor: color.hex,
                  border: color.value === 'inherit' ? '2px solid #E5E7EB' : 'none'
                }}
              >
                {color.value === 'inherit' && (
                  <span style={{ color: '#6B7280', fontSize: '12px' }}>A</span>
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotionEditor;