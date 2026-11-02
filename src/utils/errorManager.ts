/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let listeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export const errorManager = {
  subscribe(listener: (toasts: ToastMessage[]) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message };
    toasts = [...toasts, newToast];
    listeners.forEach(l => l(toasts));

    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      listeners.forEach(l => l(toasts));
    }, 4000);
  },

  handleError(error: unknown, fallbackMessage = 'An unexpected error occurred') {
    const msg = error instanceof Error ? error.message : fallbackMessage;
    console.error('[LambdaLens Error]:', error);
    this.notify(msg, 'error');
  }
};
