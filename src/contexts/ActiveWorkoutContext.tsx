import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  scheduleRestTimerNotification,
  cancelRestTimerNotification,
} from '../services/notifications';
import { REST_TIMER_DEFAULTS } from '../constants/programs';

interface ActiveWorkoutContextValue {
  activeWorkoutId: number | null;
  setActiveWorkoutId: (id: number | null) => void;
  // Rest timer
  restTimerSeconds: number;
  restTimerActive: boolean;
  startRestTimer: (seconds?: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  skipRestTimer: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextValue | null>(null);

export function ActiveWorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopRestTimer = useCallback(() => {
    clearInterval_();
    setRestTimerActive(false);
    setRestTimerSeconds(0);
    cancelRestTimerNotification();
  }, [clearInterval_]);

  const startRestTimer = useCallback(
    (seconds: number = REST_TIMER_DEFAULTS.competition, exerciseName: string = 'next') => {
      stopRestTimer();
      setRestTimerSeconds(seconds);
      setRestTimerActive(true);

      scheduleRestTimerNotification(seconds, exerciseName);

      let remaining = seconds;
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        setRestTimerSeconds(remaining);
        if (remaining <= 0) {
          clearInterval_();
          setRestTimerActive(false);
        }
      }, 1000);
    },
    [stopRestTimer, clearInterval_]
  );

  const skipRestTimer = useCallback(() => {
    stopRestTimer();
  }, [stopRestTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval_();
      cancelRestTimerNotification();
    };
  }, [clearInterval_]);

  return (
    <ActiveWorkoutContext.Provider
      value={{
        activeWorkoutId,
        setActiveWorkoutId,
        restTimerSeconds,
        restTimerActive,
        startRestTimer,
        stopRestTimer,
        skipRestTimer,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout(): ActiveWorkoutContextValue {
  const ctx = useContext(ActiveWorkoutContext);
  if (!ctx) throw new Error('useActiveWorkout must be used within ActiveWorkoutProvider');
  return ctx;
}
