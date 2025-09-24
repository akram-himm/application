// Injecter des commandes dans ChatGPT pour contrôler l'app desktop

// Écouter les messages de ChatGPT
const observer = new MutationObserver(async (mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      const text = mutation.target.textContent;

      // Détecter les commandes
      if (text.includes('[DESKTOP_COMMAND:')) {
        const commandMatch = text.match(/\[DESKTOP_COMMAND:([^\]]+)\]/);
        if (commandMatch) {
          const command = JSON.parse(commandMatch[1]);
          await executeDesktopCommand(command);
        }
      }
    }
  }
});

// Observer le chat
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Exécuter une commande sur l'app desktop
async function executeDesktopCommand(command) {
  try {
    const response = await fetch(`http://localhost:3456/api/${command.endpoint}`, {
      method: command.method || 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command.data)
    });

    const result = await response.json();

    // Injecter le résultat dans la conversation
    injectResponse(result);
  } catch (error) {
    injectResponse({ error: error.message });
  }
}

// Injecter une réponse dans ChatGPT
function injectResponse(response) {
  const responseDiv = document.createElement('div');
  responseDiv.className = 'desktop-app-response';
  responseDiv.style.cssText = `
    background: #f0f0f0;
    border-left: 4px solid #4CAF50;
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
  `;
  responseDiv.innerHTML = `
    <strong>🖥️ Réponse de l'application desktop:</strong><br>
    <pre>${JSON.stringify(response, null, 2)}</pre>
  `;

  // Trouver où injecter la réponse
  const chatContainer = document.querySelector('main');
  if (chatContainer) {
    chatContainer.appendChild(responseDiv);
  }
}

// Ajouter un indicateur de statut
async function checkDesktopStatus() {
  try {
    const response = await fetch('http://localhost:3456/api/status');
    const status = await response.json();

    // Créer un indicateur de statut
    const statusDiv = document.createElement('div');
    statusDiv.id = 'desktop-status';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      font-size: 12px;
    `;
    statusDiv.innerHTML = '🟢 App Desktop Connectée';
    document.body.appendChild(statusDiv);
  } catch (error) {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'desktop-status';
    statusDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      font-size: 12px;
    `;
    statusDiv.innerHTML = '🔴 App Desktop Déconnectée';
    document.body.appendChild(statusDiv);
  }
}

// Vérifier le statut au chargement
checkDesktopStatus();
setInterval(checkDesktopStatus, 10000); // Vérifier toutes les 10 secondes