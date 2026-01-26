import './ValentineCardAnimation.css';

export function ValentineCardAnimation() {
  return (
    <div className="valentine-card-container">
      {/* Corazones flotantes animados */}
      <div className="floating-heart heart-1">❤️</div>
      <div className="floating-heart heart-2">❤️</div>
      <div className="floating-heart heart-3">❤️</div>
      
      {/* Sombra del sobre */}
      <div className="envelope-shadow"></div>
      
      {/* Sobre */}
      <div className="envelope">
        {/* Flap superior abierto */}
        <div className="envelope-flap"></div>
        
        {/* Cuerpo del sobre */}
        <div className="envelope-body">
          {/* Tarjeta que se asoma */}
          <div className="card">
            {/* Borde punteado superior */}
            <div className="card-border">
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot heart-in-border">❤️</span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
              <span className="border-dot"></span>
            </div>
            
            {/* Texto de la tarjeta */}
            <div className="card-text">
              <span className="text-word">Happy</span>
              <span className="text-word">Valentine<span className="heart-dot">❤️</span>'s</span>
              <span className="text-word">Day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
