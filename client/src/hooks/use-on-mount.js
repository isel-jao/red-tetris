import { useEffect, useRef } from "react";

export function useOnMount(callback, cleanup) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      callback?.();
      hasRun.current = true;
    }

    return () => {
      if (cleanup && hasRun.current) {
        cleanup();
      }
    };
  }, []);
}
