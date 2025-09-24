// Service pour gérer la hiérarchie des pages type Notion

class PageHierarchyService {
  constructor() {
    this.pages = this.loadPages();
  }

  // Charger les pages depuis localStorage
  loadPages() {
    const saved = localStorage.getItem('pageHierarchy');
    if (saved) {
      return JSON.parse(saved);
    }

    // Structure initiale avec pages par défaut
    return {
      'dashboard': {
        id: 'dashboard',
        title: 'Tableau de bord',
        icon: 'home',
        parentId: null,
        children: [],
        order: 0,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'notes': {
        id: 'notes',
        title: 'Notes',
        icon: 'note',
        parentId: null,
        children: [],
        order: 1,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'history': {
        id: 'history',
        title: 'Historique',
        icon: 'history',
        parentId: null,
        children: [],
        order: 2,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'plan': {
        id: 'plan',
        title: 'Planification',
        icon: 'calendar',
        parentId: null,
        children: [],
        order: 3,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'improvements': {
        id: 'improvements',
        title: 'Améliorations',
        icon: 'target',
        parentId: null,
        children: [],
        order: 4,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  // Sauvegarder les pages
  savePages() {
    localStorage.setItem('pageHierarchy', JSON.stringify(this.pages));
  }

  // Obtenir toutes les pages
  getAllPages() {
    return this.pages;
  }

  // Obtenir une page par ID
  getPage(pageId) {
    return this.pages[pageId];
  }

  // Obtenir les pages racines (sans parent)
  getRootPages() {
    return Object.values(this.pages)
      .filter(page => !page.parentId)
      .sort((a, b) => a.order - b.order);
  }

  // Obtenir les enfants d'une page
  getChildren(pageId) {
    const page = this.pages[pageId];
    if (!page || !page.children) return [];

    return page.children
      .map(childId => this.pages[childId])
      .filter(child => child)
      .sort((a, b) => a.order - b.order);
  }

  // Obtenir le chemin (breadcrumbs) d'une page
  getPagePath(pageId) {
    const path = [];
    let currentPage = this.pages[pageId];

    while (currentPage && currentPage.parentId) {
      const parent = this.pages[currentPage.parentId];
      if (parent) {
        path.unshift(parent);
        currentPage = parent;
      } else {
        break;
      }
    }

    return path;
  }

  // Créer une nouvelle page
  createPage(parentId = null, title = 'New Page', icon = 'document') {
    const id = `page_${Date.now()}`;
    const newPage = {
      id,
      title,
      icon,
      parentId,
      children: [],
      order: Object.keys(this.pages).length,
      isExpanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.pages[id] = newPage;

    // Ajouter à la liste des enfants du parent
    if (parentId && this.pages[parentId]) {
      this.pages[parentId].children.push(id);
      this.pages[parentId].updatedAt = new Date().toISOString();
    }

    this.savePages();
    return newPage;
  }

  // Mettre à jour une page
  updatePage(pageId, updates) {
    if (!this.pages[pageId]) return null;

    this.pages[pageId] = {
      ...this.pages[pageId],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.savePages();
    return this.pages[pageId];
  }

  // Supprimer une page et ses enfants
  deletePage(pageId) {
    const page = this.pages[pageId];
    if (!page) return false;

    // Supprimer récursivement les enfants
    if (page.children) {
      page.children.forEach(childId => {
        this.deletePage(childId);
      });
    }

    // Retirer de la liste des enfants du parent
    if (page.parentId && this.pages[page.parentId]) {
      this.pages[page.parentId].children = this.pages[page.parentId].children
        .filter(id => id !== pageId);
      this.pages[page.parentId].updatedAt = new Date().toISOString();
    }

    // Supprimer la page
    delete this.pages[pageId];
    this.savePages();
    return true;
  }

  // Déplacer une page (changer parent ou ordre)
  movePage(pageId, newParentId, newOrder) {
    const page = this.pages[pageId];
    if (!page) return false;

    // Retirer de l'ancien parent
    if (page.parentId && this.pages[page.parentId]) {
      this.pages[page.parentId].children = this.pages[page.parentId].children
        .filter(id => id !== pageId);
    }

    // Ajouter au nouveau parent
    page.parentId = newParentId;
    page.order = newOrder;

    if (newParentId && this.pages[newParentId]) {
      if (!this.pages[newParentId].children) {
        this.pages[newParentId].children = [];
      }
      this.pages[newParentId].children.push(pageId);
      this.pages[newParentId].updatedAt = new Date().toISOString();
    }

    page.updatedAt = new Date().toISOString();
    this.savePages();
    return true;
  }

  // Toggle expand/collapse
  toggleExpand(pageId) {
    if (this.pages[pageId]) {
      this.pages[pageId].isExpanded = !this.pages[pageId].isExpanded;
      this.savePages();
      return this.pages[pageId].isExpanded;
    }
    return false;
  }

  // Rechercher des pages
  searchPages(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.pages).filter(page =>
      page.title.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton
export default new PageHierarchyService();