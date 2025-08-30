# Task Management Architecture

## 📋 Vue d'ensemble

Ce document décrit l'architecture modulaire de la gestion des tâches dans l'application de planification personnelle. Le système a été refactorisé pour passer d'un composant monolithique de 900+ lignes à une architecture modulaire et maintenable.

## 🏗️ Architecture des Composants

```
src/
├── pages/
│   ├── PlanView.jsx          # Orchestrateur principal (simplifié)
│   └── PlanView.old.jsx      # Sauvegarde de l'ancien code
│
└── components/tasks/
    ├── DraggableTable.jsx    # Tableau avec drag & drop (dnd-kit)
    ├── TaskFilters.jsx       # Filtres par priorité/statut/radar
    ├── TaskAutocomplete.jsx  # Autocomplétion avec suggestions radar/matière
    ├── TaskContextMenu.jsx   # Menu contextuel (clic droit)
    ├── TaskEditModal.jsx     # Modal d'édition des tâches
    └── ConfirmModal.jsx      # Modal de confirmation de suppression
```

## 🎯 Responsabilités des Composants

### PlanView.jsx (Orchestrateur)
- **Rôle** : Chef d'orchestre qui coordonne tous les composants
- **Responsabilités** :
  - Gestion des états globaux (filtres, modals)
  - Communication avec AppContext pour les données
  - Coordination entre les composants enfants
  - Gestion des raccourcis clavier (Ctrl+Enter)
- **Taille** : ~350 lignes (vs 900+ avant)

### DraggableTable.jsx (Tableau Interactif)
- **Rôle** : Affichage et manipulation des tâches
- **Responsabilités** :
  - Rendu du tableau avec colonnes configurables
  - Drag & drop avec @dnd-kit
  - Édition inline des cellules
  - Gestion des couleurs de priorité/statut
  - Intégration de l'autocomplétion pour l'ajout
- **Technologies** : @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

### TaskFilters.jsx (Système de Filtrage)
- **Rôle** : Filtrage avancé des tâches
- **Responsabilités** :
  - Filtres par priorité, statut, radar, matière
  - Interface utilisateur pliable/dépliable
  - Logique de filtrage hiérarchique (radar → matière)
  - Persistance de l'état des filtres

### TaskAutocomplete.jsx (Suggestions Intelligentes)
- **Rôle** : Autocomplétion avec tags radar/matière
- **Responsabilités** :
  - Suggestions basées sur les radars existants
  - Navigation clavier dans les suggestions
  - Création de tâches avec tags automatiques
  - Interface utilisateur fluide

### TaskContextMenu.jsx (Menu Contextuel)
- **Rôle** : Actions rapides sur les tâches
- **Responsabilités** :
  - Menu clic droit positionné dynamiquement
  - Actions : Éditer, Supprimer, Déplacer
  - Gestion des clics extérieurs
  - Interface responsive

### TaskEditModal.jsx (Édition Complète)
- **Rôle** : Édition détaillée des tâches
- **Responsabilités** :
  - Formulaire complet d'édition
  - Validation des données
  - Gestion des différents types (quotidien/hebdomadaire)
  - Interface modale responsive

### ConfirmModal.jsx (Confirmations)
- **Rôle** : Confirmations d'actions destructives
- **Responsabilités** :
  - Modal de confirmation simple
  - Actions d'annulation/confirmation
  - Interface accessible

## 📊 Structure des Données

### Tâche Quotidienne
```javascript
{
  id: string,
  name: string,
  type: 'daily',
  status: 'À faire' | 'En cours' | 'Terminé',
  priority: 'Pas de panique' | 'Important' | 'Très important',
  date: string (ISO),
  time: string (HH:MM),
  order: number,
  radar: string | null,      // ID du radar
  radarName: string | null,  // Nom du radar
  subject: string | null,    // ID de la matière
  subjectName: string | null // Nom de la matière
}
```

