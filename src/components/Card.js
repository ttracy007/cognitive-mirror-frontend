import React from 'react';

const Card = ({ children }) => {
  return (
    <div style={{
      backgrounColor: '#fff',
      border: '1pxsolid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
  {children}
  </div>
);
};

export default Card;
