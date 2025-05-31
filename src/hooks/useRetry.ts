import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  onError?: (error: Error, attempt: number) => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  attempt: number;
  reset: () => void;
}

export const useRetry = <T>(
  options: UseRetryOptions = {}
): UseRetryReturn<T> => {
  const { maxAttempts = 3, delay = 1000, onError } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    let currentAttempt = 0;
    setIsRetrying(false);
    setAttempt(0);

    while (currentAttempt < maxAttempts) {
      try {
        setAttempt(currentAttempt + 1);
        const result = await fn();
        setIsRetrying(false);
        return result;
      } catch (error) {
        currentAttempt++;
        setAttempt(currentAttempt);
        
        if (onError) {
          onError(error as Error, currentAttempt);
        }
        
        if (currentAttempt >= maxAttempts) {
          setIsRetrying(false);
          throw error;
        }
        
        setIsRetrying(true);
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, currentAttempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('Max retry attempts reached');
  }, [maxAttempts, delay, onError]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttempt(0);
  }, []);

  return {
    execute,
    isRetrying,
    attempt,
    reset
  };
};