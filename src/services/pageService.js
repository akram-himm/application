// Service de gestion des pages personnalisées
const STORAGE_KEY = 'custom_pages';
const PAGES_ORDER_KEY = 'pages_order';

// Pages par défaut (non modifiables dans leur structure)
export const DEFAULT_PAGES = [
  { id: 'tasks', name: 'Tâches', icon: '✅', path: '/', fixed: true },
  { id: 'plan', name: 'Plan', icon: '📋', path: '/plan', fixed: true },
  { id: 'calendar', name: 'Calendrier', icon: '📅', path: '/calendar', fixed: true },
  { id: 'improvements', name: 'Améliorations', icon: '🚀', path: '/improvements', fixed: true },
  { id: 'trash', name: 'Corbeille', icon: '🗑️', path: '/trash', fixed: true }
];

// Charger les pages personnalisées
export const loadCustomPages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des pages:', error);
    return [];
  }
};

// Sauvegarder les pages personnalisées
export const saveCustomPages = (pages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des pages:', error);
    return false;
  }
};

// Charger l'ordre des pages
export const loadPagesOrder = () => {
  try {
    const saved = localStorage.getItem(PAGES_ORDER_KEY);
    if (!saved) {
      // Ordre par défaut
      return [...DEFAULT_PAGES.map(p => p.id), ...loadCustomPages().map(p => p.id)];
    }
    return JSON.parse(saved);
  } catch (error) {
    console.error('Erreur lors du chargement de l\'ordre des pages:', error);
    return DEFAULT_PAGES.map(p => p.id);
  }
};

// Sauvegarder l'ordre des pages
export const savePagesOrder = (order) => {
  try {
    localStorage.setItem(PAGES_ORDER_KEY, JSON.stringify(order));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre des pages:', error);
    return false;
  }
};

// Créer une nouvelle page
export const createPage = (name, icon = '📝') => {
  const customPages = loadCustomPages();
  const newPage = {
    id: `custom-${Date.now()}`,
    name: name,
    icon: icon,
    path: `/page/${Date.now()}`,
    fixed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: 'heading1',
          content: name,
          properties: {}
        }
      ]
    }
  };

  customPages.push(newPage);
  saveCustomPages(customPages);

  // Mettre à jour l'ordre
  const order = loadPagesOrder();
  order.push(newPage.id);
  savePagesOrder(order);

  return newPage;
};

// Mettre à jour une page
export const updatePage = (pageId, updates) => {
  const customPages = loadCustomPages();
  const index = customPages.findIndex(p => p.id === pageId);

  if (index !== -1) {
    customPages[index] = {
      ...customPages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveCustomPages(customPages);
    return customPages[index];
  }

  // Vérifier si c'est une page par défaut (on peut juste changer le nom)
  const defaultPage = DEFAULT_PAGES.find(p => p.id === pageId);
  if (defaultPage && updates.name) {
    // Sauvegarder les renommages des pages par défaut séparément
    const renames = JSON.parse(localStorage.getItem('page_renames') || '{}');
    renames[pageId] = updates.name;
    localStorage.setItem('page_renames', JSON.stringify(renames));
    return { ...defaultPage, name: updates.name };
  }

  return null;
};

// Supprimer une page
export const deletePage = (pageId) => {
  const customPages = loadCustomPages();
  const filtered = customPages.filter(p => p.id !== pageId);

  if (filtered.length !== customPages.length) {
    saveCustomPages(filtered);

    // Mettre à jour l'ordre
    const order = loadPagesOrder();
    const newOrder = order.filter(id => id !== pageId);
    savePagesOrder(newOrder);

    return true;
  }
  return false;
};

// Obtenir toutes les pages dans l'ordre
export const getAllPages = () => {
  const customPages = loadCustomPages();
  const order = loadPagesOrder();
  const renames = JSON.parse(localStorage.getItem('page_renames') || '{}');

  // Appliquer les renommages aux pages par défaut
  const defaultPagesWithRenames = DEFAULT_PAGES.map(page => ({
    ...page,
    name: renames[page.id] || page.name
  }));

  const allPages = [...defaultPagesWithRenames, ...customPages];

  // Trier selon l'ordre sauvegardé
  const ordered = [];
  order.forEach(id => {
    const page = allPages.find(p => p.id === id);
    if (page) ordered.push(page);
  });

  // Ajouter les pages qui ne sont pas dans l'ordre (nouvelles pages)
  allPages.forEach(page => {
    if (!ordered.find(p => p.id === page.id)) {
      ordered.push(page);
    }
  });

  return ordered;
};

// Sauvegarder le contenu d'une page
export const savePageContent = (pageId, blocks) => {
  const customPages = loadCustomPages();
  const page = customPages.find(p => p.id === pageId);

  if (page) {
    page.content = { blocks };
    page.updatedAt = new Date().toISOString();
    saveCustomPages(customPages);
    return true;
  }

  // Pour les pages personnalisées stockées séparément
  const key = `page_content_${pageId}`;
  try {
    localStorage.setItem(key, JSON.stringify({ blocks, updatedAt: new Date().toISOString() }));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du contenu:', error);
    return false;
  }
};

// Charger le contenu d'une page
export const loadPageContent = (pageId) => {
  // D'abord vérifier dans les pages personnalisées
  const customPages = loadCustomPages();
  const page = customPages.find(p => p.id === pageId);

  if (page && page.content) {
    return page.content;
  }

  // Sinon chercher dans le stockage séparé
  const key = `page_content_${pageId}`;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { blocks: [] };
  } catch (error) {
    console.error('Erreur lors du chargement du contenu:', error);
    return { blocks: [] };
  }
};