import { useState, useEffect } from 'preact/hooks';

/**
 * Universal Preact hook for URL query parameter hydration and real-time state synchronization.
 * 
 * @param {Object} defaultState - Initial default values for calculator state
 * @param {Object} [paramMap] - Custom URL query parameter mapping (e.g. { amount: 'amount', rate: 'rate' })
 * @returns {[Object, Function, Function]} - [state, setSingleParam, resetState]
 */
export function useUrlSync(defaultState, paramMap = {}) {
  const [state, setState] = useState(defaultState);

  // 1. Hydrate state from window.location.search on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const updated = { ...defaultState };
    let hasChanges = false;

    Object.keys(defaultState).forEach((key) => {
      const urlKey = paramMap[key] || key;
      const paramVal = searchParams.get(urlKey);

      if (paramVal !== null && paramVal !== undefined) {
        const defaultVal = defaultState[key];
        if (typeof defaultVal === 'number') {
          const num = Number(paramVal);
          if (!isNaN(num)) {
            updated[key] = num;
            hasChanges = true;
          }
        } else if (typeof defaultVal === 'boolean') {
          updated[key] = paramVal === 'true';
          hasChanges = true;
        } else {
          updated[key] = paramVal;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setState(updated);
    }
  }, []);

  // 2. Sync state changes back to URL query parameters via replaceState
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;

    const searchParams = new URLSearchParams();
    Object.keys(state).forEach((key) => {
      const val = state[key];
      const urlKey = paramMap[key] || key;

      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(urlKey, String(val));
      }
    });

    const queryString = searchParams.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [state, paramMap]);

  const setParam = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const resetState = () => {
    setState(defaultState);
  };

  return [state, setParam, resetState];
}
