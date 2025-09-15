import React, { useMemo, useEffect } from 'react';
import {
  BlockNoteEditor,
  filterSuggestionItems
} from "@blocknote/core";
import {
  BlockNoteView,
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import "@blocknote/react/style.css";

const NotionEditor = ({ tasks, onAddToKanban, onUpdateTask }) => {
  // Configuration de l'éditeur
  const editor = useCreateBlockNote({
    initialContent: tasks && tasks.length > 0 ? tasks : [
      {
        type: "paragraph",
        content: "Commencez à écrire ou tapez '/' pour voir les options..."
      }
    ],
    uploadFile: async () => {
      // Désactiver l'upload de fichiers pour l'instant
      return "";
    }
  });

  // Sauvegarder automatiquement les changements
  useEffect(() => {
    const handleChange = () => {
      const blocks = editor.document;
      if (onUpdateTask) {
        onUpdateTask(blocks);
      }
    };

    editor.onChange(handleChange);
  }, [editor, onUpdateTask]);

  // Menu personnalisé avec vos options
  const customSlashMenuItems = [
    {
      title: "Titre principal",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            props: { level: 1 },
            content: ""
          }
        ], editor.getTextCursorPosition().block, "after");
      },
      aliases: ["h1", "titre", "#"],
      group: "Titres",
      icon: <span className="text-gray-500">#</span>,
      subtext: "Titre de niveau 1"
    },
    {
      title: "Sous-titre 1",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            props: { level: 2 },
            content: ""
          }
        ], editor.getTextCursorPosition().block, "after");
      },
      aliases: ["h2", "sous-titre", "##"],
      group: "Titres",
      icon: <span className="text-gray-500">##</span>,
      subtext: "Titre de niveau 2"
    },
    {
      title: "Sous-titre 2",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "heading",
            props: { level: 3 },
            content: ""
          }
        ], editor.getTextCursorPosition().block, "after");
      },
      aliases: ["h3", "###"],
      group: "Titres",
      icon: <span className="text-gray-500">###</span>,
      subtext: "Titre de niveau 3"
    },
    {
      title: "Tâche",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "bulletListItem",
            content: ""
          }
        ], editor.getTextCursorPosition().block, "after");
      },
      aliases: ["task", "tâche", "todo", "•"],
      group: "Listes",
      icon: <span className="text-gray-500">•</span>,
      subtext: "Élément de liste"
    },
    {
      title: "Liste numérotée",
      onItemClick: () => {
        editor.insertBlocks([
          {
            type: "numberedListItem",
            content: ""
          }
        ], editor.getTextCursorPosition().block, "after");
      },
      aliases: ["numbered", "1.", "numéro"],
      group: "Listes",
      icon: <span className="text-gray-500">1.</span>,
      subtext: "Liste numérotée"
    }
  ];

  // Fonction pour extraire la hiérarchie et l'envoyer au Kanban
  const handleAddBlockToKanban = (block) => {
    const hierarchicalItem = {
      id: block.id || Date.now().toString(),
      text: extractTextFromBlock(block),
      type: block.type === 'heading' ? `h${block.props?.level || 1}` : 'task',
      hierarchy: []
    };

    // Extraire les enfants si c'est un titre
    if (block.type === 'heading') {
      const blocks = editor.document;
      const blockIndex = blocks.findIndex(b => b.id === block.id);

      // Collecter les blocs enfants jusqu'au prochain titre de même niveau ou supérieur
      for (let i = blockIndex + 1; i < blocks.length; i++) {
        const childBlock = blocks[i];
        if (childBlock.type === 'heading' && childBlock.props?.level <= block.props?.level) {
          break;
        }
        if (childBlock.type === 'heading' || childBlock.type === 'bulletListItem') {
          hierarchicalItem.hierarchy.push({
            id: childBlock.id || Date.now().toString() + i,
            text: extractTextFromBlock(childBlock),
            type: childBlock.type === 'heading' ? `h${childBlock.props?.level || 1}` : 'task'
          });
        }
      }
    }

    if (onAddToKanban) {
      onAddToKanban(hierarchicalItem);
    }
  };

  // Extraire le texte d'un bloc
  const extractTextFromBlock = (block) => {
    if (!block.content) return '';
    if (typeof block.content === 'string') return block.content;
    if (Array.isArray(block.content)) {
      return block.content.map(item => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        return '';
      }).join('');
    }
    return '';
  };

  // Styles personnalisés pour l'éditeur
  const customStyles = {
    editor: {
      minHeight: '300px',
      padding: '20px',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#1f2937'
    },
    '.bn-editor': {
      backgroundColor: 'transparent',
      fontFamily: 'inherit'
    },
    '.bn-block-outer': {
      marginBottom: '4px'
    },
    '.bn-heading': {
      marginTop: '12px',
      marginBottom: '8px'
    },
    'h1.bn-heading': {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827'
    },
    'h2.bn-heading': {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#374151',
      marginLeft: '1.5rem'
    },
    'h3.bn-heading': {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginLeft: '3rem'
    },
    '.bn-list-item': {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginLeft: '4rem'
    },
    '.bn-inline-content': {
      outline: 'none !important',
      boxShadow: 'none !important'
    },
    '.bn-slash-menu': {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '0.25rem'
    },
    '.bn-slash-menu-item': {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      borderRadius: '0.25rem'
    },
    '.bn-slash-menu-item:hover': {
      backgroundColor: '#f9fafb'
    },
    '.bn-slash-menu-item.selected': {
      backgroundColor: '#dbeafe',
      color: '#2563eb'
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-6 px-4">
        <h3 className="text-sm font-medium text-gray-500">Notes et planification</h3>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <div className="px-4">
        <BlockNoteView
          editor={editor}
          theme="light"
          slashMenu={false}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(customSlashMenuItems, query)
            }
          />
        </BlockNoteView>
      </div>

      {/* Menu contextuel pour ajouter au Kanban */}
      <style>{`
        ${Object.entries(customStyles).map(([selector, styles]) => `
          ${selector} {
            ${Object.entries(styles).map(([prop, value]) => `${prop}: ${value};`).join('\n')}
          }
        `).join('\n')}

        /* Supprimer le contour bleu */
        .bn-editor [contenteditable]:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        /* Style pour les lignes de séparation */
        .bn-heading[data-level="1"]:not(:first-child)::before {
          content: '';
          display: block;
          height: 1px;
          background: rgba(156, 163, 175, 0.3);
          margin: 1rem 0;
        }

        /* Curseur not-allowed pour les éléments verrouillés */
        .bn-block[data-locked="true"] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Masquer les handles de drag par défaut */
        .bn-block-handle {
          opacity: 0;
          transition: opacity 0.2s;
        }

        .bn-block-outer:hover .bn-block-handle {
          opacity: 1;
        }

        /* Menu personnalisé */
        .bn-slash-menu {
          min-width: 200px;
        }

        /* Améliorer la lisibilité du texte */
        .bn-inline-content {
          color: #1f2937;
        }

        /* Placeholder personnalisé */
        .bn-editor .ProseMirror-empty:first-child::before {
          content: "Cliquez ici pour commencer à écrire...";
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
};

export default NotionEditor;