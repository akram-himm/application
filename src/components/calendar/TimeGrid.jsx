import React from 'react';

const TimeGrid = ({ hours, weekDays, onCellClick }) => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Colonne des heures */}
      <div style={{ width: '60px', flexShrink: 0 }}>
        {hours.map((hour, index) => (
          <div
            key={index}
            style={{
              height: '60px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#9ca3af',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end'
            }}
          >
            {hour}:00
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(7, 1fr)` }}>
        {weekDays.map((day, dayIndex) => (
          <div
            key={dayIndex}
            style={{
              borderRight: dayIndex < 6 ? '1px solid #e5e7eb' : 'none',
              position: 'relative'
            }}
          >
            {hours.map((hour, hourIndex) => (
              <div
                key={`${dayIndex}-${hourIndex}`}
                style={{
                  height: '60px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => onCellClick(dayIndex, hour)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeGrid;