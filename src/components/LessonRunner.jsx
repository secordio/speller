import React, { useEffect, useState } from "react";
import { shuffle, loadStats, saveStats, getSpeechRate, setSpeechRate, playWordAudio } from "../utils";
import LetterTile from "./LetterTile";

export default function LessonRunner({ lessonId, lesson, userId, onExit }) {
  const [stats, setStats] = useState(() => loadStats(userId));
  
  // Find the first uncompleted word
  const getInitialIndex = () => {
    const lessonStats = stats[lessonId] || {};
    const completedWords = Object.entries(lessonStats)
      .filter(([_, stat]) => stat.correct)
      .map(([word]) => word);
    
    // Find the first word that hasn't been completed correctly
    const firstUncompletedIndex = lesson.words.findIndex(word => !completedWords.includes(word));
    return firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex;
  };

  const [index, setIndex] = useState(getInitialIndex);
  const [tiles, setTiles] = useState(() => shuffle([...lesson.words[getInitialIndex()]]));
  const [assembled, setAssembled] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRateState] = useState(getSpeechRate);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [correctWords, setCorrectWords] = useState(() => {
    const lessonStats = stats[lessonId] || {};
    return Object.entries(lessonStats)
      .filter(([_, stat]) => stat.correct)
      .map(([word]) => word);
  });
  const [skippedWords, setSkippedWords] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const word = lesson.words[index];

  const speakWord = () => {
    setIsSpeaking(true);
    setTimeout(() => {
      playWordAudio(word);
      setTimeout(() => {
        setIsSpeaking(false);
      }, 1000);
    }, 500);
  };

  // Initial word playback
  useEffect(() => {
    speakWord();
  }, [index]);

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setSpeechRateState(newRate);
    setSpeechRate(newRate);
  };

  const resetTiles = () => {
    setAssembled([]);
    setTiles(shuffle([...word]));
  };

  const moveToNextWord = () => {
    // If we're at the end of all words
    if (index + 1 >= lesson.words.length) {
      // If there are skipped words, start going through them
      if (skippedWords.length > 0) {
        const nextWord = skippedWords[0];
        const nextIndex = lesson.words.indexOf(nextWord);
        setIndex(nextIndex);
        setTiles(shuffle([...nextWord]));
        setAssembled([]);
        setSkippedWords(skippedWords.slice(1)); // Remove this word from skipped list
      } else {
        // If no skipped words, lesson is complete
        setShowCompletion(true);
        setTimeout(() => {
          setShowCompletion(false);
          onExit();
        }, 2000);
      }
    } else {
      // Find the next word that hasn't been completed correctly
      let nextIndex = index + 1;
      while (nextIndex < lesson.words.length) {
        const nextWord = lesson.words[nextIndex];
        const isCorrect = correctWords.includes(nextWord);
        if (!isCorrect) {
          break;
        }
        nextIndex++;
      }

      if (nextIndex < lesson.words.length) {
        // Move to next uncompleted word
        setIndex(nextIndex);
        setTiles(shuffle([...lesson.words[nextIndex]]));
        setAssembled([]);
      } else {
        // If we've reached the end, check for skipped words
        if (skippedWords.length > 0) {
          const nextWord = skippedWords[0];
          const nextIndex = lesson.words.indexOf(nextWord);
          setIndex(nextIndex);
          setTiles(shuffle([...nextWord]));
          setAssembled([]);
          setSkippedWords(skippedWords.slice(1));
        } else {
          // If no skipped words, lesson is complete
          setShowCompletion(true);
          setTimeout(() => {
            setShowCompletion(false);
            onExit();
          }, 2000);
        }
      }
    }
  };

  const handleDrop = (letter) => {
    const newAssembled = [...assembled, letter];
    setAssembled(newAssembled);
    
    // Find the index of the first occurrence of the letter
    const letterIndex = tiles.findIndex(t => t === letter);
    // Remove only that specific letter instance
    setTiles([...tiles.slice(0, letterIndex), ...tiles.slice(letterIndex + 1)]);

    if (newAssembled.length === word.length) {
      const correct = newAssembled.join("") === word;
      // store result
      const s = { ...stats };
      s[lessonId] = s[lessonId] || {};
      s[lessonId][word] = { correct: correct, attempts: (s[lessonId][word]?.attempts || 0) + 1 };
      setStats(s);
      saveStats(userId, s);

      if (correct) {
        // Add to correct words if not already there
        if (!correctWords.includes(word)) {
          setCorrectWords([...correctWords, word]);
        }
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          moveToNextWord();
        }, 1000);
      } else {
        // Show error animation
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
          resetTiles();
        }, 1000);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleOnDrop = (e) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text/plain");
    handleDrop(letter);
  };

  const skipWord = () => {
    // Add current word to skipped list if not already correct
    if (!correctWords.includes(word) && !skippedWords.includes(word)) {
      setSkippedWords([...skippedWords, word]);
    }
    moveToNextWord();
  };

  const revealWord = () => {
    setIsRevealed(true);
    // Add to skipped since it wasn't solved independently
    if (!correctWords.includes(word) && !skippedWords.includes(word)) {
      setSkippedWords([...skippedWords, word]);
    }
    // Show the word for 3 seconds before moving on
    setTimeout(() => {
      setIsRevealed(false);
      moveToNextWord();
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 select-none">
      {showCompletion ? (
        <div className="fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center flex-col text-white">
          <h1 className="text-4xl font-bold mb-4">🎉 Congratulations! 🎉</h1>
          <p className="text-xl">You've completed the lesson!</p>
        </div>
      ) : (
        <>
          <header className="w-full flex justify-between items-center mb-4">
            <button className="underline" onClick={onExit}>
              ← Lessons
            </button>
            <div className="text-sm flex flex-col items-end">
              <div>
                {index + 1} / {lesson.words.length} words
              </div>
              <div className="text-green-600">
                {correctWords.length} correct
              </div>
              {skippedWords.length > 0 && (
                <div className="text-orange-500">
                  {skippedWords.length} skipped
                </div>
              )}
            </div>
          </header>

          <div
            id="dropzone"
            onDragOver={handleDragOver}
            onDrop={handleOnDrop}
            className={`min-h-[96px] mb-8 flex gap-4 border-b-2 border-gray-300 p-4 w-full max-w-2xl rounded-xl transition-all duration-300 ${
              showSuccess 
                ? 'bg-green-100 scale-110 border-green-500' 
                : showError 
                  ? 'bg-red-100 scale-110 border-red-500' 
                  : ''
            }`}
          >
            {isRevealed ? (
              <div className="flex flex-col items-center w-full">
                <span className="text-5xl font-bold text-blue-600">{word}</span>
                <span className="text-sm text-gray-500 mt-2">Moving to next word in 3 seconds...</span>
              </div>
            ) : (
              assembled.map((l, i) => (
                <span key={i} className={`text-5xl font-bold transition-all duration-300 ${
                  showSuccess 
                    ? 'text-green-600 scale-110' 
                    : showError 
                      ? 'text-red-600 scale-110' 
                      : ''
                }`}>
                  {l}
                </span>
              ))
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {!isRevealed && tiles.map((l, i) => (
              <LetterTile key={i} letter={l} onDrop={handleDrop} />
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <button
              className="px-6 py-3 bg-gray-200 rounded-xl shadow-md hover:bg-gray-300 hover:shadow-lg transition-all"
              onClick={resetTiles}
            >
              Shuffle
            </button>
            <button
              onClick={resetTiles}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              reset
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <button
                onClick={speakWord}
                disabled={isSpeaking}
                className={`px-6 py-3 text-white rounded-xl shadow-md transition-all ${
                  isSpeaking 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'
                }`}
              >
                {isSpeaking ? 'Speaking...' : 'Listen Again'}
              </button>
              <button
                onClick={skipWord}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl shadow-md hover:bg-gray-600 hover:shadow-lg transition-all"
              >
                Skip Word
              </button>
            </div>

            {isSpeaking && (
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}

            {/* Speech speed control temporarily disabled
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600">Speech Speed:</label>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.1"
                value={speechRate}
                onChange={handleRateChange}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{speechRate.toFixed(1)}x</span>
            </div>
            */}

            <button
              onClick={revealWord}
              disabled={isRevealed}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              show me the word
            </button>
          </div>
        </>
      )}
    </div>
  );
} 