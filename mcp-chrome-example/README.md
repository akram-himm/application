# MCP Chrome Controller

Permet à ChatGPT de contrôler et modifier le contenu dans Chrome.

## Installation

```bash
npm install
```

## Configuration dans Claude Desktop

Ajouter dans `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chrome-controller": {
      "command": "node",
      "args": ["C:/Users/akram/Dev/Git_projets/application/mcp-chrome-example/server.js"],
      "cwd": "C:/Users/akram/Dev/Git_projets/application/mcp-chrome-example"
    }
  }
}
```

## Utilisation avec ChatGPT

Pour utiliser avec ChatGPT, vous devez :

1. **Option 1: API Bridge**
   - Créer un serveur qui expose les fonctionnalités MCP via une API REST
   - Utiliser les Actions personnalisées de ChatGPT pour appeler cette API

2. **Option 2: Extension Chrome pour ChatGPT**
   - Créer une extension qui injecte des capacités dans chat.openai.com
   - L'extension communique avec le serveur MCP local

## Exemple d'API Bridge pour ChatGPT

```javascript
import express from 'express';
import { exec } from 'child_process';

const app = express();
app.use(express.json());

app.post('/chrome/navigate', async (req, res) => {
  // Communiquer avec le serveur MCP
  const result = await callMCPTool('navigate', req.body);
  res.json(result);
});

app.post('/chrome/modify', async (req, res) => {
  const result = await callMCPTool('modify_content', req.body);
  res.json(result);
});

app.listen(3000);
```

## Fonctionnalités disponibles

- **navigate**: Naviguer vers une URL
- **get_content**: Récupérer le contenu HTML
- **modify_content**: Modifier le contenu d'un élément
- **click**: Cliquer sur un élément
- **type**: Taper du texte
- **execute_script**: Exécuter du JavaScript

## Exemple d'utilisation

```javascript
// Naviguer vers une page
await navigate({ url: 'https://example.com' });

// Modifier le contenu
await modify_content({
  selector: 'h1',
  content: 'Nouveau titre'
});

// Exécuter du JavaScript
await execute_script({
  script: 'document.body.style.backgroundColor = "red"'
});
```

## Sécurité

⚠️ **Attention**: Ce serveur donne un contrôle complet sur Chrome. Utilisez-le uniquement en local et avec des sites de confiance.

## Extension Chrome complémentaire

Pour une intégration plus poussée, créez une extension Chrome qui :
1. Se connecte au serveur MCP via WebSocket
2. Injecte des scripts dans les pages
3. Permet des modifications en temps réel

Voir le dossier `chrome-extension/` pour l'exemple d'extension.