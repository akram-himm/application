import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NotionEditor from '../components/notion/NotionEditor';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Page introuvable</h2>
          <button
            onClick={() => navigate('/')}
            className={uniformStyles.button.secondary}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* En-tête de la page */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Icône */}
            <button className="text-3xl hover:bg-gray-100 rounded-lg p-2 transition-colors">
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
                className="flex-1 text-3xl font-bold text-gray-900 outline-none border-b-2 border-blue-500"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setEditingTitle(true)}
                className="flex-1 text-3xl font-bold text-gray-900 cursor-text hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1"
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
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur Notion */}
      <NotionEditor
        pageId={page.id}
        initialBlocks={page.content?.blocks || []}
        readOnly={false}
      />
    </div>
  );
};

export default CustomPage;