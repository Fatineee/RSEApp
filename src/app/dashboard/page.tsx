'use client'

import React from 'react'
import Navbar from '@/app/components/UI/navbar'

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            {/* Dashboard iframe */}
            <div className="bg-gray-100 p-4 rounded-lg min-h-64">
            <iframe
                src="https://ancrage-territorial-dash.streamlit.app/?embed=true"
                className="absolute top-0 left-0 w-full h-full rounded-md border border-gray-200"
                allowFullScreen
                title="Streamlit Dashboard"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}