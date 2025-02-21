"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3; // Allow up to 3 concurrent toasts
const TOAST_REMOVE_DELAY = 5000; // Remove toasts after 5 seconds

// 🔹 Define Toast type
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// 🔹 Enum for action types
enum ActionTypes {
  ADD_TOAST = "ADD_TOAST",
  UPDATE_TOAST = "UPDATE_TOAST",
  DISMISS_TOAST = "DISMISS_TOAST",
  REMOVE_TOAST = "REMOVE_TOAST",
}

// 🔹 Generate unique toast IDs
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// 🔹 Action types for reducer
type Action =
  | { type: ActionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: ActionTypes.UPDATE_TOAST; toast: Partial<ToasterToast> }
  | { type: ActionTypes.DISMISS_TOAST; toastId?: ToasterToast["id"] }
  | { type: ActionTypes.REMOVE_TOAST; toastId?: ToasterToast["id"] };

// 🔹 Toast state interface
interface State {
  toasts: ToasterToast[];
}

// 🔹 Timeout tracking for toast auto-removal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: ActionTypes.REMOVE_TOAST, toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// 🔹 Reducer function to handle state changes
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ActionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case ActionTypes.DISMISS_TOAST:
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };

    case ActionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// 🔹 Listeners to update UI when state changes
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// 🔹 Toast function to add/update/dismiss toasts
type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({ type: ActionTypes.UPDATE_TOAST, toast: { ...props, id } });

  const dismiss = () => dispatch({ type: ActionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: ActionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

// 🔹 Custom hook to use toasts in React components
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []); // ✅ Runs only once

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: ActionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
