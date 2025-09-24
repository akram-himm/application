import React, { useState } from 'react';
import SimpleDatabaseTable from './SimpleDatabaseBlock';

// Composant pour insérer un tableau de base de données dans l'éditeur
const DatabaseTableComponent = ({ onInsert }) => {
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState({
    columns: ['Titre', 'Statut', 'Date', 'Priorité'],
    rows: [
      ['Tâche 1', 'À faire', '2024-01-01', 'Haute'],
      ['Tâche 2', 'En cours', '2024-01-02', 'Moyenne'],
      ['Tâche 3', 'Terminé', '2024-01-03', 'Basse']
    ]
  });

  const handleInsert = () => {
    // Pour l'instant, on insère le tableau comme HTML
    const tableHTML = generateTableHTML(tableData);
    if (onInsert) {
      onInsert(tableHTML);
    }
    setShowTable(false);
  };

  const generateTableHTML = (data) => {
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';

    // Header
    html += '<thead><tr>';
    data.columns.forEach(col => {
      html += `<th style="border: 1px solid #e5e7eb; padding: 8px; background: #f9fafb; text-align: left;">${col}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    data.rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td style="border: 1px solid #e5e7eb; padding: 8px;">${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';
    return html;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowTable(!showTable)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span>📊</span>
        <span>Insérer un tableau de données</span>
      </button>

      {showTable && (
        <div className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Créer un tableau de base de données</h3>
            <button
              onClick={() => setShowTable(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <SimpleDatabaseTable
            data={tableData}
            onChange={setTableData}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowTable(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Insérer le tableau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTableComponent;