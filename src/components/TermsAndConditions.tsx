import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';
import { Header } from './Header';

export function TermsAndConditions() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col">
      <Header title="Términos y Condiciones" />
      <div className="container mx-auto px-4 max-w-4xl py-8 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Términos y Condiciones</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar este servicio de creación de tarjetas digitales, aceptas cumplir con estos términos y condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Uso del Servicio</h2>
              <p>
                El servicio permite crear tarjetas digitales con mensajes de voz y contenido personalizado. 
                Te comprometes a utilizar el servicio de manera responsable y legal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Contenido del Usuario</h2>
              <p>
                Eres responsable de todo el contenido que subas, incluyendo mensajes de voz, imágenes y texto. 
                No debes subir contenido que:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Sea ofensivo, discriminatorio o promueva el acoso</li>
                <li>Viole derechos de propiedad intelectual</li>
                <li>Contenga información personal de terceros sin consentimiento</li>
                <li>Sea ilegal o promueva actividades ilegales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Política Anti-Bullying</h2>
              <p>
                Nos comprometemos a mantener un ambiente seguro y respetuoso. Cualquier contenido que promueva 
                el acoso, la intimidación o el daño será eliminado inmediatamente y puede resultar en la prohibición 
                permanente del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Limitación de Responsabilidad</h2>
              <p>
                El servicio se proporciona "tal cual" sin garantías. No nos hacemos responsables por la pérdida 
                de datos, interrupciones del servicio o cualquier daño derivado del uso del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios entrarán en vigor al publicarse en esta página.
              </p>
            </section>

            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
