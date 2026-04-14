import { useEffect, useRef, type RefObject } from "react";

/**
 * Scrolls to the top of a form when server action state changes (success or error).
 * Temporarily sets scroll-margin-top to clear the sticky header (56px = h-14).
 */
export function useScrollOnSave(
  state: { error: string | null },
  formRef: RefObject<HTMLFormElement | null>,
) {
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;

    const el = formRef.current;
    if (!el) return;

    // Set scroll-margin so sticky header doesn't cover the form top
    el.style.scrollMarginTop = "80px";
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state, formRef]);
}
