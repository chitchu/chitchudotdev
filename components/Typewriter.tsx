import { useEffect, useState, useRef, useCallback } from 'react';

interface TypewriterProps {
  prefix: string;
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  className?: string;
}

export default function Typewriter({
  prefix,
  words,
  typingSpeed = 100,
  deletingSpeed = 60,
  pauseAfterType = 2000,
  pauseAfterDelete = 500,
  className,
}: TypewriterProps) {
  const [displayedWord, setDisplayedWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const wordIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const tick = useCallback(() => {
    const currentWord = words[wordIndexRef.current];

    if (!isDeleting) {
      // Typing
      const next = currentWord.slice(0, displayedWord.length + 1);
      setDisplayedWord(next);

      if (next === currentWord) {
        // Finished typing, pause then start deleting
        timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseAfterType);
        return;
      }
      timeoutRef.current = setTimeout(tick, typingSpeed + Math.random() * 40);
    } else {
      // Deleting
      const next = currentWord.slice(0, displayedWord.length - 1);
      setDisplayedWord(next);

      if (next === '') {
        // Finished deleting, move to next word
        setIsDeleting(false);
        wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
        timeoutRef.current = setTimeout(tick, pauseAfterDelete);
        return;
      }
      timeoutRef.current = setTimeout(tick, deletingSpeed + Math.random() * 20);
    }
  }, [displayedWord, isDeleting, words, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  useEffect(() => {
    timeoutRef.current = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [tick, typingSpeed]);

  return (
    <span className={className}>
      {prefix}
      <span>{displayedWord}</span>
      <span style={{
        borderRight: '2px solid rgba(180, 190, 255, 0.8)',
        marginLeft: '2px',
        animation: 'blink 0.8s step-end infinite',
      }} />
    </span>
  );
}
