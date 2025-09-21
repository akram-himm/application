import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant pour une carte dans le Kanban
const KanbanCard = ({ id, content, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 mb-2 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-700 flex-1">{content}</p>
        <button
          onClick={() => onDelete(id)}
          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Supprimer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Composant pour une colonne du Kanban
const KanbanColumn = ({ title, cards, columnId, onAddCard, onDeleteCard, color }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');

  const handleAddCard = () => {
    if (newCardContent.trim()) {
      onAddCard(columnId, newCardContent.trim());
      setNewCardContent('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewCardContent('');
    }
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className={`mb-3 flex items-center justify-between ${color}`}>
        <h3 className="font-medium text-gray-700 flex items-center gap-2">
          <span className="text-sm">{title}</span>
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </h3>
      </div>

      <div className="bg-gray-50/30 rounded-lg p-3 min-h-[200px]">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              id={card.id}
              content={card.content}
              onDelete={(id) => onDeleteCard(columnId, id)}
            />
          ))}
        </SortableContext>

        {isAdding ? (
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-blue-300">
            <textarea
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Entrez le contenu..."
              className="w-full text-sm text-gray-700 outline-none resize-none"
              rows="2"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCard}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCardContent('');
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-2 text-left text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter une carte
          </button>
        )}
      </div>
    </div>
  );
};

// Composant principal Kanban
const SimpleKanban = ({ subjectId, radarId }) => {
  const [columns, setColumns] = useState({
    'todo': { title: 'À faire', cards: [], color: 'text-red-600' },
    'in-progress': { title: 'En cours', cards: [], color: 'text-yellow-600' },
    'done': { title: 'Terminé', cards: [], color: 'text-green-600' }
  });

  const [activeId, setActiveId] = useState(null);

  // Charger les données depuis localStorage
  useEffect(() => {
    const savedKey = `kanban-${radarId}-${subjectId}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumns(parsed);
      } catch (e) {
        console.error('Erreur de chargement du Kanban:', e);
      }
    }
  }, [subjectId, radarId]);

  // Sauvegarder les données dans localStorage
  useEffect(() => {
    const savedKey = `kanban-${radarId}-${subjectId}`;
    localStorage.setItem(savedKey, JSON.stringify(columns));
  }, [columns, subjectId, radarId]);

  const handleAddCard = (columnId, content) => {
    const newCard = {
      id: `card-${Date.now()}`,
      content,
      createdAt: new Date().toISOString()
    };

    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        cards: [...prev[columnId].cards, newCard]
      }
    }));
  };

  const handleDeleteCard = (columnId, cardId) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        cards: prev[columnId].cards.filter(card => card.id !== cardId)
      }
    }));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Trouver les colonnes source et destination
    let sourceColumn = null;
    let destColumn = null;
    let activeCard = null;

    Object.entries(columns).forEach(([colId, col]) => {
      const card = col.cards.find(c => c.id === active.id);
      if (card) {
        sourceColumn = colId;
        activeCard = card;
      }
      if (col.cards.find(c => c.id === over.id)) {
        destColumn = colId;
      }
    });

    // Si on déplace dans la même colonne
    if (sourceColumn && destColumn && sourceColumn === destColumn) {
      setColumns(prev => ({
        ...prev,
        [sourceColumn]: {
          ...prev[sourceColumn],
          cards: arrayMove(
            prev[sourceColumn].cards,
            prev[sourceColumn].cards.findIndex(c => c.id === active.id),
            prev[sourceColumn].cards.findIndex(c => c.id === over.id)
          )
        }
      }));
    }
    // Si on déplace vers une autre colonne
    else if (sourceColumn && destColumn && activeCard) {
      setColumns(prev => {
        const newColumns = { ...prev };

        // Retirer de la colonne source
        newColumns[sourceColumn] = {
          ...newColumns[sourceColumn],
          cards: newColumns[sourceColumn].cards.filter(c => c.id !== active.id)
        };

        // Ajouter à la colonne destination
        const destIndex = newColumns[destColumn].cards.findIndex(c => c.id === over.id);
        const newCards = [...newColumns[destColumn].cards];

        if (destIndex === -1) {
          newCards.push(activeCard);
        } else {
          newCards.splice(destIndex, 0, activeCard);
        }

        newColumns[destColumn] = {
          ...newColumns[destColumn],
          cards: newCards
        };

        return newColumns;
      });
    }

    setActiveId(null);
  };

  const findCard = (id) => {
    for (const [, column] of Object.entries(columns)) {
      const card = column.cards.find(c => c.id === id);
      if (card) return card;
    }
    return null;
  };

  const activeCard = activeId ? findCard(activeId) : null;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Tableau Kanban</h2>
        <p className="text-sm text-gray-500">Organisez vos tâches par statut</p>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              title={column.title}
              cards={column.cards}
              columnId={columnId}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              color={column.color}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 cursor-move rotate-3">
              <p className="text-sm text-gray-700">{activeCard.content}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default SimpleKanban;