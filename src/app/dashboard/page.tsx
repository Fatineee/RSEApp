'use client'
import React from 'react'

export default function DashboardPage() {
    return (
      <div style={{ padding: '2rem' }}>
          <h1
        style={{
          textAlign: 'center',
          fontWeight: '700',     // ou 'bold'
          color: '#D32F2F',      // ton rouge Perpignan
          fontSize: '2rem',
          marginBottom: '1.5rem'
        }}
      >
        Ancrage Territorial : Dashboard Économique de Perpignan
      </h1>
  
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
          <iframe
            src="https://ancrage-territorial-dash.streamlit.app/?embed=true"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
            allowFullScreen
            title="Streamlit Dashboard"
          />
        </div>
      </div>
    )
  }
