import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { severity, percentage } = location.state || {};

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    Normal: '#22c55e',
    Moderate: '#f59e0b',
    Severe: '#ef4444',
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Prediction Result</h1>
      <p style={{ fontSize: 18, margin: '1rem 0' }}>
        Severity Level: <strong>{severity || 'Unknown'}</strong>
      </p>

      {/* Donut chart */}
      <svg width="120" height="120" viewBox="0 0 36 36" style={{ margin: '0 auto', display: 'block' }}>
        <circle
          stroke="#e5e7eb"
          fill="none"
          strokeWidth="4"
          cx="18"
          cy="18"
          r={radius}
        />
        <circle
          stroke={colors[severity] || '#3b82f6'}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          cx="18"
          cy="18"
          r={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="18"
          y="21"
          textAnchor="middle"
          fontSize="8"
          fill={colors[severity] || '#3b82f6'}
          fontWeight="bold"
        >
          {percentage?.toFixed(2)}%
        </text>
      </svg>

      <p style={{ marginTop: '1rem', fontSize: 16, color: '#555' }}>
        {severity === 'Normal' && 'No jaundice detected.'}
        {severity === 'Moderate' && 'Moderate jaundice detected. Please consult a doctor.'}
        {severity === 'Severe' && 'Severe jaundice detected. Immediate medical attention is advised.'}
      </p>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '2rem',
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          background: '#3b82f6',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Back to Form
      </button>
    </div>
  );
}

export default ResultPage;
