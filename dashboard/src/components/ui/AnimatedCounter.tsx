import { ReactNode, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

export function AnimatedCounter({ 
  value, 
  duration = 2,
  format = (val) => Math.round(val).toLocaleString() 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(format(latest));
    });
    return () => unsubscribe();
  }, [spring]); // Removed format from dependencies to prevent infinite loop

  return <>{displayValue}</>;
}
