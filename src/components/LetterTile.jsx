import React from "react";

export default function LetterTile({ letter, onDrop }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", letter);
  };

  const handleTouchEnd = () => {
    onDrop(letter);
  };

  return (
    <span
      draggable
      onDragStart={handleDragStart}
      onClick={handleTouchEnd}
      className="cursor-move select-none text-5xl font-bold bg-white shadow-lg rounded-2xl px-6 py-4 hover:bg-blue-50 active:bg-blue-100 transition-all"
    >
      {letter}
    </span>
  );
} 