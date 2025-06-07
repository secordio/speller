import React, { useState } from 'react';
import { loadStats, calculatePoints, resetLessonProgress } from '../utils';

export default function LessonList({ lessons, userId, onStart, onSwitchUser }) {
  const [showCompleted, setShowCompleted] = useState(true);
  const stats = loadStats(userId);
  const totalPoints = calculatePoints(stats);

  const handleResetLesson = (lessonId) => {
    if (window.confirm('Are you sure you want to reset this lesson? This will clear all progress for this lesson.')) {
      resetLessonProgress(userId, lessonId);
      // Force a re-render by updating the showCompleted state
      setShowCompleted(!showCompleted);
    }
  };

  // Filter lessons based on user level and completion status
  const filteredLessons = Object.entries(lessons)
    .filter(([_, lesson]) => lesson.userLevel === userId)
    .filter(([id, l]) => {
      if (showCompleted) return true;
      const lessonStats = stats?.[id] || {};
      const correct = Object.values(lessonStats).filter(stat => stat.correct).length;
      return correct < l.words.length;
    });

  return (
    <div className="max-w-xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Choose a Lesson</h1>
          <p className="text-sm text-gray-600">Total Points: <span className="font-bold">{totalPoints}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <button
            onClick={onSwitchUser}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Switch User
          </button>
        </div>
      </header>

      <div className="grid gap-4">
        {filteredLessons.map(([id, lesson]) => {
          const lessonStats = stats?.[id] || {};
          const attempted = Object.keys(lessonStats).length;
          const correct = Object.values(lessonStats).filter(stat => stat.correct).length;
          const isComplete = correct === lesson.words.length;

          return (
            <div
              key={id}
              onClick={() => onStart(id)}
              className={`p-4 bg-white rounded-xl shadow cursor-pointer transition-all ${
                isComplete 
                  ? 'bg-green-50 border-2 border-green-500 hover:bg-green-100' 
                  : attempted > 0 && !isComplete
                  ? 'bg-yellow-50 border-2 border-yellow-500 hover:bg-yellow-100'
                  : 'hover:bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-medium">{lesson.title}</h2>
                  <p className="text-sm text-gray-500">
                    {correct}/{lesson.words.length} words completed
                  </p>
                </div>
                {isComplete && (
                  <div className="flex items-center gap-2">
                    <div className="text-green-600 font-bold text-xl">✓</div>
                    <div className="text-sm text-gray-600">+10 points</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetLesson(id);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 