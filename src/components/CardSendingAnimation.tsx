import { useState, useEffect } from 'react';
import './CardSendingAnimation.css';

interface CardSendingAnimationProps {
  senderName: string;
  recipientName: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  onAnimationComplete: () => void;
}

export function CardSendingAnimation({
  senderName,
  recipientName,
  message,
  imageUrl,
  audioUrl,
  onAnimationComplete,
}: CardSendingAnimationProps) {
  const [animationStage, setAnimationStage] = useState<'show' | 'insert' | 'close' | 'send' | 'complete'>('show');
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const timeline = async () => {
      // Mostrar tarjeta con contenido (2.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Insertar en sobre (1.5 segundos)
      setAnimationStage('insert');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Cerrar sobre (1 segundo)
      setAnimationStage('close');
      setShowContent(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enviar sobre (2.5 segundos)
      setAnimationStage('send');
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Completar
      setAnimationStage('complete');
      onAnimationComplete();
    };

    timeline();
  }, [onAnimationComplete]);

  return (
    <div className="card-sending-container">
      <div className="sending-background"></div>
      
      {/* Corazones flotantes */}
      <div className="sending-heart heart-1">❤️</div>
      <div className="sending-heart heart-2">❤️</div>
      <div className="sending-heart heart-3">❤️</div>
      <div className="sending-heart heart-4">❤️</div>
      
      {/* Sombra del sobre */}
      <div className={`envelope-shadow-sending ${animationStage}`}></div>
      
      {/* Sobre */}
      <div className={`envelope-sending ${animationStage}`}>
        {/* Flap superior */}
        <div className={`envelope-flap-sending ${animationStage}`}></div>
        
        {/* Cuerpo del sobre */}
        <div className="envelope-body-sending">
          {/* Tarjeta con contenido */}
          <div className={`card-with-content ${animationStage}`}>
            {showContent && (
              <>
                {/* Imagen si existe */}
                {imageUrl && (
                  <div className="card-image-preview">
                    <img src={imageUrl} alt="Tarjeta personalizada" />
                  </div>
                )}
                
                {/* Contenido de la tarjeta */}
                <div className="card-content-preview">
                  <div className="card-preview-header">
                    <p className="card-preview-to">Para: <strong>{recipientName}</strong></p>
                    <p className="card-preview-from">De: <strong>{senderName}</strong></p>
                  </div>
                  
                  <div className="card-preview-message">
                    <p>{message}</p>
                  </div>
                  
                  {audioUrl && (
                    <div className="card-preview-audio">
                      <div className="audio-indicator">
                        <span className="audio-wave">🎵</span>
                        <span>Mensaje de voz incluido</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mensaje de estado */}
      <div className={`sending-message ${animationStage}`}>
        {animationStage === 'show' && <p>Preparando tu tarjeta...</p>}
        {animationStage === 'insert' && <p>Insertando en el sobre...</p>}
        {animationStage === 'close' && <p>Cerrando el sobre...</p>}
        {animationStage === 'send' && <p>¡Enviando tu tarjeta! 💌</p>}
      </div>
    </div>
  );
}
