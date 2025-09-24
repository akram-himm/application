import React from 'react';
import { createReactBlockSpec } from '@blocknote/react';
import DatabaseTable from './DatabaseTable';

// Créer le bloc personnalisé pour la base de données
export const DatabaseBlock = createReactBlockSpec(
  {
    type: "database",
    propSchema: {
      data: {
        type: "object",
        default: {
          columns: [
            { id: 'col1', name: 'Titre', type: 'text' },
            { id: 'col2', name: 'Statut', type: 'status' },
            { id: 'col3', name: 'Date', type: 'date' },
            { id: 'col4', name: 'Priorité', type: 'priority' }
          ],
          rows: [
            { id: 'row1', data: { col1: 'Exemple de tâche 1', col2: 'todo', col3: '', col4: 'medium' } },
            { id: 'row2', data: { col1: 'Exemple de tâche 2', col2: 'in_progress', col3: '', col4: 'high' } },
            { id: 'row3', data: { col1: 'Exemple de tâche 3', col2: 'done', col3: '', col4: 'low' } }
          ]
        }
      },
      viewType: {
        type: "string",
        default: "table"
      }
    },
    content: "none",
  },
  {
    render: (props) => {
      const handleDataChange = (newData) => {
        props.block.props.data = newData;
      };

      return (
        <div className="my-4">
          <DatabaseTable
            initialData={props.block.props.data}
            onChange={handleDataChange}
          />
        </div>
      );
    },
    parse: (element) => {
      if (element.tagName === "DIV" && element.dataset.nodeType === "database") {
        return {
          data: JSON.parse(element.dataset.data || '{}'),
        };
      }
    },
    toExternalHTML: (props) => {
      return (
        <div
          data-node-type="database"
          data-data={JSON.stringify(props.block.props.data)}
        />
      );
    },
  }
);

// Schéma d'insertion pour le menu slash
export const insertDatabase = {
  title: "Base de données",
  onItemClick: (editor) => {
    const currentBlock = editor.getTextCursorPosition().block;

    editor.insertBlocks(
      [
        {
          type: "database",
          props: {
            data: {
              columns: [
                { id: 'col1', name: 'Titre', type: 'text' },
                { id: 'col2', name: 'Statut', type: 'status' },
                { id: 'col3', name: 'Date', type: 'date' },
                { id: 'col4', name: 'Priorité', type: 'priority' }
              ],
              rows: [
                { id: 'row1', data: {} },
                { id: 'row2', data: {} },
                { id: 'row3', data: {} }
              ]
            }
          }
        },
      ],
      currentBlock,
      "after"
    );
  },
  aliases: ["database", "table", "tableau", "base de données", "db"],
  group: "Media",
  icon: <span style={{ fontSize: '18px' }}>📊</span>,
  hint: "Insérer une base de données style Notion"
};