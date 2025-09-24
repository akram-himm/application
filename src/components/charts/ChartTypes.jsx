import React from 'react';

// Graphique en barres verticales (nouveau)
export const VerticalBarChart = ({ subjects, onSelectSubject, onContextMenu }) => {
  const maxValue = 100;
  const barWidth = 60;
  const chartHeight = 300;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-end justify-center gap-4" style={{ height: chartHeight }}>
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => onSelectSubject(index)}
            onContextMenu={(e) => onContextMenu(e, index)}
          >
            <div className="relative flex flex-col items-center">
              {/* Valeur au-dessus de la barre */}
              <span className="text-sm font-medium text-gray-600 mb-2">
                {subject.value}%
              </span>

              {/* Barre verticale */}
              <div
                className="bg-gray-100 rounded-t-lg relative overflow-hidden"
                style={{
                  width: barWidth,
                  height: chartHeight,
                }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500"
                  style={{
                    height: `${(subject.value / maxValue) * 100}%`,
                  }}
                />
              </div>

              {/* Nom du sujet */}
              <div className="mt-3 text-center">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {subject.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Graphique en barres horizontales
export const BarChart = ({ subjects, onSelectSubject, onContextMenu }) => {
  const maxValue = 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="group cursor-pointer"
            onClick={() => onSelectSubject(index)}
            onContextMenu={(e) => onContextMenu(e, index)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {subject.name}
              </span>
              <span className="text-sm text-gray-500">{subject.value}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${(subject.value / maxValue) * 100}%` }}
              >
                {subject.value > 20 && (
                  <span className="text-xs text-white font-medium">{subject.value}%</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Graphique en anneaux (Donut)
export const DonutChart = ({ subjects, onSelectSubject, onContextMenu }) => {
  const size = 300;
  const centerSize = size / 2;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculer les segments
  const total = subjects.reduce((sum, s) => sum + s.value, 0);
  let currentAngle = 0;

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#84CC16'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {subjects.map((subject, index) => {
            const percentage = total > 0 ? (subject.value / total) * 100 : 0;
            const dashArray = (percentage / 100) * circumference;
            const dashOffset = currentAngle;
            currentAngle += dashArray;

            return (
              <circle
                key={subject.id}
                cx={centerSize}
                cy={centerSize}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={-dashOffset}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSelectSubject(index)}
                onContextMenu={(e) => onContextMenu(e, index)}
              />
            );
          })}
        </svg>

        {/* Centre du donut avec statistiques */}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-800">
            {Math.round(subjects.reduce((sum, s) => sum + s.value, 0) / subjects.length)}%
          </div>
          <div className="text-sm text-gray-500">Moyenne</div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            onClick={() => onSelectSubject(index)}
            onContextMenu={(e) => onContextMenu(e, index)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-700 truncate">{subject.name}</span>
            <span className="text-xs text-gray-500 ml-auto">{subject.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Graphique en lignes (Line Chart)
export const LineChart = ({ subjects, onSelectSubject, onContextMenu }) => {
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Points pour la ligne
  const points = subjects.map((subject, index) => {
    const x = padding + (index / (subjects.length - 1 || 1)) * chartWidth;
    const y = height - padding - (subject.value / 100) * chartHeight;
    return { x, y, subject, index };
  });

  // Créer le path pour la ligne
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  // Créer le path pour la zone remplie
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <svg width={width} height={height}>
        {/* Grille horizontale */}
        {[0, 25, 50, 75, 100].map(value => {
          const y = height - padding - (value / 100) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="2,2"
              />
              <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                {value}
              </text>
            </g>
          );
        })}

        {/* Zone remplie */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Ligne */}
        <path
          d={linePath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
        />

        {/* Points interactifs */}
        {points.map(point => (
          <g key={point.subject.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-8 transition-all"
              onClick={() => onSelectSubject(point.index)}
              onContextMenu={(e) => onContextMenu(e, point.index)}
            />
            {/* Étiquette */}
            <text
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {point.subject.name.length > 10
                ? point.subject.name.substring(0, 10) + '...'
                : point.subject.name}
            </text>
            {/* Valeur */}
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-xs fill-gray-700 font-medium"
            >
              {point.subject.value}%
            </text>
          </g>
        ))}

        {/* Gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

