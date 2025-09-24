# Plan d'implémentation des fonctionnalités Notion

## 📋 Vue d'ensemble
Transformer l'application en un système modulaire type Notion avec pages divisibles, composants repositionnables et navigation hiérarchique.

## 🎯 Objectifs principaux

### 1. **Système de Layout Divisible (Split View)**
- Permettre de diviser n'importe quelle page en plusieurs sections
- Chaque section peut contenir un composant différent (BlockNote, Radar, Todo, Tableau, etc.)
- Positions possibles : gauche, droite, haut, bas
- Possibilité de supprimer n'importe quelle section

### 2. **Pages Personnalisables**
- Renommer toutes les pages (fixes et personnalisées)
- Titre éditable directement dans le header de la page
- Icône personnalisable pour chaque page

### 3. **Navigation Hiérarchique (Headers/Sous-pages)**
- Les headers (H1, H2, H3) créés dans une page deviennent des sous-pages
- Affichage dans la sidebar avec structure arborescente
- Possibilité d'expand/collapse les sous-pages
- Navigation directe vers les sections via la sidebar

### 4. **Composants Modulaires**
- Tableau réutilisable (même style/design que l'existant)
- Tous les composants peuvent être ajoutés n'importe où
- API unifiée pour tous les composants

## 📝 Plan d'implémentation détaillé

### Phase 1: Infrastructure de base

#### 1.1 Créer un système de Layout Manager
```javascript
// src/components/layout/LayoutManager.jsx
- Gestion des divisions de page (split panes)
- Drag & drop pour redimensionner
- Sauvegarde de la configuration dans localStorage
```

#### 1.2 Composants de base pour le layout
```javascript
// src/components/layout/SplitPane.jsx
- Component pour diviser l'écran
- Options: vertical/horizontal split
- Resize handle draggable

// src/components/layout/LayoutDropdown.jsx
- Menu pour ajouter/supprimer/repositionner des composants
- Options: "Ajouter à gauche", "Ajouter à droite", etc.
```

#### 1.3 Context pour la gestion des layouts
```javascript
// src/contexts/LayoutContext.jsx
- État global des layouts de chaque page
- Fonctions pour ajouter/supprimer/déplacer des sections
- Persistance dans localStorage
```

### Phase 2: Pages éditables

#### 2.1 Header éditable pour toutes les pages
```javascript
// src/components/PageHeader.jsx
- Titre éditable inline (comme Notion)
- Icône changeable
- Breadcrumb si sous-page
```

#### 2.2 Service de gestion des pages
```javascript
// src/services/pageConfigService.js
- Renommer les pages (même les fixes)
- Sauvegarder les configurations
- Gérer les icônes personnalisées
```

### Phase 3: Navigation hiérarchique

#### 3.1 Parser de headers
```javascript
// src/utils/headerParser.js
- Extraire les H1, H2, H3 du contenu BlockNote
- Créer une structure arborescente
- Générer des IDs uniques pour chaque section
```

#### 3.2 Sidebar améliorée
```javascript
// src/components/EnhancedSidebar.jsx
- Afficher les sous-pages (headers)
- Expand/collapse pour chaque page parent
- Navigation par ancre vers les sections
- Indicateur de position actuelle
```

### Phase 4: Composants modulaires

#### 4.1 Registry de composants
```javascript
// src/components/registry/ComponentRegistry.js
const components = {
  'blocknote': BlockNoteEditor,
  'radar': RadarChart,
  'todo': TodoList,
  'table': DataTable,
  'calendar': Calendar,
  // etc...
}
```

#### 4.2 Wrapper universel
```javascript
// src/components/UniversalComponentWrapper.jsx
- Charge dynamiquement le bon composant
- Gère les props et la configuration
- Toolbar pour actions (déplacer, supprimer, etc.)
```

### Phase 5: Interface utilisateur

#### 5.1 Menu contextuel amélioré
- Click droit sur n'importe quelle section
- Options: "Diviser horizontalement", "Diviser verticalement"
- "Ajouter composant", "Supprimer", "Déplacer"

#### 5.2 Barre d'outils flottante
- Apparaît au survol d'une section
- Boutons pour les actions rapides
- Drag handle pour réorganiser

## 🔧 Structure des données

### Configuration d'une page
```javascript
{
  id: "page-123",
  name: "Ma Page",
  icon: "document",
  layout: {
    type: "split",
    direction: "horizontal",
    ratio: [50, 50],
    children: [
      {
        type: "component",
        component: "blocknote",
        props: { content: "..." }
      },
      {
        type: "split",
        direction: "vertical",
        ratio: [60, 40],
        children: [
          {
            type: "component",
            component: "radar",
            props: { ... }
          },
          {
            type: "component",
            component: "table",
            props: { ... }
          }
        ]
      }
    ]
  },
  headers: [
    {
      id: "header-1",
      text: "Introduction",
      level: 1,
      children: [
        {
          id: "header-1-1",
          text: "Contexte",
          level: 2
        }
      ]
    }
  ]
}
```

## 🚀 Ordre d'implémentation recommandé

1. **Semaine 1**: Infrastructure de Layout
   - LayoutManager
   - SplitPane component
   - LayoutContext

2. **Semaine 2**: Pages éditables
   - PageHeader component
   - Service de configuration
   - Sauvegarde des modifications

3. **Semaine 3**: Navigation hiérarchique
   - Parser de headers
   - Sidebar améliorée
   - Navigation par ancres

4. **Semaine 4**: Composants modulaires
   - Registry de composants
   - Wrapper universel
   - Intégration avec le layout

5. **Semaine 5**: Polish & UX
   - Animations
   - Raccourcis clavier
   - Optimisations

## ⚙️ Technologies nécessaires

- **react-split-pane** ou **allotment**: Pour les split panes
- **react-dnd** ou **@dnd-kit**: Pour le drag & drop
- **immer**: Pour la gestion immutable des états complexes
- **react-hotkeys-hook**: Pour les raccourcis clavier

## 🎨 Exemples d'utilisation

### Exemple 1: Page Radar avec BlockNote à droite
```
[====== Radar ======][== BlockNote ==]
[                   ][              ]
[                   ][              ]
[                   ][              ]
```

### Exemple 2: Layout complexe
```
[========= BlockNote =========]
[                             ]
[==============================]
[== Todo ==][====== Table ====]
[         ][                  ]
```

### Exemple 3: Sidebar avec sous-pages
```
📄 Ma Page Principale
  ├─ 📍 Introduction
  ├─ 📍 Chapitre 1
  │   ├─ Section 1.1
  │   └─ Section 1.2
  └─ 📍 Conclusion
```

## 📌 Points d'attention

1. **Performance**: Utiliser React.memo et useMemo pour éviter les re-renders
2. **Sauvegarde**: Auto-save avec debounce
3. **Responsive**: S'adapter aux petits écrans
4. **Accessibilité**: Raccourcis clavier et navigation au clavier
5. **Undo/Redo**: Intégrer avec le système existant

## ❓ Questions à clarifier

1. **Limite de divisions**: Combien de niveaux de split maximum ?
2. **Composants disponibles**: Liste complète des composants à rendre modulaires ?
3. **Synchronisation**: Les layouts doivent-ils être synchronisés entre workspaces ?
4. **Permissions**: Toutes les pages peuvent-elles être modifiées ou certaines sont protégées ?
5. **Templates**: Voulez-vous des templates de layout prédéfinis ?

## 🔄 Prochaines étapes

1. Valider ce plan avec vous
2. Créer les composants de base (LayoutManager, SplitPane)
3. Implémenter un POC sur une page test
4. Itérer based on feedback
5. Déployer progressivement sur toutes les pages