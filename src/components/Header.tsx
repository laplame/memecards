import { Heart, Home, Grid3x3, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type HeaderFooterTheme =
  | 'valentine'
  | 'friendship'
  | 'mothers-day'
  | 'fathers-day'
  | 'birthday'
  | 'teachers-day'
  | 'grandparents-day'
  | 'christmas'
  | 'default';

// Clases completas para que Tailwind las incluya (no usar variables dinámicas)
const HEADER_BG: Record<HeaderFooterTheme, string> = {
  valentine: 'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600',
  friendship: 'bg-gradient-to-r from-sky-600 via-teal-500 to-cyan-500',
  'mothers-day': 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600',
  'fathers-day': 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',
  birthday: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500',
  'teachers-day': 'bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500',
  'grandparents-day': 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600',
  christmas: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600',
  default: 'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600',
};
const HEADER_HOVER: Record<HeaderFooterTheme, string> = {
  valentine: 'hover:text-yellow-200',
  friendship: 'hover:text-sky-200',
  'mothers-day': 'hover:text-pink-200',
  'fathers-day': 'hover:text-blue-200',
  birthday: 'hover:text-yellow-200',
  'teachers-day': 'hover:text-purple-200',
  'grandparents-day': 'hover:text-amber-200',
  christmas: 'hover:text-green-200',
  default: 'hover:text-yellow-200',
};

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  showDashboardLink?: boolean;
  theme?: HeaderFooterTheme;
}

export function Header({ title = 'MemeCards', showNavigation = true, showDashboardLink = true, theme = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bg = HEADER_BG[theme] ?? HEADER_BG.default;
  const hover = HEADER_HOVER[theme] ?? HEADER_HOVER.default;

  return (
    <header className={`${bg} text-white shadow-lg sticky top-0 z-50 transition-colors duration-300`}>
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
                  className={'flex items-center space-x-2 transition-colors font-medium ' + hover}
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </a>
                <a
                  href="/feed"
                  className={'flex items-center space-x-2 transition-colors font-medium ' + hover}
                >
                  <Grid3x3 className="w-5 h-5" />
                  <span>Feed</span>
                </a>
                {showDashboardLink && (
                  <a
                    href="/dashboard"
                    className={'flex items-center space-x-2 transition-colors font-medium ' + hover}
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
                className={'flex items-center space-x-2 transition-colors font-medium py-2 ' + hover}
              >
                <Home className="w-5 h-5" />
                <span>Inicio</span>
              </a>
              <a
                href="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className={'flex items-center space-x-2 transition-colors font-medium py-2 ' + hover}
              >
                <Grid3x3 className="w-5 h-5" />
                <span>Feed</span>
              </a>
              {showDashboardLink && (
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={'flex items-center space-x-2 transition-colors font-medium py-2 ' + hover}
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
