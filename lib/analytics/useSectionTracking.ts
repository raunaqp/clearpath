import { useRef, useEffect } from "react";
import posthog from "posthog-js";

export function useSectionTracking(sectionName: string) {
  const ref = useRef<HTMLElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          try {
            posthog.capture("section_viewed", { section_name: sectionName });
          } catch {}
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}
