import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import * as pageService from '../services/pageService';
import { DatabaseBlock } from '../components/BlockNote/DatabaseBlock';

const PageView = () => {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageEmoji, setPageEmoji] = useState('📄');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Emojis disponibles
  const availableEmojis = ['📄', '📝', '📋', '📊', '💡', '🎯', '📚', '✨', '🎨', '🚀', '💼', '📌',
                          '📖', '🔖', '📑', '📂', '🗂️', '📁', '🎪', '🎭', '🎪', '🌟', '⭐', '🔥'];

  const [initialContent, setInitialContent] = useState(undefined);

  // Initialiser BlockNote - temporairement sans blocs custom pour éviter les erreurs
  const editor = useCreateBlockNote({
    initialContent: initialContent,
    // blockSpecs: {
    //   database: DatabaseBlock,
    // },
  });

  // Charger la page
  useEffect(() => {
    const loadedPage = pageService.getPageByPath(`/page/${pageId}`);
    if (loadedPage) {
      setPage(loadedPage);
      setPageTitle(loadedPage.name);
      setPageEmoji(loadedPage.icon || '📄');

      // Définir le contenu initial si disponible
      if (loadedPage.content?.blocks) {
        setInitialContent(loadedPage.content.blocks);
      }
    }
  }, [pageId]);

  // Sauvegarder automatiquement le contenu
  const handleContentChange = () => {
    if (page) {
      const blocks = editor.document;
      pageService.savePageContent(page.id, { blocks });
    }
  };

  // Sauvegarder le titre
  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (page && pageTitle.trim()) {
      pageService.updatePage(page.id, { name: pageTitle });
      setPage({ ...page, name: pageTitle });
    }
  };

  // Changer l'emoji
  const handleEmojiChange = (emoji) => {
    setPageEmoji(emoji);
    setShowEmojiPicker(false);
    if (page) {
      pageService.updatePage(page.id, { icon: emoji });
      setPage({ ...page, icon: emoji });
    }
  };

  if (!page) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Page non trouvée</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header de page (style Notion) */}
      <div className="max-w-4xl mx-auto pt-20 px-16">
        {/* Emoji cliquable */}
        <div className="relative inline-block">
          <button
            className="text-7xl mb-4 hover:bg-gray-100 p-2 rounded transition-all duration-20"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {pageEmoji}
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
              <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
                {availableEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiChange(emoji)}
                    className="w-10 h-10 rounded hover:bg-gray-100 flex items-center justify-center text-2xl transition-all duration-20"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Titre éditable */}
        {isEditingTitle ? (
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleSave();
              } else if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setPageTitle(page.name);
              }
            }}
            className="w-full text-5xl font-bold text-gray-900 border-none outline-none bg-transparent"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-5xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-2 -mx-2 py-1 rounded transition-all duration-20"
          >
            {pageTitle || 'Sans titre'}
          </h1>
        )}

        {/* Métadonnées */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>Créé le {new Date(page.createdAt).toLocaleDateString('fr-FR')}</span>
          {page.updatedAt && (
            <span>• Modifié le {new Date(page.updatedAt).toLocaleDateString('fr-FR')}</span>
          )}
        </div>
      </div>

      {/* Éditeur BlockNote */}
      <div className="max-w-4xl mx-auto px-16 py-8">
        <BlockNoteView
          editor={editor}
          onChange={handleContentChange}
          theme="light"
        />
      </div>
    </div>
  );
};

export default PageView;