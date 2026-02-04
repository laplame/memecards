import { Heart, Mail, Phone, MapPin, FileText, Shield, Users, HelpCircle } from 'lucide-react';
import type { HeaderFooterTheme } from './Header';

// Clases completas para que Tailwind las incluya
const FOOTER_BG: Record<HeaderFooterTheme, string> = {
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
const FOOTER_HOVER: Record<HeaderFooterTheme, string> = {
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
const FOOTER_ACCENT: Record<HeaderFooterTheme, string> = {
  valentine: 'text-yellow-300',
  friendship: 'text-sky-200',
  'mothers-day': 'text-pink-200',
  'fathers-day': 'text-blue-200',
  birthday: 'text-amber-200',
  'teachers-day': 'text-purple-200',
  'grandparents-day': 'text-amber-200',
  christmas: 'text-green-200',
  default: 'text-yellow-300',
};

interface FooterProps {
  theme?: HeaderFooterTheme;
}

export function Footer({ theme = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const bg = FOOTER_BG[theme] ?? FOOTER_BG.default;
  const hover = FOOTER_HOVER[theme] ?? FOOTER_HOVER.default;
  const accent = FOOTER_ACCENT[theme] ?? FOOTER_ACCENT.default;

  return (
    <footer className={`${bg} text-white mt-auto transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className={'w-6 h-6 fill-current ' + accent} />
              <h3 className="text-xl font-bold">MemeCards</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Crea tarjetas híbridas únicas que combinan el encanto físico con la magia digital.
              Expresa tus sentimientos de forma especial.
            </p>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2 text-white">
              <FileText className="w-5 h-5" />
              <span>Legal</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/terminos"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <FileText className="w-4 h-4" />
                  <span>Términos y Condiciones</span>
                </a>
              </li>
              <li>
                <a
                  href="/antibullying"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Shield className="w-4 h-4" />
                  <span>Política Anti-Bullying</span>
                </a>
              </li>
              <li>
                <a
                  href="/privacidad"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Shield className="w-4 h-4" />
                  <span>Política de Privacidad</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2 text-white">
              <Mail className="w-5 h-5" />
              <span>Contacto</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contacto@memecards.com"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Mail className="w-4 h-4" />
                  <span>contacto@memecards.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+525512345678"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Phone className="w-4 h-4" />
                  <span>+52 55 1234 5678</span>
                </a>
              </li>
              <li className="text-white/90 text-sm flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Ciudad de México, México</span>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2 text-white">
              <HelpCircle className="w-5 h-5" />
              <span>Ayuda</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/faq"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Preguntas Frecuentes</span>
                </a>
              </li>
              <li>
                <a
                  href="/feed"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Feed</span>
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className={'text-white/90 transition-colors text-sm flex items-center space-x-2 ' + hover}
                >
                  <Users className="w-4 h-4" />
                  <span>Dashboard</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/90 text-sm text-center md:text-left">
              <p>© {currentYear} MemeCards. Todos los derechos reservados.</p>
              <p className={'mt-1 font-semibold ' + accent}>Patente en trámite</p>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <span>Hecho con</span>
              <Heart className={'w-4 h-4 fill-current ' + accent} />
              <span>en México</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
