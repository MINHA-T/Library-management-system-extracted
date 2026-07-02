'use client';

/**
 * UIProvider
 * ------------------------------------
 * Reimplements the shared UI plumbing that used to live in main.js:
 * - showAlert(message, type)      -> toast-style alerts, top-right
 * - showLoading() / hideLoading() -> full-screen loading overlay
 * - confirmAction(title, msg, cb) -> shared confirmation modal
 *
 * Rendered once inside the protected layout so every page can use it
 * via the useUI() hook.
 */
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const UIContext = createContext(null);

let alertIdCounter = 0;

export function UIProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
  });
  const confirmCallbackRef = useRef(null);

  const showAlert = useCallback((message, type = 'success') => {
    const id = ++alertIdCounter;
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 3200);
  }, []);

  const showLoading = useCallback(() => setLoadingCount((c) => c + 1), []);
  const hideLoading = useCallback(() => setLoadingCount((c) => Math.max(0, c - 1)), []);

  const confirmAction = useCallback((title, message, callback) => {
    confirmCallbackRef.current = callback;
    setConfirmState({ open: true, title, message });
  }, []);

  const handleConfirmOk = () => {
    setConfirmState((s) => ({ ...s, open: false }));
    const cb = confirmCallbackRef.current;
    confirmCallbackRef.current = null;
    if (typeof cb === 'function') cb();
  };

  const handleConfirmCancel = () => {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmCallbackRef.current = null;
  };

  return (
    <UIContext.Provider value={{ showAlert, showLoading, hideLoading, confirmAction }}>
      {children}

      {/* Alert container */}
      <div className="alert-container">
        {alerts.map((a) => (
          <div key={a.id} className={'alert ' + (a.type === 'error' ? 'alert-error' : 'alert-success')}>
            {a.message}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <div className={'modal-overlay' + (confirmState.open ? ' active' : '')}>
        <div className="modal modal-sm">
          <h3>{confirmState.title}</h3>
          <p>{confirmState.message}</p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={handleConfirmCancel}>Cancel</button>
            <button className="btn btn-danger" onClick={handleConfirmOk}>Confirm</button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <div className={'loading-overlay' + (loadingCount > 0 ? ' active' : '')}>
        <div className="spinner"></div>
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within a UIProvider');
  return ctx;
}
