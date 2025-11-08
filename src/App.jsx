// src/App.jsx
import React from "react";
import SwipeDeck from "./SwipeDeck";
import CuteCursor from "./CuteCursor";
import "./App.css"; 

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071022] via-[#0b2434] to-[#112233] text-white flex items-center justify-center p-4">
      
      {/* Paw pointer */}
      <CuteCursor />

      <div className="w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">🐾 Paws & Preferences</h1>
          <p className="text-sm text-slate-300 mt-1">Discover & swipe the cutest cats</p>
        </header>

        <SwipeDeck totalCats={10} />
      </div>
    </div>
  );
}