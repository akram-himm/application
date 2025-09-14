import React from 'react';

const CalendarHeader = ({ weekDays, currentWeekStart }) => {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  const getDateForDay = (dayIndex) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '60px repeat(7, 1fr)',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb' }}></div>
      {weekDays.map((_, index) => {
        const date = getDateForDay(index);
        const dayIsToday = isToday(date);
        
        return (
          <div
            key={index}
            style={{
              padding: '12px 8px',
              textAlign: 'center',
              borderRight: index < 6 ? '1px solid #e5e7eb' : 'none',
              backgroundColor: dayIsToday ? '#eff6ff' : 'transparent'
            }}
          >
            <div style={{ 
              fontSize: '11px', 
              color: dayIsToday ? '#3b82f6' : '#9ca3af',
              fontWeight: '500',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {daysOfWeek[index]}
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: dayIsToday ? '600' : '400',
              color: dayIsToday ? '#3b82f6' : '#1f2937'
            }}>
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarHeader;