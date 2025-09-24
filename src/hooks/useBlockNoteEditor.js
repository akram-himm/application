import { useCreateBlockNote } from "@blocknote/react";
import { DatabaseBlock } from '../components/BlockNote/DatabaseBlock';

// Hook personnalisé pour créer un éditeur BlockNote avec nos blocs custom
export const useBlockNoteEditor = (initialContent) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
    blockSpecs: {
      // Ajouter nos blocs personnalisés
      database: DatabaseBlock,
    },
  });

  return editor;
};