## 🚀 Setup Rapide

### 1. Installer les dépendances API
```bash
npm install express cors
```

### 2. Lancer l'application avec l'API
```bash
# Modifier electron/main.js pour inclure le serveur API
# Ou lancer séparément:
node electron/main-with-api.js
```

### 3. Configurer ChatGPT

#### Option A: Custom GPT (Recommandé)
1. Aller sur ChatGPT Plus
2. Créer un nouveau GPT
3. Dans "Actions", ajouter :

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "Desktop App Controller",
    "version": "1.0.0"
  },
  "servers": [
    {"url": "http://localhost:3456"}
  ],
  "paths": {
    "/api/status": {
      "get": {
        "summary": "Vérifier le statut",
        "responses": {"200": {"description": "Success"}}
      }
    },
    "/api/pages/create": {
      "post": {
        "summary": "Créer une page",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {"type": "string"},
                  "icon": {"type": "string"},
                  "content": {"type": "string"}
                }
              }
            }
          }
        }
      }
    },
    "/api/tasks/create": {
      "post": {
        "summary": "Créer une tâche",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {"type": "string"},
                  "description": {"type": "string"},
                  "priority": {"type": "string"}
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Option B: Extension Chrome
1. Charger l'extension dans Chrome
2. L'extension détectera automatiquement ChatGPT
3. Un indicateur vert apparaîtra si l'app est connectée

## 📝 Exemples de Commandes

### Dans ChatGPT:
```
"Crée une nouvelle page appelée 'Meeting Notes' avec l'icône 📝"

"Ajoute une tâche urgente: Préparer la présentation pour demain"

"Vérifie si l'application desktop est en ligne"

"Liste tous mes workspaces"
```

## 🔧 Debugging

### Vérifier la connexion
```bash
curl http://localhost:3456/api/status
```

### Logs
- Ouvrir la console Electron : Ctrl+Shift+I
- Vérifier les logs du serveur API dans le terminal

## 🛡️ Sécurité

1. **CORS**: L'API n'accepte que les requêtes de ChatGPT et localhost
2. **Port local**: L'API écoute uniquement sur localhost:3456
3. **Validation**: Toutes les entrées sont validées côté serveur

## 🎯 Use Cases

1. **Gestion de tâches vocale**
   - "Dis à ChatGPT d'ajouter une tâche"
   - ChatGPT crée directement dans l'app

2. **Création de contenu**
   - ChatGPT génère du contenu
   - L'envoie directement dans une nouvelle page

3. **Automation**
   - Scripts ChatGPT pour gérer vos workspaces
   - Création en masse de tâches/pages

## 📱 Architecture

```
ChatGPT (Chrome)
    ↓
[API HTTP localhost:3456]
    ↓
Electron Main Process
    ↓
[IPC Communication]
    ↓
React App (Renderer)
    ↓
LocalStorage (Données)
```

## ⚠️ Limitations

- ChatGPT doit être sur le même ordinateur que l'app
- L'app desktop doit être lancée
- Connexion locale uniquement (pas d'accès distant)

## 🚦 Statut de l'intégration

- ✅ API locale fonctionnelle
- ✅ Création de pages
- ✅ Création de tâches
- ✅ Gestion des workspaces
- 🔄 Modification de contenu existant (TODO)
- 🔄 Lecture des données (TODO)