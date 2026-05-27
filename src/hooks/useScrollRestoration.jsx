import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = {};
const RESTORE_OFFSET = 200; // change this: 80 / 100 / 120 depending on your UI


export function clearSavedScroll(path) {
  delete scrollPositions[path];
}

export function useScrollRestoration() {
  const location = useLocation();
  const path = location.pathname + location.search;
  const prevPathRef = useRef(null);

  // Save scroll position while scrolling
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[path] = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [path]);

  // Restore scroll on route change
  useEffect(() => {
    const savedScrollY = scrollPositions[path];
    const isNewPath = prevPathRef.current !== path;

    if (!isNewPath) return;

    const timer = setTimeout(() => {
      if (savedScrollY !== undefined && savedScrollY > 0) {
        const targetY = Math.max(0, savedScrollY - RESTORE_OFFSET);

        window.scrollTo({
          top: targetY,
          behavior: "auto",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 100);

    prevPathRef.current = path;
    return () => clearTimeout(timer);
  }, [path]);
}