### Tâche Hebdomadaire
```javascript
{
  id: string,
  name: string,
  type: 'weekly',
  status: 'À faire' | 'En cours' | 'Terminé',
  priority: 'Pas de panique' | 'Important' | 'Très important',
  startDate: string (ISO),
  endDate: string (ISO),
  time: string (HH:MM),
  order: number,
  radar: string | null,
  radarName: string | null,
  subject: string | null,
  subjectName: string | null
}
```

## 🎨 Design System

### Couleurs de Priorité
- **Pas de panique** : `#0ea5e9` (Bleu ciel)
- **Important** : `#ef4444` (Rouge)
- **Très important** : `#8b5cf6` (Violet)

### Couleurs de Statut
- **À faire** : `#9ca3af` (Gris)
- **En cours** : `#3b82f6` (Bleu)
- **Terminé** : `#22c55e` (Vert)

### Style Visuel
- **Thème** : Dark minimaliste
- **Effets** : Neumorphism/Glass avec `backdrop-blur` et transparence
- **Bordures** : Subtiles avec `border-gray-700/50`
- **Transitions** : Fluides avec `transition-colors`

## 🔄 Flux d'Interaction

### Ajout de Tâche
1. Utilisateur tape dans l'autocomplétion
2. TaskAutocomplete propose suggestions radar/matière
3. Sélection → création tâche avec tags
4. DraggableTable met à jour l'affichage
5. AppContext sauvegarde les données

### Drag & Drop
1. Utilisateur commence le drag sur une ligne
2. DraggableTable utilise @dnd-kit pour le suivi
3. Indicateurs visuels pendant le drag
4. Drop → réorganisation et sauvegarde ordre

### Édition
1. Double-clic → édition inline (cellule)
2. Clic droit → menu contextuel → édition modale
3. Validation → mise à jour tâche
4. Sauvegarde automatique via AppContext

### Filtrage
1. TaskFilters change l'état des filtres
2. PlanView applique les filtres aux listes
3. DraggableTable affiche résultats filtrés
4. Mise à jour en temps réel

## 🔧 Technologies Utilisées

### Core Libraries
- **React 18** : Framework principal
- **@dnd-kit/core** : Système de drag & drop
- **@dnd-kit/sortable** : Listes triables
- **@dnd-kit/utilities** : Utilitaires CSS transform

### Styling
- **Tailwind CSS** : Framework CSS utilitaire
- **CSS-in-JS** : Pour les couleurs dynamiques
- **Backdrop-filter** : Effets glass/blur

### Architecture
- **React Context** : Gestion d'état global (AppContext)
- **Local Storage** : Persistance des données
- **Component Pattern** : Architecture modulaire

## 📈 Avantages de l'Architecture

### Maintenabilité
- **Séparation des responsabilités** : Chaque composant a un rôle précis
- **Code lisible** : Fichiers de 100-400 lignes vs 900+
- **Debugging facilité** : Erreurs isolées par composant

### Réutilisabilité
- **Composants modulaires** : Réutilisables dans d'autres pages
- **API cohérente** : Props standardisées
- **Flexibilité** : Configuration via props

### Performance
- **Rendering optimisé** : Re-render limité aux composants concernés
- **Lazy loading** : Chargement conditionnel des modals
- **Memoization** : Optimisations React possibles

### Évolutivité
- **Ajout de fonctionnalités** : Nouveaux composants isolés
- **Modifications** : Impact limité aux composants concernés
- **Tests** : Testabilité unitaire améliorée

## 🚀 Prochaines Étapes

### Améliorations Possibles
1. **Tests unitaires** pour chaque composant
2. **Accessibilité** (ARIA, navigation clavier)
3. **Export/Import** des tâches
4. **Notifications** et rappels
5. **Synchronisation** cloud
6. **Thèmes** personnalisables
7. **Raccourcis clavier** étendus
8. **Historique** des modifications

### Optimisations Techniques
1. **React.memo** pour éviter les re-renders
2. **useCallback** pour les fonctions
3. **Virtual scrolling** pour grandes listes
4. **Web Workers** pour traitement lourd
5. **Service Worker** pour mode offline

---

*Document créé le 30 août 2025 - Architecture Task Management v2.0*