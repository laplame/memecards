import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { CreateCardForm } from './components/CreateCardForm';
import { CardSuccess } from './components/CardSuccess';
import { CardDisplay } from './components/CardDisplay';
import { Dashboard } from './components/Dashboard';
import { StoresDashboard } from './components/StoresDashboard';
import { StorePage } from './components/StorePage';
import { TermsAndConditions } from './components/TermsAndConditions';
import { AntiBullying } from './components/AntiBullying';

type View = 'landing' | 'create' | 'success' | 'display' | 'dashboard' | 'stores-dashboard' | 'store' | 'terms' | 'antibullying';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [cardCode, setCardCode] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const cardMatch = path.match(/\/card\/([A-Z0-9]{8})/);
    const storeMatch = path.match(/^\/([a-f0-9]{24})$/); // MongoDB ObjectId

    if (cardMatch) {
      const code = cardMatch[1];
      setCardCode(code);
      setCurrentView('display');
    } else if (storeMatch) {
      setCurrentView('store');
      // StorePage manejará el storeId desde la URL
    } else if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else if (path === '/stores-dashboard' || path === '/admin/stores') {
      setCurrentView('stores-dashboard');
    } else if (path === '/terminos') {
      setCurrentView('terms');
    } else if (path === '/antibullying') {
      setCurrentView('antibullying');
    }
  }, []);

  const handleBack = () => {
    setCurrentView('landing');
    window.history.pushState({}, '', '/');
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

  const handleSearchCard = (code: string) => {
    setCardCode(code);
    setCurrentView('display');
    window.history.pushState({}, '', `/card/${code}`);
  };

  if (currentView === 'store') {
    const path = window.location.pathname;
    const storeMatch = path.match(/^\/([a-f0-9]{24})$/);
    if (storeMatch) {
      return <StorePage storeId={storeMatch[1]} />;
    }
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

  if (currentView === 'terms') {
    return <TermsAndConditions />;
  }

  if (currentView === 'antibullying') {
    return <AntiBullying />;
  }

  return <LandingPage onSearchCard={handleSearchCard} />;
}

export default App;
