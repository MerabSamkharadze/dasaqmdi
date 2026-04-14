import { useEffect, useRef, type RefObject } from "react";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult = { error: null };

export function useScrollOnSave(
  state: ActionResult,
  formRef: RefObject<HTMLFormElement | null>,
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (state === initialState) return;

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state, formRef]);
}
