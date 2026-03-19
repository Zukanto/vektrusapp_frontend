import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedText(text: string, delimiter: string = "") {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    if (!text) {
      setCursor(0);
      return;
    }

    const parts = text.split(delimiter);

    let duration: number;
    if (delimiter === "") {
      const textLength = text.length;
      duration = Math.min(Math.max(textLength / 80, 2.5), 4.5);
    } else if (delimiter === " ") {
      duration = 2.5;
    } else {
      duration = 1.8;
    }

    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}