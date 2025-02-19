"use client";

import { useState, useEffect } from "react";

const images = [
  "/images/hero1.jpeg",
  "/images/hero2.jpeg",
  "/images/hero3.jpeg",
]; // Add your image paths

const Hero = ({ onExplore }: { onExplore: () => void }) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative h-[500px] flex items-center px-8 md:px-16"
      style={{
        backgroundImage: `url(${images[currentImage]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 1s ease-in-out",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content aligned to left */}
      <div className="relative z-10 text-left text-white max-w-2xl -z-[10]">
        <h1 className="text-5xl font-bold mb-6">
          RSE : tous les articles présents sur le site
        </h1>
        <p className="text-lg mb-8">
            La Responsabilité Sociétale des Entreprises est une politique qui intègre volontairement des préoccupations sociales et 
            environnementales à L&apos;activité commerciale et aux relations avec 
            les parties prenantes.
        </p>
        <button
          onClick={onExplore}
          className="bg-white text-green-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Explorer les articles
        </button>
      </div>
    </div>
  );
};

export default Hero;
