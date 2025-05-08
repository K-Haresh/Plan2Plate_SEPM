'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Timer.module.css';

interface TimerProps {
  teamName: string;
}

export default function Timer({ teamName }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [showStopAlarm, setShowStopAlarm] = useState(false);
  const [selectedSound, setSelectedSound] = useState('/sounds/alarm.wav');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateDisplay = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const enableAudio = async () => {
    try {
      // Create and play a silent audio to enable audio context
      const audio = new Audio();
      audio.volume = 0;
      
      // Try to play the audio
      await audio.play();
      
      // If successful, enable audio
      setAudioEnabled(true);
      setAudioError(null);
      audio.pause();
    } catch (error) {
      console.error("Audio initialization failed:", error);
      setAudioError("Please interact with the page to enable sound playback.");
    }
  };

  const playSound = async () => {
    if (!audioEnabled) {
      setAudioError("Please click the 'Enable Sound' button to allow audio playback.");
      return;
    }

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Create new audio instance
      const audio = new Audio(selectedSound);
      audio.volume = 1;
      audio.muted = false;
      
      // Set loop to true for continuous alarm sound
      audio.loop = true;
      
      // Add error event listener
      audio.onerror = (error) => {
        console.error("Audio error:", error);
        setAudioError("Failed to load sound file. Please check if the sound file exists.");
      };
      
      // Play the audio
      await audio.play();
      
      // Store the audio reference
      audioRef.current = audio;
      setAudioError(null);
    } catch (error) {
      console.error("Audio playback failed:", error);
      setAudioError("Failed to play sound. Please check if the sound file exists and try again.");
    }
  };

  const startTimer = () => {
    if (isRunning) {
      // Resume existing timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      
      timerInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === undefined || prev <= 0) return 0;
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerInterval.current!);
            setIsRunning(false);
            playSound();
            setShowStopAlarm(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      // Start new timer
      const mins = parseInt(minutes) || 0;
      const secs = parseInt(seconds) || 0;
      const duration = (mins * 60) + secs;

      if (isNaN(duration) || duration <= 0) {
        alert('Please enter a valid time in minutes and seconds.');
        return;
      }

      setTimeLeft(duration);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTimeLeft(undefined);
    setIsRunning(false);
    setShowStopAlarm(false);
    setMinutes('');
    setSeconds('');
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowStopAlarm(false);
    resetTimer();
  };

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className={styles.timer}>
      <h3>{teamName} Timer</h3>
      {!audioEnabled && (
        <button onClick={enableAudio} className={styles.button}>
          Enable Sound
        </button>
      )}
      {audioError && (
        <div className={styles.errorMessage}>
          {audioError}
        </div>
      )}
      <select 
        value={selectedSound}
        onChange={(e) => setSelectedSound(e.target.value)}
        className={styles.soundSelect}
      >
        <option value="/sounds/alarm.wav">Alarm</option>
        <option value="/sounds/ding.mp3">Ding</option>
        <option value="/sounds/chime.mp3">Chime</option>
      </select>
      <div className={styles.timeDisplay}>
        {timeLeft !== undefined ? updateDisplay(timeLeft) : '00:00'}
      </div>
      <div className={styles.inputs}>
        <div>
          <label htmlFor={`${teamName}Minutes`}>Minutes:</label>
          <input
            type="number"
            id={`${teamName}Minutes`}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Minutes"
            min="0"
            disabled={isRunning}
          />
        </div>
        <div>
          <label htmlFor={`${teamName}Seconds`}>Seconds:</label>
          <input
            type="number"
            id={`${teamName}Seconds`}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            placeholder="Seconds"
            min="0"
            max="59"
            disabled={isRunning}
          />
        </div>
      </div>
      <div className={styles.controls}>
        <button onClick={startTimer} className={styles.button}>
          {isRunning ? 'Resume' : 'Start'}
        </button>
        <button onClick={pauseTimer} className={styles.button}>
          Pause
        </button>
        <button onClick={resetTimer} className={styles.button}>
          Reset
        </button>
        {showStopAlarm && (
          <button onClick={stopAlarm} className={styles.button}>
            Stop Alarm
          </button>
        )}
      </div>
    </div>
  );
} 