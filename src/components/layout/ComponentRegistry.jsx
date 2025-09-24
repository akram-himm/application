import React from 'react';
import BlockNoteEditor from '../BlockNoteEditor/BlockNoteEditor';
import RadarChart from '../radar/RadarChart';
import DashboardContent from '../dashboard/DashboardContent';
import NotesContent from '../notes/NotesContent';
// Imports temporaires pour les pages existantes
import HistoryView from '../../pages/HistoryView';
import PlanView from '../../pages/PlanView';
import Improvements from '../../pages/Improvements';
import { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

// Wrapper pour le BlockNote Editor
const BlockNoteWrapper = ({ content = '', pageId }) => {
  return (
    <div className="h-full w-full bg-white rounded-lg overflow-hidden">
      <BlockNoteEditor
        initialContent={content}
        onChange={(newContent) => {
          console.log('BlockNote content changed:', newContent);
        }}
      />
    </div>
  );
};
BlockNoteWrapper.displayName = 'Éditeur de texte';
BlockNoteWrapper.description = 'Éditeur de texte riche avec formatage';
BlockNoteWrapper.icon = 'note';

// Wrapper pour le Radar Chart
const RadarWrapper = ({ radarId }) => {
  const { radars } = useContext(AppContext);
  const radar = radars.find(r => r.id === radarId) || radars[0];

  if (!radar) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucun radar disponible</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-lg p-4">
      <RadarChart radar={radar} />
    </div>
  );
};
RadarWrapper.displayName = 'Radar Chart';
RadarWrapper.description = 'Graphique radar de progression';
RadarWrapper.icon = 'target';

// Composant Table réutilisable
const DataTable = ({ title = 'Tableau', columns = [], data = [], editable = true }) => {
  const [tableData, setTableData] = React.useState(data);
  const [tableColumns, setTableColumns] = React.useState(columns.length > 0 ? columns : [
    { key: 'col1', label: 'Colonne 1' },
    { key: 'col2', label: 'Colonne 2' },
    { key: 'col3', label: 'Colonne 3' }
  ]);

  const handleCellChange = (rowIndex, columnKey, value) => {
    const newData = [...tableData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [columnKey]: value
    };
    setTableData(newData);
  };

  const handleAddRow = () => {
    const newRow = {};
    tableColumns.forEach(col => {
      newRow[col.key] = '';
    });
    setTableData([...tableData, newRow]);
  };

  const handleDeleteRow = (index) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  const handleAddColumn = () => {
    const newKey = `col${tableColumns.length + 1}`;
    setTableColumns([...tableColumns, { key: newKey, label: `Colonne ${tableColumns.length + 1}` }]);

    const newData = tableData.map(row => ({
      ...row,
      [newKey]: ''
    }));
    setTableData(newData);
  };

  return (
    <div className="h-full w-full bg-white rounded-lg p-4 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          className="text-lg font-semibold bg-transparent border-none focus:outline-none"
          defaultValue={title}
          placeholder="Titre du tableau"
        />
        <div className="flex gap-2">
          <button
            onClick={handleAddRow}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            + Ligne
          </button>
          <button
            onClick={handleAddColumn}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
          >
            + Colonne
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {tableColumns.map((col, index) => (
              <th key={col.key} className="border border-gray-300 p-2 bg-gray-50">
                <input
                  type="text"
                  className="w-full bg-transparent border-none focus:outline-none font-semibold"
                  defaultValue={col.label}
                  onChange={(e) => {
                    const newColumns = [...tableColumns];
                    newColumns[index].label = e.target.value;
                    setTableColumns(newColumns);
                  }}
                />
              </th>
            ))}
            <th className="border border-gray-300 p-2 bg-gray-50 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={tableColumns.length + 1} className="border border-gray-300 p-8 text-center text-gray-500">
                Aucune donnée. Cliquez sur "+ Ligne" pour ajouter une ligne.
              </td>
            </tr>
          ) : (
            tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {tableColumns.map(col => (
                  <td key={col.key} className="border border-gray-300 p-2">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none focus:outline-none"
                      value={row[col.key] || ''}
                      onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                      disabled={!editable}
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-1 text-center">
                  <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
DataTable.displayName = 'Tableau';
DataTable.description = 'Tableau de données éditable';
DataTable.icon = 'table';

// Composant Todo List
const TodoList = ({ title = 'Liste de tâches' }) => {
  const [tasks, setTasks] = React.useState([]);
  const [newTask, setNewTask] = React.useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="h-full w-full bg-white rounded-lg p-4 overflow-auto">
      <input
        type="text"
        className="text-lg font-semibold bg-transparent border-none focus:outline-none mb-4 w-full"
        defaultValue={title}
        placeholder="Titre de la liste"
      />

      <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Nouvelle tâche..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune tâche</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-4 h-4"
              />
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
TodoList.displayName = 'Liste de tâches';
TodoList.description = 'Liste de tâches avec cases à cocher';
TodoList.icon = 'list';

// Composant Calendar simple
const SimpleCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  return (
    <div className="h-full w-full bg-white rounded-lg p-4 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded">
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          return (
            <div
              key={day}
              className={`p-2 text-center cursor-pointer rounded ${
                isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
SimpleCalendar.displayName = 'Calendrier';
SimpleCalendar.description = 'Calendrier mensuel simple';
SimpleCalendar.icon = 'calendar';

// Wrappers pour les pages existantes
const HistoryWrapper = () => <HistoryView />;
HistoryWrapper.displayName = 'Historique';
HistoryWrapper.icon = 'history';
HistoryWrapper.description = 'Historique des modifications';

const PlanWrapper = () => <PlanView />;
PlanWrapper.displayName = 'Planification';
PlanWrapper.icon = 'calendar';
PlanWrapper.description = 'Planification des tâches';

const ImprovementsWrapper = () => <Improvements />;
ImprovementsWrapper.displayName = 'Améliorations';
ImprovementsWrapper.icon = 'target';
ImprovementsWrapper.description = 'Gestion des radars';

// Registry de tous les composants disponibles
const ComponentRegistry = {
  blocknote: BlockNoteWrapper,
  radar: RadarWrapper,
  table: DataTable,
  todo: TodoList,
  calendar: SimpleCalendar,
  dashboard: DashboardContent,
  notes: NotesContent,
  history: HistoryWrapper,
  plan: PlanWrapper,
  improvements: ImprovementsWrapper
};

export default ComponentRegistry;