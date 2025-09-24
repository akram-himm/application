import React from 'react';

// Composant simple pour le tableau de base de données
const SimpleDatabaseTable = ({ data, onChange }) => {
  const [tableData, setTableData] = React.useState(data || {
    columns: ['Titre', 'Statut', 'Date'],
    rows: [
      ['Tâche 1', 'À faire', '2024-01-01'],
      ['Tâche 2', 'En cours', '2024-01-02'],
      ['Tâche 3', 'Terminé', '2024-01-03']
    ]
  });

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex][colIndex] = value;
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    if (onChange) onChange(newData);
  };

  const addRow = () => {
    const newRows = [...tableData.rows, new Array(tableData.columns.length).fill('')];
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    if (onChange) onChange(newData);
  };

  const deleteRow = (index) => {
    const newRows = tableData.rows.filter((_, i) => i !== index);
    const newData = { ...tableData, rows: newRows };
    setTableData(newData);
    if (onChange) onChange(newData);
  };

  const addColumn = () => {
    const newColumns = [...tableData.columns, `Colonne ${tableData.columns.length + 1}`];
    const newRows = tableData.rows.map(row => [...row, '']);
    const newData = { columns: newColumns, rows: newRows };
    setTableData(newData);
    if (onChange) onChange(newData);
  };

  return (
    <div className="my-4 w-full overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableData.columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => {
                        const newColumns = [...tableData.columns];
                        newColumns[idx] = e.target.value;
                        setTableData({ ...tableData, columns: newColumns });
                      }}
                      className="bg-transparent border-0 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    />
                  </th>
                ))}
                <th className="px-2 py-3 bg-gray-50">
                  <button
                    onClick={addColumn}
                    className="text-blue-600 hover:text-blue-800"
                    title="Ajouter une colonne"
                  >
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="px-4 py-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                        className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      className="text-red-500 hover:text-red-700"
                      title="Supprimer la ligne"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={tableData.columns.length + 1} className="px-4 py-2">
                  <button
                    onClick={addRow}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>Nouvelle ligne</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SimpleDatabaseTable;