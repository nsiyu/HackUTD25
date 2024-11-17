import { useState, useEffect } from 'react';

interface UseTextAnimationProps {
  originalText: string;
  newText: string;
  onComplete?: () => void;
  speed?: number;
}

export function useTextAnimation({
  originalText,
  newText,
  onComplete,
  speed = 50
}: UseTextAnimationProps) {
  const [displayText, setDisplayText] = useState(originalText);

  useEffect(() => {
    if (originalText === newText) {
      setDisplayText(newText);
      return;
    }

    let currentIndex = 0;
    const textLength = newText.length;
    
    const animationInterval = setInterval(() => {
      if (currentIndex <= textLength) {
        setDisplayText(newText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(animationInterval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(animationInterval);
  }, [originalText, newText, speed, onComplete]);

  return displayText;
}
