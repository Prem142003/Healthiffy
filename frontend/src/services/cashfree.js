let cashfreeInstance;
let initializedMode;

export const getCashfree = (mode) => {
  if (!window.Cashfree) {
    throw new Error('Cashfree checkout could not be loaded. Check your connection and try again.');
  }

  if (!cashfreeInstance) {
    cashfreeInstance = window.Cashfree({ mode });
    initializedMode = mode;
  }

  if (initializedMode !== mode) {
    throw new Error('Cashfree environment mismatch. Refresh the page and try again.');
  }

  return cashfreeInstance;
};
