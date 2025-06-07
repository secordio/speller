import React, { useState, useEffect } from "react";
import usersData from "./data/users.json";
import lessonsData from "./data/lessons.json";
import { loadStats } from "./utils";
import UserSelector from "./components/UserSelector";
import LessonList from "./components/LessonList";
import LessonRunner from "./components/LessonRunner";
import Settings from "./components/Settings.jsx";

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem("currentUser") || "");
  const [route, setRoute] = useState("home");
  const [lessonId, setLessonId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Persist selected user
  useEffect(() => {
    if (userId) localStorage.setItem("currentUser", userId);
  }, [userId]);

  const SettingsButton = () => (
    <button
      onClick={() => setShowSettings(true)}
      className="fixed bottom-4 right-4 p-3 bg-gray-200 rounded-full shadow-md hover:bg-gray-300"
    >
      ⚙️
    </button>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <Settings />
      </div>
    </div>
  );

  if (!userId) {
    return (
      <>
        <UserSelector users={usersData} onSelect={setUserId} />
        <SettingsButton />
        {showSettings && <SettingsModal />}
      </>
    );
  }

  if (route === "lesson") {
    return (
      <>
        <LessonRunner
          lessonId={lessonId}
          lesson={lessonsData[lessonId]}
          userId={userId}
          onExit={() => setRoute("home")}
        />
        <SettingsButton />
        {showSettings && <SettingsModal />}
      </>
    );
  }

  return (
    <>
      <LessonList
        lessons={lessonsData}
        stats={loadStats(userId)}
        onStart={(id) => {
          setLessonId(id);
          setRoute("lesson");
        }}
        onSwitchUser={() => setUserId("")}
        userId={userId}
      />
      <SettingsButton />
      {showSettings && <SettingsModal />}
    </>
  );
} 