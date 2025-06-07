// Minimal offline‑first spelling app demo
// Directory layout represented with file separators.
// Copy these into a Vite React project (\`npm create vite@latest spelling-app -- --template react\`) 
// then replace /src with the code below, run \`npm i && npm run dev\`.

/*–––––––––––––––––––––––––––––––––––––
  File: index.html  (root)
–––––––––––––––––––––––––––––––––––––*/
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spelling App Demo</title>
  </head>
  <body class="bg-gray-50 text-gray-800">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

/*–––––––––––––––––––––––––––––––––––––
  File: src/main.jsx
–––––––––––––––––––––––––––––––––––––*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*–––––––––––––––––––––––––––––––––––––
  File: src/index.css  (Tailwind via CDN for speed)
–––––––––––––––––––––––––––––––––––––*/
@import url("https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css");

/*–––––––––––––––––––––––––––––––––––––
  File: src/data/lessons.json
–––––––––––––––––––––––––––––––––––––*/
{
  "long_a": {
    "title": "Long A (ai/ay/a_e)",
    "words": ["train", "brain", "rake"]
  }
}

/*–––––––––––––––––––––––––––––––––––––
  File: src/data/users.json
–––––––––––––––––––––––––––––––––––––*/
[
  { "id": "kid10", "name": "10‑yr" },
  { "id": "kid5", "name": "5‑yr" }
]

/*–––––––––––––––––––––––––––––––––––––
  File: src/utils.js
–––––––––––––––––––––––––––––––––––––*/
export const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);

export const speak = (word) => {
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utter);
  }
};

export const loadStats = (userId) => JSON.parse(localStorage.getItem(`stats_${userId}`) || "{}");
export const saveStats = (userId, stats) => localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));

/*–––––––––––––––––––––––––––––––––––––
  File: src/App.jsx
–––––––––––––––––––––––––––––––––––––*/
import React, { useState, useEffect } from "react";
import usersData from "./data/users.json";
import lessonsData from "./data/lessons.json";
import { loadStats } from "./utils";
import UserSelector from "./components/UserSelector";
import LessonList from "./components/LessonList";
import LessonRunner from "./components/LessonRunner";

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem("currentUser") || "");
  const [route, setRoute] = useState("home");
  const [lessonId, setLessonId] = useState(null);

  // Persist selected user
  useEffect(() => {
    if (userId) localStorage.setItem("currentUser", userId);
  }, [userId]);

  if (!userId) {
    return <UserSelector users={usersData} onSelect={setUserId} />;
  }

  if (route === "lesson") {
    return (
      <LessonRunner
        lessonId={lessonId}
        lesson={lessonsData[lessonId]}
        userId={userId}
        onExit={() => setRoute("home")}
      />
    );
  }

  return (
    <LessonList
      lessons={lessonsData}
      stats={loadStats(userId)}
      onStart={(id) => {
        setLessonId(id);
        setRoute("lesson");
      }}
      onSwitchUser={() => setUserId("")}
    />
  );
}

/*–––––––––––––––––––––––––––––––––––––
  File: src/components/UserSelector.jsx
–––––––––––––––––––––––––––––––––––––*/
export default function UserSelector({ users, onSelect }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Who&apos;s spelling today?</h1>
      {users.map((u) => (
        <button
          key={u.id}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow"
          onClick={() => onSelect(u.id)}
        >
          {u.name}
        </button>
      ))}
    </div>
  );
}

/*–––––––––––––––––––––––––––––––––––––
  File: src/components/LessonList.jsx
–––––––––––––––––––––––––––––––––––––*/
export default function LessonList({ lessons, stats, onStart, onSwitchUser }) {
  return (
    <div className="max-w-xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Choose a Lesson</h1>
        <button className="text-sm underline" onClick={onSwitchUser}>
          Switch User
        </button>
      </header>
      <div className="grid gap-4">
        {Object.entries(lessons).map(([id, l]) => {
          const completed = stats?.[id] ? Object.keys(stats[id]).length : 0;
          return (
            <div
              key={id}
              className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-blue-50"
              onClick={() => onStart(id)}
            >
              <h2 className="font-medium">{l.title}</h2>
              <p className="text-sm text-gray-500">
                {completed}/{l.words.length} completed
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*–––––––––––––––––––––––––––––––––––––
  File: src/components/LessonRunner.jsx
–––––––––––––––––––––––––––––––––––––*/
import React, { useEffect, useState } from "react";
import { shuffle, speak, loadStats, saveStats } from "../utils";
import LetterTile from "./LetterTile";

export default function LessonRunner({ lessonId, lesson, userId, onExit }) {
  const [index, setIndex] = useState(0);
  const [tiles, setTiles] = useState(() => shuffle([...lesson.words[0]]));
  const [assembled, setAssembled] = useState([]);
  const [stats, setStats] = useState(() => loadStats(userId));

  const word = lesson.words[index];

  useEffect(() => {
    speak(word);
  }, [index]);

  const resetTiles = () => {
    setAssembled([]);
    setTiles(shuffle([...word]));
  };

  const handleDrop = (letter) => {
    const newAssembled = [...assembled, letter];
    setAssembled(newAssembled);

    if (newAssembled.length === word.length) {
      const correct = newAssembled.join("") === word;
      // store result
      const s = { ...stats };
      s[lessonId] = s[lessonId] || {};
      s[lessonId][word] = { correct: correct, attempts: (s[lessonId][word]?.attempts || 0) + 1 };
      setStats(s);
      saveStats(userId, s);

      if (correct) {
        // next word or finish
        if (index + 1 < lesson.words.length) {
          setIndex(index + 1);
          setTiles(shuffle([...lesson.words[index + 1]]));
          setAssembled([]);
        } else {
          alert("Lesson complete! Great job.");
          onExit();
        }
      } else {
        // incorrect – shake and reset
        alert("Try again");
        resetTiles();
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 select-none">
      <header className="w-full flex justify-between items-center mb-4">
        <button className="underline" onClick={onExit}>
          ← Lessons
        </button>
        <span className="text-sm">
          {index + 1} / {lesson.words.length} complete
        </span>
      </header>

      <div
        id="dropzone"
        className="min-h-[56px] mb-6 flex gap-2 border-b-2 border-gray-300"
      >
        {assembled.map((l, i) => (
          <span key={i} className="text-3xl font-bold">
            {l}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {tiles.map((l, i) => (
          <LetterTile key={i} letter={l} onDrop={handleDrop} />
        ))}
      </div>

      <button
        className="mt-8 px-4 py-2 bg-gray-200 rounded-full"
        onClick={resetTiles}
      >
        Shuffle
      </button>
    </div>
  );
}

/*–––––––––––––––––––––––––––––––––––––
  File: src/components/LetterTile.jsx
–––––––––––––––––––––––––––––––––––––*/
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
      className="cursor-move select-none text-3xl font-bold bg-white shadow rounded-xl px-3 py-2"
    >
      {letter}
    </span>
  );
}

/*–––––––––––––––––––––––––––––––––––––
  README (inline)
–––––––––––––––––––––––––––––––––––––*/
// 1. Install Node 18+.
// 2. Run: npm create vite@latest spelling-app -- --template react
// 3. Replace the generated src & index.html with the code above; add data/ folder.
// 4. Run: npm i && npm run dev
// Open http://localhost:5173 on Mac or iPad (same Wi‑Fi) to test.
