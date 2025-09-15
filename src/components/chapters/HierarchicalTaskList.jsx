import React, { useState, useRef, useEffect } from 'react';
import { uniformStyles } from '../../styles/uniformStyles';

const HierarchicalTaskList = ({ tasks, onAddToKanban, onUpdateTask, onAddTask }) => {
  const [items, setItems] = useState(tasks || []);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [currentInputId, setCurrentInputId] = useState(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [lockedItems, setLockedItems] = useState(new Set());
  const [collapsedItems, setCollapsedItems] = useState(new Set());
  const [showEmptyLine, setShowEmptyLine] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const menuOptions = [
    { type: 'text', label: 'Texte', icon: 'Aa', style: 'text-base text-gray-900', shortcut: '' },
    { type: 'h1', label: 'Titre 1', icon: 'H1', style: 'text-2xl font-bold text-gray-900', shortcut: '# + espace' },
    { type: 'h2', label: 'Titre 2', icon: 'H2', style: 'text-xl font-semibold text-gray-900', shortcut: '## + espace' },
    { type: 'h3', label: 'Titre 3', icon: 'H3', style: 'text-lg font-medium text-gray-900', shortcut: '### + espace' },
    { type: 'bullet', label: 'Liste à puces', icon: '•', style: 'text-base text-gray-900', shortcut: '- + espace' },
    { type: 'number', label: 'Liste numérotée', icon: '1.', style: 'text-base text-gray-900', shortcut: '1. + espace' },
    { type: 'todo', label: 'Case à cocher', icon: '☐', style: 'text-base text-gray-900', shortcut: '[] + espace' },
    { type: 'divider', label: 'Séparateur', icon: '—', style: '', shortcut: '---' }
  ];

  // Gérer l'ajout d'un nouvel élément
  const handleAddItem = (type, parentId = null) => {
    const newItem = {
      id: Date.now().toString(),
      type,
      text: '',
      completed: false,
      parentId,
      children: []
    };

    if (parentId) {
      // Ajouter comme enfant
      const updateItems = (items) => {
        return items.map(item => {
          if (item.id === parentId) {
            return { ...item, children: [...(item.children || []), newItem] };
          }
          if (item.children) {
            return { ...item, children: updateItems(item.children) };
          }
          return item;
        });
      };
      setItems(updateItems(items));
    } else {
      // Ajouter à la racine
      setItems([...items, newItem]);
    }

    setEditingId(newItem.id);
    setEditingText('');
    setShowMenu(false);
  };

  // Gérer le texte avec "/"
  const handleInputChange = (e) => {
    const text = e.target.value;
    setEditingText(text);

    if (text === '/') {
      const rect = e.target.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setShowMenu(true);
      setSelectedMenuIndex(0);
      setCurrentInputId(editingId);
    } else if (text.startsWith('/') && showMenu) {
      // Garder le menu ouvert pendant la frappe après /
      const searchTerm = text.slice(1).toLowerCase();
      const filteredIndex = menuOptions.findIndex(o =>
        o.label.toLowerCase().includes(searchTerm)
      );
      if (filteredIndex !== -1) {
        setSelectedMenuIndex(filteredIndex);
      }
    } else {
      setShowMenu(false);
    }
  };

  // Sélectionner une option du menu
  const selectMenuOption = (option) => {
    if (!option) return;

    if (option.type === 'lock' || option.type === 'unlock') {
      // Gérer le verrouillage/déverrouillage
      const toggleLock = (items) => {
        return items.map(item => {
          if (item.id === editingId) {
            const newLockedItems = new Set(lockedItems);
            if (option.type === 'lock') {
              newLockedItems.add(item.id);
            } else {
              newLockedItems.delete(item.id);
            }
            setLockedItems(newLockedItems);
            return item;
          }
          if (item.children) {
            return { ...item, children: toggleLock(item.children) };
          }
          return item;
        });
      };

      setItems(toggleLock(items));
      setEditingId(null);
      setEditingText('');
      setShowMenu(false);
    } else {
      // Changer le type d'élément
      const findAndUpdateItem = (items) => {
        return items.map(item => {
          if (item.id === editingId) {
            // Conserver le texte existant ou nettoyer le /
            const currentText = item.text || '';
            const newText = editingText === '/' ? currentText : editingText.replace(/^\/.*?\s*/, '');
            return { ...item, type: option.type, text: newText };
          }
          if (item.children) {
            return { ...item, children: findAndUpdateItem(item.children) };
          }
          return item;
        });
      };

      const updatedItems = findAndUpdateItem(items);
      setItems(updatedItems);
      onUpdateTask(updatedItems);

      // Si on change juste le type d'un élément existant
      if (editingText === '/') {
        setEditingId(null);
        setEditingText('');
      } else {
        // Sinon, continuer l'édition avec le texte nettoyé
        setEditingText(editingText.replace(/^\/.*?\s*/, ''));
      }
      setShowMenu(false);
    }
  };

  // Sauvegarder le texte
  const handleSave = (createNewLine = false) => {
    let updatedItems = [...items];

    // Sauvegarder le texte actuel d'abord
    if (editingText.trim() && editingText !== '/') {
      updatedItems = updatedItems.map(item => {
        if (item.id === editingId) {
          return { ...item, text: editingText };
        }
        if (item.children) {
          return { ...item, children: item.children.map(child => {
            if (child.id === editingId) {
              return { ...child, text: editingText };
            }
            return child;
          })};
        }
        return item;
      });
      setItems(updatedItems);
      onUpdateTask(updatedItems);
    }

    if (createNewLine && editingText.trim() !== '') {
      // Créer une nouvelle ligne après la ligne actuelle
      const findItemAndAddAfter = (items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === editingId) {
            const currentItem = items[i];
            const newItem = {
              id: Date.now().toString(),
              type: currentItem.type === 'h1' ? 'h2' : currentItem.type === 'h2' ? 'h3' : 'task',
              text: '',
              completed: false,
              children: []
            };
            items.splice(i + 1, 0, newItem);
            setTimeout(() => {
              setEditingId(newItem.id);
              setEditingText('');
            }, 0);
            return true;
          }
          if (items[i].children && items[i].children.length > 0) {
            if (findItemAndAddAfter(items[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      const newItems = [...updatedItems];
      findItemAndAddAfter(newItems);
      setItems(newItems);
      onUpdateTask(newItems);
    } else if (!createNewLine) {
      setEditingId(null);
      setEditingText('');
    }
  };

  // Ajouter au Kanban avec hiérarchie
  const handleAddToKanban = (item) => {
    // Collecter tous les enfants de façon hiérarchique
    const collectHierarchy = (item) => {
      const result = {
        ...item,
        hierarchy: []
      };

      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          if (child.type === 'h2' || child.type === 'h3') {
            result.hierarchy.push(collectHierarchy(child));
          }
        });
      }

      return result;
    };

    const hierarchicalItem = collectHierarchy(item);
    onAddToKanban(hierarchicalItem);
  };

  // Rendu d'un élément
  const renderItem = (item, level = 0, index = 0, isLastInLevel = false) => {
    const option = menuOptions.find(o => o.type === item.type) || menuOptions[0];
    const isEditing = editingId === item.id;
    const isLocked = lockedItems.has(item.id);
    const isCollapsed = collapsedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isTitle = item.type === 'h1' || item.type === 'h2';

    return (
      <div key={item.id} className="group">
        {/* Ligne de séparation pour les titres principaux */}
        {item.type === 'h1' && index > 0 && (
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-200/50"></div>
          </div>
        )}

        <div className={`flex items-start gap-2 py-0.5 transition-colors ${option.style} ${isLocked ? 'opacity-60' : ''}`}
             style={isLocked ? { cursor: 'not-allowed' } : {}}>
          <span className="text-gray-300 select-none font-mono text-xs mt-1 flex items-center gap-1">
            {hasChildren && isTitle && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const newCollapsedItems = new Set(collapsedItems);
                  if (isCollapsed) {
                    newCollapsedItems.delete(item.id);
                  } else {
                    newCollapsedItems.add(item.id);
                  }
                  setCollapsedItems(newCollapsedItems);
                }}
                className="cursor-pointer hover:opacity-70 text-gray-400"
              >
                {isCollapsed ? '▶' : '▼'}
              </span>
            )}
            {isLocked ? '🔒' : option.icon}
          </span>

          {isEditing && !isLocked ? (
            <input
              ref={inputRef}
              type="text"
              value={editingText}
              onChange={handleInputChange}
              onBlur={() => handleSave(false)}
              onKeyDown={(e) => {
                // Navigation dans le menu
                if (showMenu) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedMenuIndex((prev) =>
                      prev < menuOptions.filter(o => o.type !== 'lock' && o.type !== 'unlock').length - 1 ? prev + 1 : prev
                    );
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedMenuIndex((prev) => prev > 0 ? prev - 1 : 0);
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const visibleOptions = menuOptions.filter(o => o.type !== 'lock' && o.type !== 'unlock');
                    selectMenuOption(visibleOptions[selectedMenuIndex]);
                    return;
                  }
                  if (e.key === 'Escape') {
                    setShowMenu(false);
                    setEditingText('');
                    return;
                  }
                }

                // Comportement normal
                if (e.key === 'Enter' && !showMenu) {
                  e.preventDefault();
                  handleSave(true); // true = créer une nouvelle ligne
                  return;
                }
                if (e.key === 'Escape' && !showMenu) {
                  setEditingId(null);
                  setEditingText('');
                }
                // Supprimer l'élément si Backspace/Delete sur texte vide
                if ((e.key === 'Backspace' || e.key === 'Delete') && editingText === '' && !showMenu) {
                  const deleteItem = (items) => {
                    return items.filter(item => {
                      if (item.id === editingId) {
                        return false;
                      }
                      if (item.children) {
                        item.children = deleteItem(item.children);
                      }
                      return true;
                    });
                  };
                  setItems(deleteItem(items));
                  setEditingId(null);
                  setEditingText('');
                  onUpdateTask(deleteItem(items));
                }
              }}
              className="flex-1 px-0 py-0 border-none outline-none bg-transparent focus:outline-none text-gray-900"
              placeholder={`${option.label}...`}
              style={{ boxShadow: 'none', color: 'inherit' }}
              autoFocus
            />
          ) : (
            <>
              <span
                className={`flex-1 leading-relaxed ${isLocked ? 'cursor-not-allowed text-gray-500' : 'cursor-text text-gray-900'}`}
                onClick={() => {
                  if (!isLocked) {
                    setEditingId(item.id);
                    setEditingText(item.text);
                  }
                }}
                onDoubleClick={() => {
                  if (!isLocked && item.text) {
                    // Double-clic pour ouvrir le menu de changement de type
                    setEditingId(item.id);
                    setEditingText('/');
                    const rect = event.target.getBoundingClientRect();
                    setMenuPosition({
                      x: rect.left,
                      y: rect.bottom + 5
                    });
                    setShowMenu(true);
                    setSelectedMenuIndex(0);
                  }
                }}
                title={!isLocked && item.text ? "Double-cliquez pour changer le type" : ""}
              >
                {item.text || <span className="text-gray-400 italic">Cliquer pour écrire...</span>}
              </span>

              {/* Boutons d'action - plus discrets */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button
                  onClick={() => {
                    const newLockedItems = new Set(lockedItems);
                    if (isLocked) {
                      newLockedItems.delete(item.id);
                    } else {
                      newLockedItems.add(item.id);
                    }
                    setLockedItems(newLockedItems);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                  title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
                >
                  {isLocked ? '🔓' : '🔒'}
                </button>
                {!isLocked && (
                  <>
                    {(item.type === 'h2' || item.type === 'h3') && (
                      <button
                        onClick={() => handleAddToKanban(item)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                        title="→ Kanban"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => handleAddItem('task', item.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-1"
                      title="Sous-élément"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cet élément ?')) {
                          const deleteItem = (items) => {
                            return items.filter(i => {
                              if (i.id === item.id) {
                                return false;
                              }
                              if (i.children) {
                                i.children = deleteItem(i.children);
                              }
                              return true;
                            });
                          };
                          setItems(deleteItem(items));
                          onUpdateTask(deleteItem(items));
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-600 px-1"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Enfants - cachés si collapsed */}
        {item.children && item.children.length > 0 && !isCollapsed && (
          <div className="ml-4">
            {item.children.map((child, idx) => renderItem(child, level + 1, idx, idx === item.children.length - 1))}
          </div>
        )}
      </div>
    );
  };

  // Focus automatique lors de l'édition
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  return (
    <div className="relative min-h-[400px]">
      <div className="px-4">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-medium text-gray-500">Notes et planification</h3>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-0.5">
          {items.map((item, index) => renderItem(item, 0, index, index === items.length - 1))}

          {/* Ligne vide pour écrire */}
          {(isCreatingNew || items.length === 0) && (
            <div className="flex items-start gap-2 py-0.5 hover:bg-gray-50/50 transition-colors">
              <span className="text-gray-300 select-none font-mono text-xs mt-1">•</span>
              <input
                ref={inputRef}
                type="text"
                value={editingText}
                onChange={handleInputChange}
                onBlur={() => {
                  if (editingText.trim() && editingText !== '/') {
                    handleAddItem('h1');
                    const updateItemText = (items) => {
                      return items.map(item => {
                        if (item.id === editingId) {
                          return { ...item, text: editingText };
                        }
                        if (item.children) {
                          return { ...item, children: updateItemText(item.children) };
                        }
                        return item;
                      });
                    };
                    setItems(updateItemText(items));
                    onUpdateTask(items);
                  }
                  setIsCreatingNew(false);
                  setEditingId(null);
                  setEditingText('');
                }}
                onKeyDown={(e) => {
                  // Navigation dans le menu pour nouvelle ligne
                  if (showMenu) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedMenuIndex((prev) =>
                        prev < menuOptions.filter(o => o.type !== 'lock' && o.type !== 'unlock').length - 1 ? prev + 1 : prev
                      );
                      return;
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedMenuIndex((prev) => prev > 0 ? prev - 1 : 0);
                      return;
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const visibleOptions = menuOptions.filter(o => o.type !== 'lock' && o.type !== 'unlock');
                      const selectedOption = visibleOptions[selectedMenuIndex];
                      handleAddItem(selectedOption.type);
                      setEditingId(items[items.length]?.id || null);
                      setEditingText('');
                      setShowMenu(false);
                      setIsCreatingNew(false);
                      return;
                    }
                    if (e.key === 'Escape') {
                      setShowMenu(false);
                      setEditingText('');
                      return;
                    }
                  }

                  // Comportement normal
                  if (e.key === 'Enter' && editingText.trim() && editingText !== '/' && !showMenu) {
                    const typeToUse = editingText.startsWith('#') ? 'h1' : 'task';
                    handleAddItem(typeToUse);
                    const updateItemText = (items) => {
                      return items.map(item => {
                        if (item.id === editingId) {
                          return { ...item, text: editingText.replace(/^#*\s*/, '') };
                        }
                        if (item.children) {
                          return { ...item, children: updateItemText(item.children) };
                        }
                        return item;
                      });
                    };
                    setItems(updateItemText(items));
                    onUpdateTask(items);
                    setIsCreatingNew(false);
                    setEditingId(null);
                    setEditingText('');
                  }
                  if (e.key === 'Escape' || (e.key === 'Backspace' && editingText === '')) {
                    setIsCreatingNew(false);
                    setEditingId(null);
                    setEditingText('');
                    setShowMenu(false);
                  }
                }}
                className="flex-1 px-0 py-0 border-none outline-none bg-transparent text-sm focus:outline-none text-gray-900"
                placeholder="Commencez à écrire ou tapez '/' pour les options..."
                style={{ boxShadow: 'none' }}
                autoFocus
              />
            </div>
          )}

          {/* Zone cliquable pour ajouter */}
          {!isCreatingNew && (
            <div
              onClick={() => {
                setIsCreatingNew(true);
                setEditingText('');
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="py-8 cursor-text hover:bg-gray-50/30 transition-colors rounded">
              <p className="text-sm text-gray-400 italic text-center">
                Cliquez ici pour commencer à écrire...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu type Notion - minimaliste */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-100 py-1 min-w-[180px]"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          {menuOptions.filter(o => o.type !== 'lock' && o.type !== 'unlock').map((option, index) => (
            <button
              key={option.type}
              onClick={() => selectMenuOption(option)}
              className={`w-full px-3 py-1.5 text-left flex items-center gap-3 text-sm transition-colors ${
                index === selectedMenuIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span className={`font-mono text-xs w-8 ${
                index === selectedMenuIndex ? 'text-blue-500' : 'text-gray-400'
              }`}>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchicalTaskList;