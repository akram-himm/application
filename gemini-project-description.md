# Projet Gestion Desktop - Description Complète

## Vue d'ensemble

Tu vas m'aider à créer une application desktop complète avec Electron + React + Vite + Tailwind CSS. C'est un système de gestion des tâches personnel basé sur une méthode unique appelée "Système d'Akram".

## Concept du Système d'Akram

Le système d'Akram est une méthode de suivi qui encourage le travail régulier sur tous les domaines de vie. Il fonctionne ainsi :
- Chaque domaine (radar) contient plusieurs matières
- Si une matière n'a pas progressé pendant X jours (configurable), elle subit une pénalité visuelle
- La pénalité apparaît sur le graphique radar (valeur diminuée, couleur d'alerte)
- Cela encourage l'utilisateur à travailler régulièrement sur toutes les matières

## Structure de l'application

L'application comporte 4 pages principales :

### 1. Dashboard (/)
- Grille de cartes représentant les différents domaines (radars)
- Drag & drop pour réorganiser les cartes
- Modal pour créer/éditer des radars
- Navigation vers la vue radar ou la page plan

### 2. Vue Radar (/radar/:radarId)
- Graphique radar en Canvas montrant les matières et leur progression
- Système d'Akram avec timer et pénalités visuelles
- Tooltips interactifs au survol
- Modal pour ajouter/éditer des matières
- Clic sur une matière → navigation vers ses chapitres

### 3. Vue Chapitres (/radar/:radarId/subject/:subjectId)
- Double vue : Table et Kanban
- Hiérarchie : Chapitres → Sous-chapitres
- Drag & drop pour réorganiser
- Calcul automatique de la progression
- Édition inline des propriétés

### 4. Page Plan (/plan)
- Planification quotidienne et hebdomadaire
- Système d'autocomplete pour lier les tâches aux radars/matières
- Navigation contextuelle vers les pages liées
- Indicateurs de priorité et statut

## Technologies utilisées

- **Frontend** : React 18 avec hooks
- **Routing** : React Router v6
- **Build** : Vite
- **Styles** : Tailwind CSS
- **Desktop** : Electron
- **Persistance** : LocalStorage

## Design

- **Thème** : Dark mode exclusivement
- **Couleurs principales** :
  - Background principal : rgb(25, 25, 25)
  - Background secondaire : rgb(32, 32, 32)
  - Background tertiaire : rgb(37, 37, 37)
  - Bordures : rgb(47, 47, 47)
  - Texte principal : rgba(255, 255, 255, 0.81)
  - Texte secondaire : rgba(255, 255, 255, 0.46)
  - Accent (bleu) : rgb(35, 131, 226)
  - Succès (vert) : rgb(34, 197, 94)
  - Alerte (jaune) : rgb(251, 191, 36)
  - Erreur (rouge) : rgb(239, 68, 68)

## Structure des fichiers que tu vas recevoir

```
gestion_desktop/
├── package.json                    # Configuration npm
├── vite.config.js                 # Configuration Vite
├── tailwind.config.js            # Configuration Tailwind
├── postcss.config.js             # Configuration PostCSS
├── index.html                    # HTML principal
├── electron/
│   └── main.js                   # Point d'entrée Electron
├── src/
│   ├── main.jsx                  # Point d'entrée React
│   ├── App.jsx                   # Composant racine avec routes
│   ├── App.css                   # Styles spécifiques à App
│   ├── index.css                 # Styles globaux et Tailwind
│   │
│   ├── services/
│   │   └── localStorage.js       # Gestion de la persistance
│   │
│   ├── contexts/
│   │   ├── AppContext.jsx       # Contexte global (radars, tasks)
│   │   └── AkramContext.jsx     # Contexte du système d'Akram
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx        # Page d'accueil
│   │   ├── RadarView.jsx        # Page radar
│   │   ├── ChaptersView.jsx     # Page chapitres
│   │   └── PlanView.jsx         # Page planification
│   │
│   └── components/
│       ├── dashboard/
│       │   └── RadarModal.jsx   # Modal création/édition radar
│       │
│       ├── radar/
│       │   ├── RadarChart.jsx      # Graphique radar Canvas
│       │   ├── AkramControl.jsx    # Contrôles système d'Akram
│       │   ├── FloatingAlert.jsx   # Alertes flottantes
│       │   └── SubjectModal.jsx    # Modal création/édition matière
│       │
│       ├── chapters/
│       │   ├── ChaptersTable.jsx   # Vue table
│       │   ├── ChaptersKanban.jsx  # Vue kanban
│       │   └── ChapterModal.jsx    # Modal création/édition
│       │
│       └── plan/
│           ├── TaskAutocomplete.jsx # Autocomplete intelligent
│           ├── DailyView.jsx        # Vue quotidienne
│           ├── WeeklyView.jsx       # Vue hebdomadaire
│           └── TaskModal.jsx        # Modal création/édition tâche
```

## Instructions importantes

1. **Imports** : Utilise toujours des imports relatifs corrects selon la structure
2. **Styles** : Utilise les classes Tailwind avec les valeurs exactes (ex: `bg-[rgb(25,25,25)]`)
3. **État** : Utilise les contextes (AppContext et AkramContext) pour partager l'état
4. **Navigation** : Utilise les hooks de React Router v6 (useNavigate, useParams)
5. **Persistance** : Toute modification doit être sauvegardée via localStorage.js

## Structure des données

### Radar
```javascript
{
  id: 'bac',
  name: 'BAC',
  icon: '📚',
  description: 'Préparation aux examens',
  subjects: [
    {
      id: 'math',
      name: 'Mathématiques',
      value: 75,              // Progression 0-100
      max: 100,
      lastProgress: '2024-01-15T10:00:00.000Z',
      chapters: [...]         // Optionnel
    }
  ]
}
```

### Task
```javascript
{
  id: 1,
  name: 'Réviser les intégrales',
  customName: 'Chapitre 3',    // Optionnel
  status: 'in-progress',        // 'todo' | 'in-progress' | 'done'
  priority: 'high',             // 'low' | 'medium' | 'high'
  tag: { 
    radar: 'bac',              // ID du radar
    subject: 'math'            // ID de la matière
  },
  date: '2024-01-15T10:00:00.000Z',
  completed: false
}
```

## Ordre de développement

Je vais te donner les fichiers dans cet ordre exact :
1. Configuration de base (package.json, configs, etc.)
2. Fichiers d'entrée (index.html, main.jsx, App.jsx)
3. Services et contextes
4. Pages (Dashboard → Radar → Chapters → Plan)
5. Composants (par feature)

## Ce que j'attends de toi

Pour chaque fichier que je te donnerai :
1. Crée-le exactement à l'emplacement indiqué
2. Ne modifie aucun import ou structure
3. Le code doit être complet et fonctionnel
4. Respecte le design et les couleurs exactes
5. N'ajoute pas de commentaires inutiles

Prêt ? Je vais maintenant te donner les fichiers un par un.