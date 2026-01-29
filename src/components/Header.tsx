import { Heart, Home, Grid3x3, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  showDashboardLink?: boolean;
}

export function Header({ title = 'MemeCards', showNavigation = true, showDashboardLink = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 fill-white" />
            <a href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              {title}
            </a>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <>
              <nav className="hidden md:flex items-center space-x-6">
                <a
                  href="/"
                  className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </a>
                <a
                  href="/feed"
                  className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium"
                >
                  <Grid3x3 className="w-5 h-5" />
                  <span>Feed</span>
                </a>
                {showDashboardLink && (
                  <a
                    href="/dashboard"
                    className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard</span>
                  </a>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Menú"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {showNavigation && mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20 mt-4 pt-4">
            <nav className="flex flex-col space-y-3">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium py-2"
              >
                <Home className="w-5 h-5" />
                <span>Inicio</span>
              </a>
              <a
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium py-2"
              >
                <Grid3x3 className="w-5 h-5" />
                <span>Feed</span>
              </a>
              {showDashboardLink && (
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 hover:text-yellow-200 transition-colors font-medium py-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
