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

function getSharedPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
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
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const wordIndexRef = useRef(0);
  const deleteTargetRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const tick = useCallback(() => {
    const currentWord = words[wordIndexRef.current];
    const nextWordIndex = (wordIndexRef.current + 1) % words.length;
    const nextWord = words[nextWordIndex];

    if (!isDeleting) {
      // Typing forward
      const next = currentWord.slice(0, displayed.length + 1);
      setDisplayed(next);

      if (next === currentWord) {
        // Finished typing — figure out how far to delete
        const shared = getSharedPrefixLength(currentWord, nextWord);
        deleteTargetRef.current = shared;
        timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseAfterType);
        return;
      }
      timeoutRef.current = setTimeout(tick, typingSpeed + Math.random() * 40);
    } else {
      // Deleting back to shared prefix
      const next = currentWord.slice(0, displayed.length - 1);
      setDisplayed(next);

      if (next.length <= deleteTargetRef.current) {
        // Done deleting, advance to next word and start typing
        setIsDeleting(false);
        wordIndexRef.current = nextWordIndex;
        timeoutRef.current = setTimeout(tick, pauseAfterDelete);
        return;
      }
      timeoutRef.current = setTimeout(tick, deletingSpeed + Math.random() * 20);
    }
  }, [displayed, isDeleting, words, typingSpeed, deletingSpeed, pauseAfterType, pauseAfterDelete]);

  useEffect(() => {
    timeoutRef.current = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [tick, typingSpeed]);

  return (
    <span className={className}>
      {prefix}
      <span>{displayed}</span>
      <span style={{
        borderRight: '2px solid rgba(180, 190, 255, 0.8)',
        marginLeft: '2px',
        animation: 'blink 0.8s step-end infinite',
      }} />
    </span>
  );
}
