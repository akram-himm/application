/**
 * Service d'initialisation des workspaces
 * Ce fichier initialise le système de workspaces au démarrage de l'application
 */

import { initializeWorkspaces } from './workspaceService';

// Initialiser les workspaces immédiatement au chargement du module
initializeWorkspaces();

export default initializeWorkspaces;