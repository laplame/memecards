import { ArrowLeft, Shield, Heart, Users } from 'lucide-react';
import { Footer } from './Footer';
import { Header } from './Header';

export function AntiBullying() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col">
      <Header title="Política Anti-Bullying" />
      <div className="container mx-auto px-4 max-w-4xl py-8 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-800">Política Anti-Bullying</h1>
          </div>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-lg font-semibold text-red-800">
                Estamos comprometidos a crear un ambiente seguro, respetuoso y libre de acoso para todos nuestros usuarios.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Nuestro Compromiso
              </h2>
              <p>
                Creemos que cada persona merece ser tratada con respeto y dignidad. No toleramos ningún tipo de 
                acoso, intimidación, discriminación o comportamiento dañino en nuestra plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-500" />
                ¿Qué Consideramos Bullying?
              </h2>
              <p className="mb-3">El bullying incluye, pero no se limita a:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Mensajes de voz o texto que insulten, amenacen o intimiden</li>
                <li>Contenido que discrimine por raza, género, orientación sexual, religión o discapacidad</li>
                <li>Compartir información personal de otros sin consentimiento</li>
                <li>Crear contenido falso o difamatorio sobre otras personas</li>
                <li>Cualquier forma de acoso cibernético o digital</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                <Users className="w-6 h-6 mr-2 text-red-500" />
                Nuestras Acciones
              </h2>
              <p className="mb-3">Cuando detectamos o recibimos reportes de contenido que viola esta política:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Eliminamos inmediatamente el contenido ofensivo</li>
                <li>Prohibimos permanentemente a los usuarios que violen esta política</li>
                <li>Colaboramos con las autoridades cuando sea necesario</li>
                <li>Mantenemos un registro de violaciones para prevenir futuros incidentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Reportar Bullying</h2>
              <p>
                Si encuentras contenido que viola nuestra política anti-bullying, por favor repórtalo inmediatamente. 
                Puedes contactarnos a través de nuestro sistema de reportes o por correo electrónico.
              </p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Email de reportes:</strong> reportes@memecards.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Consecuencias</h2>
              <p>
                Las violaciones de esta política resultarán en la eliminación inmediata del contenido y pueden 
                resultar en la prohibición permanente de la cuenta. En casos graves, podemos tomar acciones legales.
              </p>
            </section>

            <div className="mt-8 p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl">
              <p className="text-lg font-semibold mb-2">Juntos podemos crear un espacio seguro</p>
              <p className="text-sm opacity-90">
                Tu ayuda es esencial para mantener nuestra comunidad libre de acoso. Si ves algo, di algo.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
