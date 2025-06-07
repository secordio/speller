// Store available voices
let voices = [];

// Load voices when they become available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
  };
  // Initial load
  voices = speechSynthesis.getVoices();
}

export const getAvailableVoices = () => {
  return voices.filter(v => v.name.includes('Samantha'));
};

export const getDefaultVoice = () => {
  const availableVoices = getAvailableVoices();
  return availableVoices[0];
};

export const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((v) => v[1]);

export const getSpeechRate = () => {
  const savedRate = localStorage.getItem('speechRate');
  return savedRate ? parseFloat(savedRate) : 0.3;
};

export const setSpeechRate = (rate) => {
  localStorage.setItem('speechRate', rate.toString());
};

export const getPreferredVoiceGender = () => {
  return localStorage.getItem('voiceGender') || 'male';
};

export const setPreferredVoiceGender = (gender) => {
  localStorage.setItem('voiceGender', gender);
};

export const getPreferredVoice = () => {
  const savedVoice = localStorage.getItem('preferredVoice');
  if (savedVoice) {
    const availableVoices = getAvailableVoices();
    return availableVoices.find(v => v.name === savedVoice) || getDefaultVoice();
  }
  return getDefaultVoice();
};

export const speak = (word) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(word);
    utter.voice = getPreferredVoice();
    utter.rate = getSpeechRate();
    utter.pitch = 1.0;
    utter.volume = 1.0;
    
    speechSynthesis.speak(utter);
  }
};

export const loadStats = (userId) => JSON.parse(localStorage.getItem(`stats_${userId}`) || "{}");
export const saveStats = (userId, stats) => localStorage.setItem(`stats_${userId}`, JSON.stringify(stats));

export const calculatePoints = (stats) => {
  let totalPoints = 0;
  Object.entries(stats).forEach(([_, lesson]) => {
    const correctWords = Object.values(lesson).filter(stat => stat.correct).length;
    const totalWords = Object.keys(lesson).length;
    // Only count points if all words are correct and there are no incorrect attempts
    if (correctWords === totalWords && Object.values(lesson).every(stat => stat.correct)) {
      totalPoints += 10;
    }
  });
  return totalPoints;
};

export const playWordAudio = (word) => {
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  // Try to play MP3 first
  const audio = new Audio(`/audio/${word.toLowerCase()}.mp3`);
  
  audio.onerror = () => {
    // If MP3 fails, fall back to speech synthesis
    const utter = new SpeechSynthesisUtterance(word);
    utter.voice = getPreferredVoice();
    utter.rate = getSpeechRate();
    utter.pitch = 1.0;
    utter.volume = 1.0;
    speechSynthesis.speak(utter);
  };
  
  audio.play().catch(() => {
    // If play() fails, fall back to speech synthesis
    const utter = new SpeechSynthesisUtterance(word);
    utter.voice = getPreferredVoice();
    utter.rate = getSpeechRate();
    utter.pitch = 1.0;
    utter.volume = 1.0;
    speechSynthesis.speak(utter);
  });
};

export const resetLessonProgress = (userId, lessonId) => {
  const stats = loadStats(userId);
  if (stats[lessonId]) {
    delete stats[lessonId];
    saveStats(userId, stats);
  }
}; 