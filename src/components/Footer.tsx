import { Heart, Mail, Phone, MapPin, FileText, Shield, Users, HelpCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-red-400 fill-red-400" />
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
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Términos y Condiciones</span>
                </a>
              </li>
              <li>
                <a
                  href="/antibullying"
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Política Anti-Bullying</span>
                </a>
              </li>
              <li>
                <a
                  href="/privacidad"
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
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
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>contacto@memecards.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+525512345678"
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
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
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Preguntas Frecuentes</span>
                </a>
              </li>
              <li>
                <a
                  href="/feed"
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Feed</span>
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-white/90 hover:text-yellow-200 transition-colors text-sm flex items-center space-x-2"
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
              <p className="mt-1 font-semibold text-yellow-300">Patente en trámite</p>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>en México</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
