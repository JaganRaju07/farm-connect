'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const BlobCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.tagName.toLowerCase() === 'input'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(mousePosition.x - 24, springConfig);
  const cursorY = useSpring(mousePosition.y - 24, springConfig);

  return (
    <>
      {/* Outer Blob */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: 1
        }}
        className="fixed top-0 left-0 w-12 h-12 rounded-full bg-primary-500/20 mix-blend-multiply filter blur-[8px] pointer-events-none z-[100] dark:mix-blend-screen hidden md:block"
      />
      {/* Inner Dot */}
      <motion.div
        style={{
          x: useSpring(mousePosition.x - 4, { damping: 30, stiffness: 400 }),
          y: useSpring(mousePosition.y - 4, { damping: 30, stiffness: 400 }),
        }}
        className="fixed top-0 left-0 w-2 h-2 bg-primary-600 rounded-full pointer-events-none z-[100] shadow-[0_0_10px_rgba(21,128,61,0.5)] hidden md:block"
      />
    </>
  );
};
