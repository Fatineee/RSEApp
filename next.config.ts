import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Votre config actuelle pour les images (on la conserve)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // 1) On déclare un rewrite qui redirige `/streamlit/...` vers votre déploiement Streamlit Cloud
  async rewrites() {
    return [
      {
        source: '/streamlit',          // quand on va sur `/streamlit`
        destination: 'https://ancrage-territorial-dash.streamlit.app/', 
      },
      {
        source: '/streamlit/:path*',   // toutes les sous‑routes aussi
        destination: 'https://ancrage-territorial-dash.streamlit.app/:path*',
      },
    ]
  },

  // 2) On neutralise le header X-Frame-Options pour autoriser l’embed
  async headers() {
    return [
      {
        // Pour toutes les requêtes vers /streamlit et ses sous‑chemins
        source: '/streamlit/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
      {
        source: '/streamlit',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ]
  },
}

export default nextConfig
