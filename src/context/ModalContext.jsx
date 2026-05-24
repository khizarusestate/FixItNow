import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ModalContext = createContext(null);

const HASH_MODALS = new Set(['login', 'signup', 'worker', 'about']);

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = useCallback((name) => {
    setActiveModal(name);
    if (HASH_MODALS.has(name)) {
      window.history.replaceState(null, '', `#${name}`);
    }
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const switchModal = useCallback((name) => {
    setActiveModal(name);
    if (HASH_MODALS.has(name)) {
      window.history.replaceState(null, '', `#${name}`);
    }
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.replace(/^#/, '').toLowerCase();
      if (HASH_MODALS.has(id)) {
        setActiveModal(id);
      }
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    const onOpenLogin = () => openModal('login');
    const onOpenSignup = () => openModal('signup');
    window.addEventListener('fixitnow-open-login', onOpenLogin);
    window.addEventListener('fixitnow-open-signup', onOpenSignup);

    return () => {
      window.removeEventListener('hashchange', openFromHash);
      window.removeEventListener('fixitnow-open-login', onOpenLogin);
      window.removeEventListener('fixitnow-open-signup', onOpenSignup);
    };
  }, [openModal]);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal, switchModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
