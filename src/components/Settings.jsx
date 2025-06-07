import React, { useState, useEffect } from 'react';
import { getSpeechRate, setSpeechRate } from '../utils';

export default function Settings() {
  const [speechRate, setSpeechRateState] = useState(getSpeechRate);

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setSpeechRateState(newRate);
    setSpeechRate(newRate);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Speech Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speech Speed
        </label>
              <div className="flex items-center gap-4">
        <input
          type="range"
          min="0.3"
          max="1.0"
          step="0.1"
                  value={speechRate}
          onChange={handleRateChange}
                  className="w-full"
        />
                <span className="text-sm text-gray-600">{speechRate.toFixed(1)}x</span>
              </div>
            </div>
      </div>
        </div>
      </div>
    </div>
  );
} 