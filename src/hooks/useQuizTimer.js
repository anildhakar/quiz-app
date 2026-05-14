import { useState, useEffect, useRef } from "react";

export const useQuizTimer = (initialTime, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef(null);

  useEffect(() => {
    
    if (initialTime === null) return;

    setTimeLeft(initialTime);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);  
          intervalRef.current = null;

          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [initialTime, onTimeUp]);

  return { timeLeft, setTimeLeft };
};