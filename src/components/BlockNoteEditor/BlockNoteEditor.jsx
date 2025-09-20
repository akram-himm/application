import React, { useEffect, useRef, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { savePageContent, loadPageContent } from '../../services/pageService';

const BlockNoteEditorComponent = ({ pageId, initialContent, readOnly = false }) => {
  const saveTimeoutRef = useRef(null);
  const lastSavedContent = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Créer l'éditeur avec configuration complète
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const url = URL.createObjectURL(file);
      return url;
    }
  });

  // Charger le contenu après la création de l'éditeur
  useEffect(() => {
    const loadContent = async () => {
      try {
        let contentToLoad = null;

        // Essayer de charger depuis le localStorage en premier
        const savedContent = loadPageContent(pageId);
        if (savedContent) {
          // Si c'est un objet avec une propriété blocks
          if (savedContent.blocks && Array.isArray(savedContent.blocks)) {
            contentToLoad = savedContent.blocks;
          }
          // Si c'est directement un tableau
          else if (Array.isArray(savedContent)) {
            contentToLoad = savedContent;
          }
        }

        // Si on a du contenu valide à charger
        if (contentToLoad && Array.isArray(contentToLoad) && contentToLoad.length > 0) {
          try {
            await editor.replaceBlocks(editor.document, contentToLoad);
          } catch (error) {
            console.warn('Impossible de charger le contenu sauvegardé, création d\'un nouveau document', error);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        setIsReady(true);
      }
    };

    loadContent();
  }, [editor, pageId]);

  // Désactiver l'édition si readOnly
  useEffect(() => {
    editor.isEditable = !readOnly;
  }, [editor, readOnly]);

  // Sauvegarder automatiquement avec debounce
  const handleContentChange = () => {
    if (readOnly) return;

    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Sauvegarder après 1 seconde d'inactivité
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const blocks = editor.document;
        const currentContent = JSON.stringify(blocks);

        if (currentContent !== lastSavedContent.current) {
          // Sauvegarder directement les blocs
          const success = savePageContent(pageId, { blocks });
          if (success) {
            lastSavedContent.current = currentContent;
            console.log('Contenu sauvegardé');
          } else {
            console.error('Erreur lors de la sauvegarde');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, 1000);
  };

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Afficher un loader pendant le chargement
  if (!isReady) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-gray-500">Chargement de l'éditeur...</div>
      </div>
    );
  }

  // Utiliser le thème light par défaut
  const theme = "light";

  return (
    <div className="blocknote-wrapper w-full min-h-[500px] px-12 py-4">
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={handleContentChange}
        sideMenu={true}
      />

      {/* Styles personnalisés pour un éditeur transparent */}
      <style jsx global>{`
        /* Conteneur principal - complètement transparent */
        .blocknote-wrapper .bn-container {
          background-color: transparent !important;
          color: rgb(55, 65, 81) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Éditeur principal - transparent */
        .blocknote-wrapper .bn-editor {
          background-color: transparent !important;
          color: rgb(55, 65, 81) !important;
          padding: 0 !important;
        }

        /* Supprimer toutes les bordures et ombres du conteneur */
        .blocknote-wrapper .bn-editor-wrapper {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* IMPORTANT: Supprimer les rectangles bleus de focus */
        .blocknote-wrapper .bn-block-outer {
          outline: none !important;
          box-shadow: none !important;
        }

        .blocknote-wrapper .bn-block-outer:focus,
        .blocknote-wrapper .bn-block-outer:focus-within {
          outline: none !important;
          box-shadow: none !important;
        }

        .blocknote-wrapper .ProseMirror:focus {
          outline: none !important;
        }

        .blocknote-wrapper .ProseMirror-focused {
          outline: none !important;
        }

        .blocknote-wrapper [contenteditable]:focus {
          outline: none !important;
        }

        /* Supprimer les indicateurs de sélection de bloc */
        .blocknote-wrapper .bn-block-outer.bn-is-selected {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        .blocknote-wrapper .bn-block-selection-menu {
          display: none !important;
        }

        /* Side menu TOUJOURS VISIBLE */
        .blocknote-wrapper .bn-side-menu {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 2px !important;  /* Espace réduit entre les boutons */
          z-index: 30 !important;
          background: transparent !important;
          position: absolute !important;
          left: -60px !important;  /* Plus à gauche pour plus d'espace */
        }

        /* Neutraliser tout affichage conditionnel au hover/focus */
        .blocknote-wrapper .bn-block-outer:hover .bn-side-menu,
        .blocknote-wrapper .bn-block:hover .bn-side-menu,
        .blocknote-wrapper [data-block-id]:hover .bn-side-menu,
        .blocknote-wrapper .bn-side-menu:hover,
        .blocknote-wrapper .bn-side-menu:focus-within {
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        /* Renfort de spécificité si nécessaire */
        .blocknote-wrapper .bn-block-outer > .bn-side-menu {
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        /* Style pour les boutons du side menu - TRANSPARENT */
        .bn-side-menu button {
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          border-radius: 4px !important;
          background-color: transparent !important;  /* Fond transparent */
          color: rgb(107, 114, 128) !important;  /* Gris plus foncé */
          cursor: pointer !important;
          transition: all 0.15s ease !important;
        }

        .bn-side-menu button:hover {
          background-color: rgba(229, 231, 235, 0.7) !important;  /* Fond gris au survol */
          color: rgb(75, 85, 99) !important;  /* Gris encore plus foncé au survol */
        }

        /* Drag handle spécifique */
        .bn-side-menu button[draggable="true"],
        .bn-drag-handle-button {
          cursor: grab !important;
        }

        .bn-side-menu button[draggable="true"]:active,
        .bn-drag-handle-button:active {
          cursor: grabbing !important;
        }

        /* Icônes dans les boutons */
        .bn-side-menu button svg {
          width: 14px !important;
          height: 14px !important;
          color: inherit !important;
        }

        /* Contenu des blocs */
        .blocknote-wrapper .bn-block-content {
          min-height: 1.5em;
          color: rgb(55, 65, 81) !important;
        }

        .blocknote-wrapper .bn-inline-content {
          color: rgb(55, 65, 81) !important;
        }

        /* Placeholder */
        .blocknote-wrapper [data-placeholder]:empty::before {
          color: rgb(156, 163, 175) !important;
        }

        /* Headings */
        .blocknote-wrapper h1,
        .blocknote-wrapper .bn-heading[data-level="1"] {
          font-size: 2.25rem !important;
          font-weight: 300 !important;
          margin: 1.5rem 0 0.75rem 0 !important;
          color: rgb(55, 65, 81) !important;
        }

        .blocknote-wrapper h2,
        .blocknote-wrapper .bn-heading[data-level="2"] {
          font-size: 1.875rem !important;
          font-weight: 300 !important;
          margin: 1.25rem 0 0.5rem 0 !important;
          color: rgb(55, 65, 81) !important;
        }

        .blocknote-wrapper h3,
        .blocknote-wrapper .bn-heading[data-level="3"] {
          font-size: 1.5rem !important;
          font-weight: 400 !important;
          margin: 1rem 0 0.5rem 0 !important;
          color: rgb(75, 85, 99) !important;
        }

        /* Paragraphe */
        .blocknote-wrapper .bn-paragraph {
          color: rgb(55, 65, 81) !important;
          line-height: 1.7 !important;
          margin: 0.5rem 0 !important;
        }

        /* Listes */
        .blocknote-wrapper ul,
        .blocknote-wrapper ol {
          color: rgb(55, 65, 81) !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
          list-style-position: outside !important;
        }

        .blocknote-wrapper li {
          color: rgb(55, 65, 81) !important;
          margin: 0.25rem 0 !important;
          position: relative !important;
        }

        /* Correction de l'alignement pendant le drag */
        .blocknote-wrapper .bn-block-outer.bn-is-dragging ul,
        .blocknote-wrapper .bn-block-outer.bn-is-dragging ol {
          padding-left: 1.5rem !important;
          margin-left: 0 !important;
        }

        .blocknote-wrapper .bn-block-outer.bn-is-dragging li {
          list-style-position: outside !important;
          text-indent: 0 !important;
          padding-left: 0 !important;
        }

        /* S'assurer que le contenu des listes reste aligné */
        .blocknote-wrapper .bn-list-item-content,
        .blocknote-wrapper li .bn-inline-content {
          display: inline-block !important;
          vertical-align: top !important;
          width: 100% !important;
        }

        /* Citations - avec un fond subtil */
        .blocknote-wrapper blockquote {
          border-left: 3px solid rgb(229, 231, 235) !important;
          padding-left: 1rem !important;
          color: rgb(107, 114, 128) !important;
          font-style: italic !important;
          margin: 1rem 0 !important;
          background-color: rgba(249, 250, 251, 0.5) !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
        }

        /* Code inline */
        .blocknote-wrapper code:not(pre code) {
          background-color: rgba(243, 244, 246, 0.8) !important;
          color: rgb(59, 130, 246) !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          font-family: 'Consolas', 'Monaco', monospace !important;
          font-size: 0.875em !important;
        }

        /* Code block */
        .blocknote-wrapper pre {
          background-color: rgba(249, 250, 251, 0.8) !important;
          color: rgb(31, 41, 55) !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          border: 1px solid rgba(229, 231, 235, 0.5) !important;
          margin: 1rem 0 !important;
        }

        .blocknote-wrapper pre code {
          background-color: transparent !important;
          padding: 0 !important;
          color: inherit !important;
          border: none !important;
        }

        /* Sélection */
        .blocknote-wrapper ::selection {
          background-color: rgb(191, 219, 254) !important;
          color: rgb(31, 41, 55) !important;
        }

        /* Toolbar flottante */
        .blocknote-wrapper .bn-toolbar,
        .blocknote-wrapper .mantine-Paper-root {
          background-color: white !important;
          border: 1px solid rgb(229, 231, 235) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border-radius: 0.5rem !important;
        }

        .blocknote-wrapper .bn-toolbar-button,
        .blocknote-wrapper .mantine-ActionIcon-root {
          color: rgb(75, 85, 99) !important;
          background-color: transparent !important;
        }

        .blocknote-wrapper .bn-toolbar-button:hover,
        .blocknote-wrapper .mantine-ActionIcon-root:hover {
          background-color: rgb(243, 244, 246) !important;
        }

        .blocknote-wrapper .bn-toolbar-button.bn-is-active,
        .blocknote-wrapper .mantine-ActionIcon-root[data-active="true"] {
          background-color: rgb(219, 234, 254) !important;
          color: rgb(59, 130, 246) !important;
        }

        /* Slash menu et tous les menus déroulants */
        .blocknote-wrapper .bn-slash-menu,
        .blocknote-wrapper .mantine-Menu-dropdown,
        .blocknote-wrapper .mantine-Popover-dropdown,
        .blocknote-wrapper .mantine-Select-dropdown,
        .blocknote-wrapper [data-radix-popper-content-wrapper],
        .mantine-Menu-dropdown,
        .mantine-Popover-dropdown {
          background-color: white !important;
          border: 1px solid rgb(229, 231, 235) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border-radius: 8px !important;
          z-index: 9999 !important;
          padding: 4px !important;
        }

        .blocknote-wrapper .bn-slash-menu-item,
        .blocknote-wrapper .mantine-Menu-item,
        .blocknote-wrapper .mantine-Select-item,
        .blocknote-wrapper [role="option"],
        .mantine-Menu-item {
          color: rgb(55, 65, 81) !important;
          background-color: white !important;
          font-size: 14px !important;
          padding: 6px 12px !important;
          margin: 0 !important;
          text-align: left !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .blocknote-wrapper .bn-slash-menu-item:hover,
        .blocknote-wrapper .mantine-Menu-item:hover,
        .blocknote-wrapper .mantine-Select-item:hover,
        .mantine-Menu-item:hover {
          background-color: rgb(243, 244, 246) !important;
          color: rgb(55, 65, 81) !important;
        }

        /* Fix pour les items de menu mal alignés */
        .mantine-Menu-itemLabel,
        .mantine-Menu-itemInner {
          width: 100% !important;
          text-align: left !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Fix pour les icônes dans les menus */
        .mantine-Menu-itemIcon {
          margin-right: 8px !important;
          margin-left: 0 !important;
        }

        /* S'assurer que le contenu des menus est visible */
        .blocknote-wrapper .mantine-Menu-label,
        .blocknote-wrapper .mantine-Select-label {
          color: rgb(107, 114, 128) !important;
          background-color: transparent !important;
        }

        /* Fix pour les options de select qui héritent du style global */
        .blocknote-wrapper select option,
        .blocknote-wrapper .mantine-Select-option,
        .blocknote-wrapper .bn-text-color-dropdown,
        .blocknote-wrapper .bn-toolbar-dropdown {
          background-color: white !important;
          color: rgb(55, 65, 81) !important;
        }

        /* Fix spécifique pour le dropdown de type de bloc (Text, Heading, etc.) */
        .blocknote-wrapper .bn-block-type-dropdown,
        .blocknote-wrapper .bn-block-type-dropdown-button {
          background-color: white !important;
          color: rgb(55, 65, 81) !important;
          border: 1px solid rgb(229, 231, 235) !important;
        }

        .blocknote-wrapper .bn-block-type-dropdown-item {
          background-color: white !important;
          color: rgb(55, 65, 81) !important;
          padding: 6px 12px !important;
        }

        .blocknote-wrapper .bn-block-type-dropdown-item:hover {
          background-color: rgb(243, 244, 246) !important;
        }

        /* Color picker et autres popups */
        .blocknote-wrapper .mantine-Popover-dropdown,
        .blocknote-wrapper .mantine-ColorPicker-wrapper {
          background-color: white !important;
          border: 1px solid rgb(229, 231, 235) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }

        .blocknote-wrapper .mantine-ColorSwatch-root {
          border: 1px solid rgb(229, 231, 235) !important;
        }

        /* Input et Select dans les menus */
        .blocknote-wrapper .mantine-Input-input,
        .blocknote-wrapper .mantine-Select-input,
        .blocknote-wrapper .mantine-TextInput-input {
          background-color: white !important;
          border: 1px solid rgb(229, 231, 235) !important;
          color: rgb(31, 41, 55) !important;
        }

        .blocknote-wrapper .mantine-Input-input:focus,
        .blocknote-wrapper .mantine-Select-input:focus,
        .blocknote-wrapper .mantine-TextInput-input:focus {
          border-color: rgb(59, 130, 246) !important;
          outline: none !important;
        }

        /* S'assurer que le texte dans les dropdowns est visible */
        .blocknote-wrapper .mantine-Select-item[data-selected],
        .blocknote-wrapper .mantine-Menu-item[data-hovered] {
          background-color: rgb(219, 234, 254) !important;
          color: rgb(59, 130, 246) !important;
        }

        /* Fix pour les items de liste dans les dropdowns */
        .blocknote-wrapper [role="option"],
        .blocknote-wrapper [role="menuitem"] {
          color: rgb(55, 65, 81) !important;
        }

        .blocknote-wrapper [role="option"]:hover,
        .blocknote-wrapper [role="menuitem"]:hover {
          background-color: rgb(243, 244, 246) !important;
        }

        /* Tables */
        .blocknote-wrapper table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1rem 0 !important;
          position: relative !important;
        }

        .blocknote-wrapper th,
        .blocknote-wrapper td {
          border: 1px solid rgb(229, 231, 235) !important;
          padding: 0.75rem !important;
          color: rgb(55, 65, 81) !important;
          position: relative !important;
        }

        .blocknote-wrapper th {
          background-color: rgba(249, 250, 251, 0.8) !important;
          font-weight: 600 !important;
        }

        .blocknote-wrapper td {
          background-color: rgba(255, 255, 255, 0.5) !important;
        }

        /* Note: BlockNote ne supporte pas nativement les contrôles de lignes/colonnes pour les tableaux */
        /* Le side menu fonctionne au niveau du bloc entier (table complète) */

        /* S'assurer que le side menu apparaît pour les tableaux */
        .blocknote-wrapper .bn-block-outer:has(table):hover .bn-side-menu {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Style spécifique pour les tableaux avec le side menu */
        .blocknote-wrapper .bn-block-outer:has(table) .bn-side-menu {
          margin-top: 10px !important;
        }

        /* Images */
        .blocknote-wrapper img {
          border-radius: 0.5rem !important;
          max-width: 100% !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }

        /* Liens */
        .blocknote-wrapper a {
          color: rgb(59, 130, 246) !important;
          text-decoration: none !important;
        }

        .blocknote-wrapper a:hover {
          text-decoration: underline !important;
        }

        /* Checkbox pour les todos */
        .blocknote-wrapper input[type="checkbox"] {
          accent-color: rgb(59, 130, 246) !important;
        }

        /* Divider */
        .blocknote-wrapper hr {
          border: none !important;
          border-top: 1px solid rgb(229, 231, 235) !important;
          margin: 2rem 0 !important;
        }

        /* Pour les highlights de couleur */
        .blocknote-wrapper [data-text-color="blue"] {
          color: rgb(59, 130, 246) !important;
        }

        .blocknote-wrapper [data-text-color="red"] {
          color: rgb(239, 68, 68) !important;
        }

        .blocknote-wrapper [data-text-color="green"] {
          color: rgb(34, 197, 94) !important;
        }

        .blocknote-wrapper [data-background-color="blue"] {
          background-color: rgba(219, 234, 254, 0.5) !important;
        }

        .blocknote-wrapper [data-background-color="red"] {
          background-color: rgba(254, 226, 226, 0.5) !important;
        }

        .blocknote-wrapper [data-background-color="green"] {
          background-color: rgba(220, 252, 231, 0.5) !important;
        }

        .blocknote-wrapper [data-background-color="yellow"] {
          background-color: rgba(254, 249, 195, 0.5) !important;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteEditorComponent;