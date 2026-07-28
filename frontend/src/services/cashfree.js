let cashfreeInstance = null;
let cashfreeMode = null;

export const initializeCashfree = (mode) => {
  if (!['sandbox', 'production'].includes(mode)) {
    throw new Error('Cashfree checkout mode is invalid.');
  }

  if (!window.Cashfree) {
    throw new Error('Cashfree checkout could not be loaded.');
  }

  if (!cashfreeInstance || cashfreeMode !== mode) {
    cashfreeInstance = window.Cashfree({ mode });
    cashfreeMode = mode;
  }

  return cashfreeInstance;
};
