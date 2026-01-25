import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { CreateCardForm } from './components/CreateCardForm';
import { CardSuccess } from './components/CardSuccess';
import { CardDisplay } from './components/CardDisplay';
import { Dashboard } from './components/Dashboard';
import { StoresDashboard } from './components/StoresDashboard';
import { StorePage } from './components/StorePage';

type View = 'landing' | 'create' | 'success' | 'display' | 'dashboard' | 'stores-dashboard' | 'store';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [cardCode, setCardCode] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/card\/([A-Z0-9]{8})/);

    if (match) {
      const code = match[1];
      setCardCode(code);
      setCurrentView('display');
    } else if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else if (path === '/stores-dashboard' || path === '/admin/stores') {
      setCurrentView('stores-dashboard');
    }
  }, []);

  const handleCreateCard = () => {
    setCurrentView('create');
  };

  const handleBack = () => {
    setCurrentView('landing');
  };

  const handleSuccess = (code: string) => {
    setCardCode(code);
    setCurrentView('success');
    window.history.pushState({}, '', '/');
  };

  const handleCreateAnother = () => {
    setCardCode('');
    setCurrentView('landing');
  };

  if (currentView === 'store' && storeId) {
    return <StorePage storeId={storeId} />;
  }

  if (currentView === 'stores-dashboard') {
    return <StoresDashboard />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  if (currentView === 'display' && cardCode) {
    return <CardDisplay code={cardCode} />;
  }

  if (currentView === 'success' && cardCode) {
    return <CardSuccess code={cardCode} onCreateAnother={handleCreateAnother} />;
  }

  if (currentView === 'create') {
    return <CreateCardForm onBack={handleBack} onSuccess={handleSuccess} />;
  }

  return <LandingPage onCreateCard={handleCreateCard} />;
}

export default App;
