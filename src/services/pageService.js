// Service de gestion des pages personnalisées
import { addToTrash } from './trashService.js';
import { getCurrentWorkspace } from './workspaceService';

// Obtenir les clés de stockage dynamiques en fonction du workspace actuel
const getStorageKeys = () => {
  const workspace = getCurrentWorkspace();
  if (!workspace || !workspace.dataKeys) {
    // Clés par défaut pour la compatibilité
    return {
      STORAGE_KEY: 'custom_pages',
      PAGES_ORDER_KEY: 'pages_order'
    };
  }

  return {
    STORAGE_KEY: workspace.dataKeys.pages || 'custom_pages',
    PAGES_ORDER_KEY: `${workspace.dataKeys.pages}_order` || 'pages_order'
  };
};

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
    const { STORAGE_KEY } = getStorageKeys();
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
    const { STORAGE_KEY } = getStorageKeys();
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
    const { PAGES_ORDER_KEY } = getStorageKeys();
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
    const { PAGES_ORDER_KEY } = getStorageKeys();
    localStorage.setItem(PAGES_ORDER_KEY, JSON.stringify(order));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'ordre des pages:', error);
    return false;
  }
};

// Créer une nouvelle page
export const createPage = (name, icon = '📝', content = null) => {
  const customPages = loadCustomPages();
  const pageId = Date.now().toString();
  const pagePath = name.toLowerCase().replace(/\s+/g, '-');

  const newPage = {
    id: pageId,
    name: name,
    icon: icon,
    path: `/page/${pagePath}`,
    fixed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: content || {
      blocks: []
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

// Supprimer une page (déplacer vers la corbeille)
export const deletePage = (pageId) => {
  const customPages = loadCustomPages();
  const pageToDelete = customPages.find(p => p.id === pageId);

  if (pageToDelete) {
    // Ajouter la page à la corbeille avec le type 'page'
    const trashedPage = {
      ...pageToDelete,
      type: 'page',
      originalId: pageToDelete.id
    };
    addToTrash(trashedPage);

    // Retirer la page de la liste des pages actives
    const filtered = customPages.filter(p => p.id !== pageId);
    saveCustomPages(filtered);

    // Mettre à jour l'ordre
    const order = loadPagesOrder();
    const newOrder = order.filter(id => id !== pageId);
    savePagesOrder(newOrder);

    // Supprimer le contenu stocké séparément si existe
    const contentKey = `page_content_${pageId}`;
    try {
      localStorage.removeItem(contentKey);
    } catch (error) {
      console.error('Erreur lors de la suppression du contenu:', error);
    }

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
export const savePageContent = (pageId, content) => {
  const customPages = loadCustomPages();
  const pageIndex = customPages.findIndex(p => p.id === pageId);

  if (pageIndex !== -1) {
    customPages[pageIndex].content = content;
    customPages[pageIndex].updatedAt = new Date().toISOString();
    saveCustomPages(customPages);
    return true;
  }

  // Pour les pages personnalisées stockées séparément
  const key = `page_content_${pageId}`;
  try {
    localStorage.setItem(key, JSON.stringify({ ...content, updatedAt: new Date().toISOString() }));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du contenu:', error);
    return false;
  }
};

// Charger le contenu d'une page
// Restaurer une page depuis la corbeille
export const restorePage = (trashedPage) => {
  // Retirer les propriétés de corbeille
  const page = { ...trashedPage };
  delete page.trashedAt;
  delete page.type;
  page.id = page.originalId || page.id;
  delete page.originalId;

  // Ajouter la page restaurée aux pages personnalisées
  const customPages = loadCustomPages();
  customPages.push(page);
  saveCustomPages(customPages);

  // Ajouter à l'ordre des pages
  const order = loadPagesOrder();
  order.push(page.id);
  savePagesOrder(order);

  return page;
};

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

// Obtenir une page par son path
export const getPageByPath = (path) => {
  const customPages = loadCustomPages();
  return customPages.find(p => p.path === path);
};

// Obtenir une page par son ID
export const getPageById = (id) => {
  const customPages = loadCustomPages();
  return customPages.find(p => p.id === id);
};