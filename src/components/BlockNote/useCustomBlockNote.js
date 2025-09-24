import { useCreateBlockNote } from "@blocknote/react";
import React from "react";
import SimpleDatabaseTable from './SimpleDatabaseBlock';

// Configuration d'un bloc personnalisé simple pour éviter les erreurs
export const useCustomBlockNote = (initialContent) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent,
    // Pour l'instant, on n'utilise pas de blocs personnalisés pour éviter les erreurs
    // On pourra les ajouter plus tard une fois que tout est stable
  });

  return editor;
};