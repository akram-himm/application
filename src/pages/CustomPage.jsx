import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlockNoteEditorComponent from '../components/BlockNoteEditor/BlockNoteEditor';
import { loadPageContent, updatePage, getAllPages } from '../services/pageService';
import { uniformStyles } from '../styles/uniformStyles';

const CustomPage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    // Charger la page
    const pages = getAllPages();
    const currentPage = pages.find(p => p.path === `/page/${pageId}`);

    if (currentPage) {
      setPage(currentPage);
      setNewTitle(currentPage.name);

      // Charger le contenu
      const content = loadPageContent(currentPage.id);
      if (content && content.blocks) {
        setPage(prev => ({ ...prev, content }));
      }
    } else {
      // Page non trouvée
      navigate('/');
    }

    setLoading(false);
  }, [pageId, navigate]);

  const handleTitleSave = () => {
    if (newTitle.trim() && page) {
      updatePage(page.id, { name: newTitle.trim() });
      setPage(prev => ({ ...prev, name: newTitle.trim() }));
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setNewTitle(page.name);
      setEditingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className={uniformStyles.layout.page + ' flex items-center justify-center'}>
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className={uniformStyles.layout.page + ' flex items-center justify-center'}>
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-700 mb-4">Page introuvable</h2>
          <button
            onClick={() => navigate('/')}
            className={uniformStyles.button.primary}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-6xl mx-auto p-6">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {/* Icône */}
            <button className="text-4xl p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {page.icon}
            </button>

            {/* Titre */}
            {editingTitle ? (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="flex-1 text-3xl font-light text-gray-800 bg-white/70 outline-none border-b-2 border-blue-400 px-2"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setEditingTitle(true)}
                className="flex-1 text-3xl font-light text-gray-800 cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              >
                {page.name}
              </h1>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Plus d'options"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Éditeur BlockNote */}
        <BlockNoteEditorComponent
          pageId={page.id}
          initialContent={page.content?.blocks || null}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default CustomPage;