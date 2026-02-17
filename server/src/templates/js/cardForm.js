    // Confeti al abrir el sobre (basado en confetti.ts)
    function startConfetti() {
      var container = document.getElementById('confettiCanvasContainer');
      if (!container) return;
      var canvas = document.createElement('canvas');
      canvas.id = 'confettiCanvas';
      container.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var W = window.innerWidth;
      var H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      var maxConfettis = 150;
      var particles = [];
      var possibleColors = ['DodgerBlue', 'OliveDrab', 'Gold', 'Pink', 'SlateBlue', 'LightBlue', 'Violet', 'PaleGreen', 'SteelBlue', 'SandyBrown', 'Chocolate', 'Crimson', '#ec4899', '#ef4444', '#fce4ec'];
      function randomFromTo(from, to) { return Math.floor(Math.random() * (to - from + 1) + from); }
      function ConfettiParticle() {
        this.x = Math.random() * W;
        this.y = Math.random() * H - H;
        this.r = randomFromTo(11, 33);
        this.d = Math.random() * maxConfettis + 11;
        this.color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;
        this.draw = function() {
          ctx.beginPath();
          ctx.lineWidth = this.r / 2;
          ctx.strokeStyle = this.color;
          ctx.moveTo(this.x + this.tilt + this.r / 3, this.y);
          ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
          ctx.stroke();
        };
      }
      for (var i = 0; i < maxConfettis; i++) particles.push(new ConfettiParticle());
      var startTime = Date.now();
      var duration = 5500;
      function draw() {
        if (Date.now() - startTime > duration) {
          if (container && canvas.parentNode) container.removeChild(canvas);
          return;
        }
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < maxConfettis; i++) {
          var p = particles[i];
          if (p) p.draw();
        }
        for (var i = 0; i < maxConfettis; i++) {
          var p = particles[i];
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;
          if (p.x > W + 30 || p.x < -30 || p.y > H) {
            p.x = Math.random() * W;
            p.y = -30;
            p.tilt = Math.floor(Math.random() * 10) - 20;
          }
        }
      }
      draw();
    }

    // Imprimir tarjeta 4 cuadrantes: sup.izq imagen volteada, sup.der dedicatoria volteada, inf.izq QR, inf.der imagen
    (function initPrintFoldableCard() {
      var btn = document.getElementById('btnPrintFoldableCard');
      var printTitle = document.getElementById('printFoldableTitle');
      var printDescription = document.getElementById('printFoldableDescription');
      var printImageTopLeft = document.getElementById('printFoldableImageTopLeft');
      var printImageBottomRight = document.getElementById('printFoldableImageBottomRight');
      var printQR = document.getElementById('printFoldableQR');
      var cellTopLeft = document.getElementById('printCellTopLeft');
      if (!btn || !printTitle || !printDescription || !printImageTopLeft || !printImageBottomRight || !printQR) return;
      btn.addEventListener('click', function() {
        printTitle.textContent = PAGE_DATA.title || '';
        printDescription.textContent = PAGE_DATA.description || '';
        var imgUrl = PAGE_DATA.imageUrl || '';
        if (imgUrl) {
          printImageTopLeft.src = imgUrl;
          printImageTopLeft.style.display = 'block';
          printImageBottomRight.src = imgUrl;
          printImageBottomRight.style.display = 'block';
          if (cellTopLeft) cellTopLeft.style.display = 'flex';
        } else {
          printImageTopLeft.style.display = 'none';
          printImageBottomRight.style.display = 'none';
          if (cellTopLeft) cellTopLeft.style.display = 'none';
        }
        var cardUrl = PAGE_DATA.baseUrl + '/page/' + PAGE_DATA.code;
        var siteUrl = PAGE_DATA.baseUrl || '';
        var printSiteUrl = document.getElementById('printFoldableSiteUrl');
        if (printSiteUrl) printSiteUrl.textContent = siteUrl;
        var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(cardUrl);
        printQR.style.display = 'block';
        printQR.alt = 'QR: ' + cardUrl;
        function doPrint() {
          var prevTitle = document.title;
          document.title = 'Tarjeta';
          window.print();
          document.title = prevTitle;
        }
        printQR.onload = doPrint;
        printQR.onerror = doPrint;
        printQR.src = qrUrl;
      });
    })();

    // Aplicar imagen como wallpaper si está configurada (inicial)
    function applyWallpaperIfNeeded() {
      if (PAGE_DATA.useImageAsWallpaper && PAGE_DATA.imageUrl) {
        document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.classList.add('has-wallpaper');
      }
    }
    
    // Aplicar al cargar la página
    applyWallpaperIfNeeded();

    const displayImage = document.getElementById('displayImage');
    const displayImageImg = document.getElementById('displayImageImg');

    // Hacer la imagen clickeable para abrir la URL de la tarjeta
    if (displayImageImg) {
      displayImageImg.addEventListener('click', () => {
        const cardUrl = `${PAGE_DATA.baseUrl}/page/${PAGE_DATA.code}`;
        window.open(cardUrl, '_blank');
      });
    }

    const personalizationForm = document.getElementById('personalizationForm');
    const playerView = document.getElementById('playerView');
    const personalizeForm = document.getElementById('personalizeForm');
    const recordButton = document.getElementById('recordButton');
    const audioPreview = document.getElementById('audioPreview');
    const previewAudio = document.getElementById('previewAudio');
    const deleteAudioBtn = document.getElementById('deleteAudio');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const audio = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const status = document.getElementById('status');
    const limitsInfo = document.getElementById('limitsInfo');
    const emojiButton = document.getElementById('emojiButton');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiGrid = document.getElementById('emojiGrid');
    const closeEmojiPicker = document.getElementById('closeEmojiPicker');
    const imageUpload = document.getElementById('imageUpload');
    const imageUploadButton = document.getElementById('imageUploadButton');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImage = document.getElementById('removeImage');
    const imageOptionsContainer = document.getElementById('imageOptionsContainer');
    const openCameraButton = document.getElementById('openCameraButton');
    const openNanoBananaButton = document.getElementById('openNanoBananaButton');
    const nanoBananaContainer = document.getElementById('nanoBananaContainer');
    const nanoBananaIdeasGrid = document.getElementById('nanoBananaIdeasGrid');
    const closeNanoBananaButton = document.getElementById('closeNanoBananaButton');
    const nanoBananaLoading = document.getElementById('nanoBananaLoading');
    const nanoBananaCustomPrompt = document.getElementById('nanoBananaCustomPrompt');
    const generateCustomPromptButton = document.getElementById('generateCustomPromptButton');
    const wallpaperOptionContainer = document.getElementById('wallpaperOptionContainer');
    const useImageAsWallpaperCheckbox = document.getElementById('useImageAsWallpaperCheckbox');
    let cameraStream = null;
    let videoElement = null;
    let canvasElement = null;
    const writtenMessage = document.getElementById('writtenMessage');
    const termsModal = document.getElementById('termsModal');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const isAdultCheckbox = document.getElementById('isAdultCheckbox');
    let termsAccepted = false;
    let isAdult = false;

    // Manejar checkbox de mayor de edad
    isAdultCheckbox.addEventListener('change', (e) => {
      isAdult = e.target.checked;
      if (isAdult) {
        acceptTermsBtn.disabled = false;
        acceptTermsBtn.style.opacity = '1';
        acceptTermsBtn.style.cursor = 'pointer';
      } else {
        acceptTermsBtn.disabled = true;
        acceptTermsBtn.style.opacity = '0.5';
        acceptTermsBtn.style.cursor = 'not-allowed';
      }
    });

    // Manejar aceptación de términos
    acceptTermsBtn.addEventListener('click', () => {
      if (!isAdult) {
        alert('Debes confirmar que eres mayor de edad para continuar');
        return;
      }
      termsAccepted = true;
      termsModal.style.display = 'none';
      submitBtn.disabled = false;
    });

    // Bloquear el botón de submit hasta aceptar términos
    submitBtn.disabled = true;

    let mediaRecorder = null;
    let audioChunks = [];
    let audioBlob = null;
    let recordingStream = null;
    let recordingStartTime = null;
    let recordingTimer = null;
    let selectedImageFile = null;

    // Manejar eliminación de demo al cerrar ventana
    if (PAGE_DATA.isDemo) {
      let demoDeleted = false;
      
      function deleteDemo() {
        if (demoDeleted) return;
        demoDeleted = true;
        
        // Usar sendBeacon para asegurar que la petición se envíe incluso si la página se cierra
        const url = `${PAGE_DATA.baseUrl}/api/pages/demo`;
        if (navigator.sendBeacon) {
          // sendBeacon no soporta DELETE directamente, usar fetch con keepalive
          fetch(url, {
            method: 'DELETE',
            keepalive: true,
          }).catch(() => {
            // Ignorar errores si la página ya se cerró
          });
        } else {
          // Fallback para navegadores que no soportan keepalive
          fetch(url, {
            method: 'DELETE',
          }).catch(() => {
            // Ignorar errores si la página ya se cerró
          });
        }
      }
      
      // Detectar cierre de ventana/pestaña
      window.addEventListener('beforeunload', deleteDemo);
      window.addEventListener('unload', deleteDemo);
      
      // Detectar cuando la pestaña se oculta (puede indicar cierre)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Esperar un poco para ver si vuelve a ser visible
          setTimeout(() => {
            if (document.visibilityState === 'hidden') {
              deleteDemo();
            }
          }, 2000);
        }
      });
      
      // También eliminar si se navega a otra página
      window.addEventListener('pagehide', deleteDemo);
    }

    // Emoticones populares para San Valentín
    const popularEmojis = [
      '❤️', '💕', '💖', '💗', '💓', '💞', '💝', '💘',
      '😍', '🥰', '😘', '😗', '😙', '😚', '😻', '💋',
      '🌹', '🌷', '🌺', '🌸', '💐', '🌻', '🌼', '🌿',
      '💑', '👫', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💏', '💑', '👨‍👩‍👧‍👦',
      '🎁', '🎀', '🎂', '🍰', '🍫', '🍬', '🍭', '🍩',
      '✨', '⭐', '🌟', '💫', '💎', '🎈', '🎉', '🎊',
      '😊', '😄', '😃', '😁', '😆', '😅', '🤣', '😂',
      '🥳', '🤗', '🤩', '😇', '😊', '🙂', '😉', '😌'
    ];

    // Cargar emoticones
    function loadEmojis() {
      emojiGrid.innerHTML = '';
      popularEmojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', () => {
          insertEmoji(emoji);
        });
        emojiGrid.appendChild(emojiItem);
      });
    }

    // Insertar emoticón en el textarea
    function insertEmoji(emoji) {
      const textarea = writtenMessage;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      textarea.value = newText;
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }

    // Toggle selector de emoticones
    emojiButton.addEventListener('click', () => {
      if (emojiPicker.style.display === 'none') {
        emojiPicker.style.display = 'block';
        loadEmojis();
      } else {
        emojiPicker.style.display = 'none';
      }
    });

    closeEmojiPicker.addEventListener('click', () => {
      emojiPicker.style.display = 'none';
    });

    // Manejar selección de imagen desde archivo
    if (imageUpload) {
      imageUpload.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handleImageFile(file);
        }
      });
    }

    // Manejar selección de imagen desde archivo
    if (imageUpload) {
      imageUpload.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handleImageFile(file);
        }
      });
    }

    // Función para manejar archivo de imagen
    function handleImageFile(file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showStatus('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }
      
      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        showStatus('La imagen no puede ser mayor a 10MB', 'error');
        return;
      }

      selectedImageFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        imagePreview.src = reader.result;
        imagePreviewContainer.style.display = 'block';
        if (imageOptionsContainer) imageOptionsContainer.style.display = 'none';
        if (wallpaperOptionContainer) wallpaperOptionContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    // Abrir cámara
    if (openCameraButton) {
      openCameraButton.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
          cameraStream = stream;
          
          // Crear modal de cámara
          const cameraModal = document.createElement('div');
          cameraModal.id = 'cameraModal';
          cameraModal.style.cssText = 'position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; padding: 20px;';
          
          cameraModal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 24px; max-width: 600px; width: 100%;">
              <div style="display: flex; justify-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 20px; font-weight: 700; color: #333;">Tomar Foto</h3>
                <button id="closeCameraBtn" style="background: #dc2626; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">✕</button>
              </div>
              <div style="background: black; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
                <video id="cameraVideo" autoplay playsinline style="width: 100%; max-height: 400px;"></video>
                <canvas id="cameraCanvas" style="display: none;"></canvas>
              </div>
              <div style="display: flex; gap: 12px;">
                <button id="cancelCameraBtn" style="flex: 1; padding: 12px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancelar</button>
                <button id="capturePhotoBtn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">📷 Capturar Foto</button>
              </div>
            </div>
          `;
          
          document.body.appendChild(cameraModal);
          
          const cameraVideo = document.getElementById('cameraVideo');
          const cameraCanvas = document.getElementById('cameraCanvas');
          const closeCameraBtn = document.getElementById('closeCameraBtn');
          const cancelCameraBtn = document.getElementById('cancelCameraBtn');
          const capturePhotoBtn = document.getElementById('capturePhotoBtn');
          
          cameraVideo.srcObject = stream;
          
          const closeCamera = () => {
            if (cameraStream) {
              cameraStream.getTracks().forEach(track => track.stop());
              cameraStream = null;
            }
            document.body.removeChild(cameraModal);
          };
          
          closeCameraBtn.addEventListener('click', closeCamera);
          cancelCameraBtn.addEventListener('click', closeCamera);
          
          capturePhotoBtn.addEventListener('click', () => {
            const context = cameraCanvas.getContext('2d');
            cameraCanvas.width = cameraVideo.videoWidth;
            cameraCanvas.height = cameraVideo.videoHeight;
            context.drawImage(cameraVideo, 0, 0);
            
            cameraCanvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleImageFile(file);
                closeCamera();
              }
            }, 'image/jpeg', 0.9);
          });
        } catch (error) {
          console.error('Error accessing camera:', error);
          let errorMessage = 'No se pudo acceder a la cámara.';
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró ninguna cámara.';
          }
          alert(errorMessage);
        }
      });
    }

    // Modal de carga de imagen IA (definir ANTES de generateNanoBananaImage)
    // Obtener el elemento de forma lazy para asegurar que el DOM esté listo
    function getNanoBananaLoadingModal() {
      return document.getElementById('nanoBananaLoadingModal');
    }
    
    function showNanoBananaLoadingModal() {
      const modal = getNanoBananaLoadingModal();
      if (modal) {
        modal.style.display = 'flex';
      }
    }
    
    function hideNanoBananaLoadingModal() {
      const modal = getNanoBananaLoadingModal();
      if (modal) {
        modal.style.display = 'none';
      }
    }

    // Función para generar imagen con Nano Banana (definida antes de usarse)
    let nanoBananaOccasion = 'valentine';

    function getNanoBananaOccasionPrefix(occasion) {
      if (occasion === 'valentine') return 'San Valentín';
      if (occasion === 'friendship') return 'Amistad';
      if (occasion === 'mothers-day') return 'Día Madre';
      if (occasion === 'fathers-day') return 'Día Padre';
      if (occasion === 'birthday') return 'Cumpleaños';
      return '';
    }

    // Placeholder y ejemplos por ocasión (menos corazones en amistad, contexto de cumpleaños, etc.)
    var OCCASION_PROMPT_EXAMPLES = {
      'valentine': {
        placeholder: 'un capibara con un globo de corazon en xochimilco',
        examples: [
          'un capibara con un globo de corazon en xochimilco',
          'Una trajinera con el nombre Sarita te amo y un mariachi',
          'Un gato tatuandose Valentina'
        ]
      },
      'friendship': {
        placeholder: 'amigos tomando café en un parque',
        examples: [
          'amigos tomando café en un parque',
          'dos amigos abrazándose en la playa',
          'regalo sorpresa para mi mejor amigo'
        ]
      },
      'mothers-day': {
        placeholder: 'mamá con flores y un abrazo',
        examples: [
          'mamá con flores y un abrazo',
          'desayuno en la cama para mamá',
          'carta y rosas para mamá'
        ]
      },
      'fathers-day': {
        placeholder: 'papá con una herramienta y una sonrisa',
        examples: [
          'papá con una herramienta y una sonrisa',
          'café con papá en la mañana',
          'papá y familia en el jardín'
        ]
      },
      'birthday': {
        placeholder: 'pastel de cumpleaños con velas y globos',
        examples: [
          'pastel de cumpleaños con velas y globos',
          'fiesta con globos y confeti',
          'regalo sorpresa con moño'
        ]
      }
    };

    function updateOccasionPromptExamples(occasion) {
      var data = OCCASION_PROMPT_EXAMPLES[occasion] || OCCASION_PROMPT_EXAMPLES['valentine'];
      var textarea = document.getElementById('nanoBananaCustomPrompt');
      var examplesEl = document.getElementById('nanoBananaExamplesText');
      if (textarea) textarea.placeholder = 'Ejemplo: "' + data.placeholder + '"';
      if (examplesEl) {
        examplesEl.innerHTML = '<strong>Ejemplos:</strong><br>' +
          data.examples.map(function (ex) { return '• "' + ex + '"'; }).join('<br>');
      }
    }

    async function generateNanoBananaImage(prompt) {
      // Verificar si ya se usó para ESTA tarjeta específica (usando el código único)
      const cardCode = PAGE_DATA.code;
      const storageKey = `nanoBananaUsed_${cardCode}`;
      const nanoBananaUsed = localStorage.getItem(storageKey);
      if (nanoBananaUsed === 'true') {
        hideNanoBananaLoadingModal(); // Asegurar que el modal se oculte
        alert('⚠️ La generación de imágenes con IA solo se puede usar 1 vez por tarjeta. Ya has usado esta función para esta tarjeta.');
        return;
      }

      // Mostrar indicadores de carga
      if (nanoBananaLoading) nanoBananaLoading.style.display = 'block';
      if (nanoBananaIdeasGrid) nanoBananaIdeasGrid.style.display = 'none';
      if (nanoBananaCustomPrompt) nanoBananaCustomPrompt.disabled = true;
      if (generateCustomPromptButton) generateCustomPromptButton.disabled = true;
      
      // Mostrar modal de carga (si no se mostró ya)
      showNanoBananaLoadingModal();

      try {
        // Prefijo por ocasión (solo si el prompt no lo incluye ya)
        let finalPrompt = prompt.trim();
        const prefix = getNanoBananaOccasionPrefix(nanoBananaOccasion);
        if (prefix) {
          const p = finalPrompt.toLowerCase();
          const pref = prefix.toLowerCase();
          if (!p.startsWith(pref)) {
            finalPrompt = `${prefix} ${finalPrompt}`;
          }
        }

        const generateResponse = await fetch(`${PAGE_DATA.baseUrl}/api/nano-banana/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: finalPrompt }),
        });

        if (!generateResponse.ok) throw new Error('Error al generar imagen');

        const generateData = await generateResponse.json();
        const imageUrl = generateData.data?.imageUrl;

        if (imageUrl) {
          // Marcar como usado en localStorage para ESTA tarjeta específica
          const cardCode = PAGE_DATA.code;
          const storageKey = `nanoBananaUsed_${cardCode}`;
          localStorage.setItem(storageKey, 'true');

          // Crear un File desde la URL
          const imgResponse = await fetch(imageUrl);
          const blob = await imgResponse.blob();
          const file = new File([blob], 'nano-banana-image.jpg', { type: 'image/jpeg' });

          handleImageFile(file);
          if (nanoBananaContainer) nanoBananaContainer.style.display = 'none';
          
          // Ocultar modal de carga
          hideNanoBananaLoadingModal();
        } else {
          throw new Error('No se recibió URL de imagen');
        }
      } catch (error) {
        console.error('Error generating image:', error);
        
        // Ocultar modal de carga
        hideNanoBananaLoadingModal();
        
        alert('Error al generar imagen. Intenta de nuevo.');
        if (nanoBananaLoading) nanoBananaLoading.style.display = 'none';
        if (nanoBananaIdeasGrid) nanoBananaIdeasGrid.style.display = 'grid';
        if (nanoBananaCustomPrompt) nanoBananaCustomPrompt.disabled = false;
        if (generateCustomPromptButton) generateCustomPromptButton.disabled = false;
      }
    }

    // Generar con Nano Banana (IA)
    if (openNanoBananaButton) {
      openNanoBananaButton.addEventListener('click', async () => {
        // Verificar si ya se usó Nano Banana para ESTA tarjeta específica (usando el código único)
        const cardCode = PAGE_DATA.code;
        const storageKey = `nanoBananaUsed_${cardCode}`;
        const nanoBananaUsed = localStorage.getItem(storageKey);
        if (nanoBananaUsed === 'true') {
          alert('⚠️ La generación de imágenes con IA solo se puede usar 1 vez por tarjeta. Ya has usado esta función para esta tarjeta.');
          return;
        }
        
        // Mostrar alert de advertencia
        const confirmed = confirm('⚠️ IMPORTANTE: La generación de imágenes con IA solo se puede usar 1 vez.\n\n¿Deseas continuar?');
        if (!confirmed) {
          return;
        }
        
        if (nanoBananaContainer) {
          nanoBananaContainer.style.display = 'block';

          const occasionSelect = document.getElementById('nanoBananaOccasionSelect');
          if (occasionSelect) {
            nanoBananaOccasion = occasionSelect.value || 'valentine';
            updateOccasionPromptExamples(nanoBananaOccasion);
            occasionSelect.onchange = async () => {
              nanoBananaOccasion = occasionSelect.value || 'valentine';
              updateOccasionPromptExamples(nanoBananaOccasion);
              // recargar ideas
              if (nanoBananaIdeasGrid) {
                nanoBananaIdeasGrid.innerHTML = '<p style="text-align: center; color: #c44569;">Cargando ideas...</p>';
              }
              try {
                const response = await fetch(`${PAGE_DATA.baseUrl}/api/nano-banana/ideas?occasion=${encodeURIComponent(nanoBananaOccasion)}`);
                if (!response.ok) throw new Error('Error al cargar ideas');
                const data = await response.json();
                const ideas = data.data || [];
                if (nanoBananaIdeasGrid) nanoBananaIdeasGrid.innerHTML = '';
                ideas.forEach((idea) => {
                  const ideaCard = document.createElement('div');
                  ideaCard.style.cssText = 'padding: 12px; background: white; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; text-align: center;';
                  var catEmoji = (idea.category === '14 de febrero' || idea.category === 'Amor y amistad') ? '💝' : idea.category === 'Amistad' ? '🤝' : idea.category === 'Día de la madre' ? '💐' : idea.category === 'Día del padre' ? '👔' : idea.category === 'Cumpleaños' ? '🎂' : '✨';
                  ideaCard.innerHTML = `
                    <div style="font-size: 20px; margin-bottom: 6px;">${catEmoji}</div>
                    <div style="font-size: 13px; font-weight: 600; color: #c44569; margin-bottom: 4px;">${idea.title}</div>
                    <div style="font-size: 10px; color: #888;">${idea.category || ''}</div>
                  `;
                  ideaCard.addEventListener('mouseenter', () => {
                    ideaCard.style.borderColor = '#ff6b9d';
                    ideaCard.style.transform = 'scale(1.05)';
                    ideaCard.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.3)';
                  });
                  ideaCard.addEventListener('mouseleave', () => {
                    ideaCard.style.borderColor = 'transparent';
                    ideaCard.style.transform = 'scale(1)';
                    ideaCard.style.boxShadow = 'none';
                  });
                  ideaCard.addEventListener('click', async () => {
                    await generateNanoBananaImage(idea.prompt);
                  });
                  nanoBananaIdeasGrid.appendChild(ideaCard);
                });
              } catch (error) {
                console.error('Error loading ideas:', error);
                if (nanoBananaIdeasGrid) {
                  nanoBananaIdeasGrid.innerHTML = '<p style="text-align: center; color: #dc2626;">Error al cargar ideas. Intenta de nuevo.</p>';
                }
              }
            };
          }
          
          // Cargar las 14 ideas predefinidas
          if (nanoBananaIdeasGrid) {
            nanoBananaIdeasGrid.innerHTML = '<p style="text-align: center; color: #c44569;">Cargando ideas...</p>';
            
            try {
              const response = await fetch(`${PAGE_DATA.baseUrl}/api/nano-banana/ideas?occasion=${encodeURIComponent(nanoBananaOccasion)}`);
              if (!response.ok) throw new Error('Error al cargar ideas');
              
              const data = await response.json();
              const ideas = data.data || [];
              
              nanoBananaIdeasGrid.innerHTML = '';
              ideas.forEach((idea) => {
                const ideaCard = document.createElement('div');
                ideaCard.style.cssText = 'padding: 12px; background: white; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; text-align: center;';
                var catEmoji = (idea.category === '14 de febrero' || idea.category === 'Amor y amistad') ? '💝' : idea.category === 'Amistad' ? '🤝' : idea.category === 'Día de la madre' ? '💐' : idea.category === 'Día del padre' ? '👔' : idea.category === 'Cumpleaños' ? '🎂' : '✨';
                ideaCard.innerHTML = `
                  <div style="font-size: 20px; margin-bottom: 6px;">${catEmoji}</div>
                  <div style="font-size: 13px; font-weight: 600; color: #c44569; margin-bottom: 4px;">${idea.title}</div>
                  <div style="font-size: 10px; color: #888;">${idea.category}</div>
                `;
                
                ideaCard.addEventListener('mouseenter', () => {
                  ideaCard.style.borderColor = '#ff6b9d';
                  ideaCard.style.transform = 'scale(1.05)';
                  ideaCard.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.3)';
                });
                ideaCard.addEventListener('mouseleave', () => {
                  ideaCard.style.borderColor = 'transparent';
                  ideaCard.style.transform = 'scale(1)';
                  ideaCard.style.boxShadow = 'none';
                });
                
                ideaCard.addEventListener('click', async () => {
                  // Usar la función compartida para generar
                  const ideaPrompt = idea.prompt;
                  await generateNanoBananaImage(ideaPrompt);
                });
                
                nanoBananaIdeasGrid.appendChild(ideaCard);
              });
            } catch (error) {
              console.error('Error loading ideas:', error);
              if (nanoBananaIdeasGrid) {
                nanoBananaIdeasGrid.innerHTML = '<p style="text-align: center; color: #dc2626;">Error al cargar ideas. Intenta de nuevo.</p>';
              }
            }
          }
        }
      });
    }

    if (closeNanoBananaButton) {
      closeNanoBananaButton.addEventListener('click', () => {
        if (nanoBananaContainer) {
          nanoBananaContainer.style.display = 'none';
        }
      });
    }

    // Generar con prompt personalizado
    if (generateCustomPromptButton && nanoBananaCustomPrompt) {
      generateCustomPromptButton.addEventListener('click', async () => {
        const customPrompt = nanoBananaCustomPrompt.value.trim();
        if (!customPrompt) {
          alert('Por favor ingresa una descripción para generar la imagen.');
          return;
        }
        
        // Mostrar modal de carga
        showNanoBananaLoadingModal();
        
        try {
          await generateNanoBananaImage(customPrompt);
        } finally {
          // Ocultar modal de carga (se oculta también en generateNanoBananaImage, pero por si acaso)
          hideNanoBananaLoadingModal();
        }
      });

      // También permitir generar con Enter
      nanoBananaCustomPrompt.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          const customPrompt = nanoBananaCustomPrompt.value.trim();
          if (customPrompt) {
            // Mostrar modal de carga
            showNanoBananaLoadingModal();
            
            try {
              await generateNanoBananaImage(customPrompt);
            } finally {
              // Ocultar modal de carga
              hideNanoBananaLoadingModal();
            }
          }
        }
      });
    }

    // Manejar URL de video y preview
    const videoUrlInput = document.getElementById('videoUrl');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');
    const videoPreview = document.getElementById('videoPreview');
    const removeVideoBtn = document.getElementById('removeVideo');
    let currentVideoUrl = '';

    // Función para obtener oEmbed URL según el proveedor
    function getOEmbedUrl(url) {
      if (url.includes('facebook.com') || url.includes('fb.com')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=500`;
      } else if (url.includes('instagram.com')) {
        // Instagram usa oEmbed API
        return `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`;
      } else if (url.includes('tiktok.com')) {
        // TikTok usa oEmbed
        return `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      }
      return null;
    }

    // Función para detectar la plataforma del video
    function detectVideoPlatform(url) {
      if (!url) return null;
      
      const normalizedUrl = url.toLowerCase().trim();
      
      // Facebook (incluye variaciones: facebook.com, fb.com, m.facebook.com, www.facebook.com)
      if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com')) {
        return 'facebook';
      }
      
      // Instagram (incluye variaciones: instagram.com, www.instagram.com)
      if (normalizedUrl.includes('instagram.com')) {
        return 'instagram';
      }
      
      // TikTok (incluye variaciones: tiktok.com, www.tiktok.com, vm.tiktok.com)
      if (normalizedUrl.includes('tiktok.com')) {
        return 'tiktok';
      }
      
      // Twitter/X (incluye variaciones: twitter.com, x.com, www.twitter.com, www.x.com)
      if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
        return 'twitter';
      }
      
      return null;
    }

    // Función helper para cargar video en un contenedor
    async function loadVideoInContainer(videoUrl, containerElement, displayElement) {
      if (!videoUrl || !containerElement) return false;
      
      const platform = detectVideoPlatform(videoUrl);
      
      if (!platform) {
        console.warn('Plataforma de video no soportada:', videoUrl);
        return false;
      }

      try {
        if (platform === 'facebook') {
          const iframeUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=500&height=281`;
          containerElement.innerHTML = `<iframe src="${iframeUrl}" width="500" height="281" style="border:none;overflow:hidden;width:100%;max-width:500px;height:281px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
          if (displayElement) displayElement.style.display = 'block';
          return true;
        } else if (platform === 'instagram') {
          const response = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(videoUrl)}`);
          if (!response.ok) throw new Error('Instagram oEmbed failed');
          const data = await response.json();
          if (data.html) {
            containerElement.innerHTML = data.html;
            if (displayElement) displayElement.style.display = 'block';
            return true;
          }
        } else if (platform === 'tiktok') {
          const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
          if (!response.ok) throw new Error('TikTok oEmbed failed');
          const data = await response.json();
          if (data.html) {
            containerElement.innerHTML = data.html;
            if (displayElement) displayElement.style.display = 'block';
            return true;
          }
        } else if (platform === 'twitter') {
          const response = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(videoUrl)}`);
          if (!response.ok) throw new Error('Twitter oEmbed failed');
          const data = await response.json();
          if (data.html) {
            containerElement.innerHTML = data.html;
            if (displayElement) displayElement.style.display = 'block';
            return true;
          }
        }
      } catch (error) {
        console.error('Error loading video:', error);
        return false;
      }
      
      return false;
    }

    // Función para cargar preview del video
    async function loadVideoPreview(url) {
      if (!url || !url.trim()) {
        if (videoPreviewContainer) videoPreviewContainer.style.display = 'none';
        return;
      }

      currentVideoUrl = url.trim();
      
      if (videoPreviewContainer) {
        videoPreviewContainer.style.display = 'block';
      }

      if (videoPreview) {
        videoPreview.innerHTML = '<p style="color: white;">Cargando preview...</p>';
      }

      try {
        const platform = detectVideoPlatform(currentVideoUrl);
        
        if (!platform) {
          if (videoPreview) {
            videoPreview.innerHTML = '<p style="color: white;">URL no soportada. Solo se aceptan videos de Facebook, Instagram, TikTok o Twitter/X.</p>';
          }
          return;
        }

        // Para Facebook, usar iframe directamente
        if (platform === 'facebook') {
          const iframeUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(currentVideoUrl)}&show_text=false&width=500&height=281`;
          if (videoPreview) {
            videoPreview.innerHTML = `<iframe src="${iframeUrl}" width="500" height="281" style="border:none;overflow:hidden;width:100%;max-width:500px;height:281px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
          }
        } 
        // Para Instagram, usar oEmbed
        else if (platform === 'instagram') {
          const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(currentVideoUrl)}`;
          const response = await fetch(oembedUrl);
          if (!response.ok) {
            throw new Error('Instagram oEmbed failed');
          }
          const data = await response.json();
          if (videoPreview) {
            videoPreview.innerHTML = data.html || `<p style="color: white;">Preview no disponible</p>`;
          }
        }
        // Para TikTok, usar oEmbed
        else if (platform === 'tiktok') {
          const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(currentVideoUrl)}`;
          const response = await fetch(oembedUrl);
          if (!response.ok) {
            throw new Error('TikTok oEmbed failed');
          }
          const data = await response.json();
          if (videoPreview) {
            videoPreview.innerHTML = data.html || `<p style="color: white;">Preview no disponible</p>`;
          }
        }
        // Para Twitter/X, usar oEmbed
        else if (platform === 'twitter') {
          const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(currentVideoUrl)}`;
          const response = await fetch(oembedUrl);
          if (!response.ok) {
            throw new Error('Twitter oEmbed failed');
          }
          const data = await response.json();
          if (videoPreview) {
            videoPreview.innerHTML = data.html || `<p style="color: white;">Preview no disponible</p>`;
          }
        }
      } catch (error) {
        console.error('Error loading video preview:', error);
        if (videoPreview) {
          videoPreview.innerHTML = '<p style="color: white;">Error al cargar preview. Verifica que la URL sea válida y que el video sea público.</p>';
        }
      }
    }

    // Event listener para el input de video
    if (videoUrlInput) {
      let videoUrlTimeout;
      videoUrlInput.addEventListener('input', (e) => {
        clearTimeout(videoUrlTimeout);
        const url = e.target.value.trim();
        
        if (!url) {
          if (videoPreviewContainer) videoPreviewContainer.style.display = 'none';
          currentVideoUrl = '';
          return;
        }

        // Validar que sea una URL válida
        try {
          new URL(url);
          // Esperar 1 segundo después de que el usuario deje de escribir
          videoUrlTimeout = setTimeout(() => {
            loadVideoPreview(url);
          }, 1000);
        } catch (error) {
          if (videoPreview) {
            videoPreview.innerHTML = '<p style="color: white;">URL inválida</p>';
          }
        }
      });
    }

    // Botón para eliminar video
    if (removeVideoBtn) {
      removeVideoBtn.addEventListener('click', () => {
        if (videoUrlInput) videoUrlInput.value = '';
        if (videoPreviewContainer) videoPreviewContainer.style.display = 'none';
        currentVideoUrl = '';
      });
    }


    // Eliminar imagen seleccionada
    if (removeImage) {
      removeImage.addEventListener('click', () => {
        selectedImageFile = null;
        imagePreviewContainer.style.display = 'none';
        if (imageOptionsContainer) imageOptionsContainer.style.display = 'grid';
        if (wallpaperOptionContainer) wallpaperOptionContainer.style.display = 'none';
        if (useImageAsWallpaperCheckbox) useImageAsWallpaperCheckbox.checked = false;
        if (imageUpload) imageUpload.value = '';
        if (imagePreview) imagePreview.src = '';
      });
    }

    const headerTitle = document.getElementById('headerTitle');

    // Función para actualizar el título del header con cuenta regresiva (no mostrar contador si está preservada)
    function updateHeaderTitle() {
      if (PAGE_DATA.isPreserved) {
        headerTitle.classList.remove('warning', 'danger');
        headerTitle.textContent = PAGE_DATA.title ? PAGE_DATA.title : '💌 Tarjeta especial';
        return;
      }
      if (PAGE_DATA.isPersonalized) {
        const remaining = PAGE_DATA.maxPlays - PAGE_DATA.playCount;
        const expirationDate = new Date('2026-02-14T00:00:00');
        const expirationDateStr = expirationDate.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }) + ' 12:00 AM';
        
        // Remover clases de animación anteriores
        headerTitle.classList.remove('warning', 'danger');
        
        if (isExpired()) {
          headerTitle.textContent = '⏰ Tu tarjeta ha expirado';
          headerTitle.classList.add('danger');
        } else if (remaining <= 0) {
          headerTitle.textContent = '🔒 Tu tarjeta se ha autodestruido';
          headerTitle.classList.add('danger');
        } else if (remaining === 1) {
          headerTitle.textContent = `⚠️ Puedes ver la tarjeta 1 vez más antes del ${expirationDateStr}`;
          headerTitle.classList.add('danger');
        } else {
          headerTitle.textContent = `✨ Puedes ver la tarjeta ${remaining} veces más antes del ${expirationDateStr}`;
          if (remaining <= 2) {
            headerTitle.classList.add('warning');
          }
        }
      } else {
        headerTitle.textContent = 'Crea tu Tarjeta';
      }
    }

    // Inicializar vista según estado
    // Si la página ya está personalizada, ocultar modal de términos y cargar contenido
    if (PAGE_DATA.isPersonalized) {
      // Ocultar modal de términos si la página ya está personalizada
      if (termsModal) {
        termsModal.style.display = 'none';
      }
      termsAccepted = true;
      isAdult = true;
      // Cargar imagen si existe - SIEMPRE se muestra dentro de la carta, incluso si es wallpaper
      if (PAGE_DATA.imageUrl && displayImage && displayImageImg) {
        console.log('Loading image in personalized card (initial):', {
          imageUrl: PAGE_DATA.imageUrl,
          isWallpaper: PAGE_DATA.useImageAsWallpaper
        });
        
        // Si es wallpaper, aplicar como fondo Y también mostrar dentro de la carta
        if (PAGE_DATA.useImageAsWallpaper) {
          // Aplicar como fondo
          document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          document.body.classList.add('has-wallpaper');
          
          // TAMBIÉN mostrar dentro de la carta
          console.log('Setting image src (wallpaper + card):', PAGE_DATA.imageUrl);
          displayImageImg.src = PAGE_DATA.imageUrl;
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        } else {
          // Mostrar la imagen solo dentro de la carta
          console.log('Setting image src:', PAGE_DATA.imageUrl);
          displayImageImg.src = PAGE_DATA.imageUrl;
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        }
        
        displayImageImg.onload = () => {
          console.log('Image loaded in personalized card (initial)');
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        };
        displayImageImg.onerror = () => {
          console.error('Error loading image in personalized card (initial):', PAGE_DATA.imageUrl);
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        };
      } else {
        console.log('Cannot load image - missing elements:', {
          hasImageUrl: !!PAGE_DATA.imageUrl,
          hasDisplayImage: !!displayImage,
          hasDisplayImageImg: !!displayImageImg
        });
      }

      // Cargar video si existe
      const displayVideo = document.getElementById('displayVideo');
      const displayVideoContainer = document.getElementById('displayVideoContainer');
      if (PAGE_DATA.videoUrl && displayVideo && displayVideoContainer) {
        loadVideoInContainer(PAGE_DATA.videoUrl, displayVideoContainer, displayVideo);
      }
    }

    if (!PAGE_DATA.isPersonalized) {
      personalizationForm.classList.add('active');
      // Mostrar modal de términos si la página no está personalizada
      if (termsModal) {
        termsModal.style.display = 'flex';
      }
    } else {
      // Si ya está personalizada, ocultar el modal inmediatamente
      if (termsModal) {
        termsModal.style.display = 'none';
      }
      termsAccepted = true;
      isAdult = true;
      
      // Cargar imagen - SIEMPRE se muestra dentro de la carta, incluso si es wallpaper
      if (PAGE_DATA.imageUrl && displayImage && displayImageImg) {
        // Si es wallpaper, aplicar como fondo Y también mostrar dentro de la carta
        if (PAGE_DATA.useImageAsWallpaper) {
          // Aplicar como fondo
          document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          document.body.classList.add('has-wallpaper');
          
          // TAMBIÉN mostrar dentro de la carta
          console.log('Loading image in personalized view (wallpaper + card):', PAGE_DATA.imageUrl);
          displayImageImg.src = PAGE_DATA.imageUrl;
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        } else {
          // Mostrar la imagen solo dentro de la carta
          console.log('Loading image in personalized view:', PAGE_DATA.imageUrl);
          displayImageImg.src = PAGE_DATA.imageUrl;
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        }
        
        displayImageImg.onload = () => {
          console.log('Image loaded in personalized view');
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        };
        displayImageImg.onerror = () => {
          console.error('Error loading image in personalized view:', PAGE_DATA.imageUrl);
          displayImage.style.display = 'block';
          displayImage.style.visibility = 'visible';
          displayImage.style.opacity = '1';
        };
      }

      // Mostrar video si existe
      const displayVideo = document.getElementById('displayVideo');
      const displayVideoContainer = document.getElementById('displayVideoContainer');
      if (PAGE_DATA.videoUrl && displayVideo && displayVideoContainer) {
        loadVideoInContainer(PAGE_DATA.videoUrl, displayVideoContainer, displayVideo);
      }

      // Mostrar animación del sobre primero (en lugar de mostrar directamente el contenido)
      const envelopeAnimationContainer = document.getElementById('envelopeAnimationContainer');
      const envelopeAnimation = document.getElementById('envelopeAnimation');
      const cardMessageAnimation = document.getElementById('cardMessageAnimation');
      const cardImageContainerAnimation = document.getElementById('cardImageContainerAnimation');
      const cardImageAnimation = document.getElementById('cardImageAnimation');
      const instructionTextAnimation = document.querySelector('.instruction-text-animation');

      if (envelopeAnimationContainer && envelopeAnimation) {
        // Actualizar título de la tarjeta con el texto personalizado
        const cardTitleAnimation = document.getElementById('cardTitleAnimation');
        if (cardTitleAnimation) {
          // Si hay mensaje escrito, usarlo como título (limitado a 40 caracteres)
          // Si no, usar el título personalizado o descripción
          let titleText = '';
          if (PAGE_DATA.writtenMessage) {
            titleText = PAGE_DATA.writtenMessage.length > 40 
              ? PAGE_DATA.writtenMessage.substring(0, 40) + '...' 
              : PAGE_DATA.writtenMessage;
          } else if (PAGE_DATA.title) {
            titleText = PAGE_DATA.title;
          } else if (PAGE_DATA.description) {
            titleText = PAGE_DATA.description.length > 40 
              ? PAGE_DATA.description.substring(0, 40) + '...' 
              : PAGE_DATA.description;
          } else {
            titleText = '💌 Tarjeta Especial';
          }
          cardTitleAnimation.textContent = titleText;
        }

        // Cargar datos en la tarjeta del sobre
        if (cardMessageAnimation) {
          let messageContent = '';
          if (PAGE_DATA.senderName && PAGE_DATA.recipientName) {
            // Si hay nombres, mostrar estructura con Para/De
            messageContent = `
              <div style="margin-bottom: 8px; font-weight: 600; font-size: 1rem;">Para: ${PAGE_DATA.recipientName}</div>
              <div style="margin-bottom: 8px; font-size: 0.9rem;">De: ${PAGE_DATA.senderName}</div>
              ${PAGE_DATA.writtenMessage ? `<div style="margin-top: 12px; font-size: 0.85rem; line-height: 1.4;">${PAGE_DATA.writtenMessage}</div>` : ''}
            `;
          } else if (PAGE_DATA.writtenMessage) {
            // Si solo hay mensaje escrito, mostrarlo directamente
            messageContent = PAGE_DATA.writtenMessage;
          } else if (PAGE_DATA.description) {
            // Si hay descripción, usarla
            messageContent = PAGE_DATA.description;
          } else if (PAGE_DATA.title) {
            // Si solo hay título, usarlo
            messageContent = PAGE_DATA.title;
          }
          // Solo actualizar si hay contenido
          if (messageContent) {
            cardMessageAnimation.innerHTML = messageContent;
          }
        }

        // Cargar imagen si existe (mostrar siempre en la tarjeta del sobre)
        if (PAGE_DATA.imageUrl && cardImageContainerAnimation && cardImageAnimation) {
          console.log('Loading image in envelope:', PAGE_DATA.imageUrl);
          cardImageAnimation.src = PAGE_DATA.imageUrl;
          // Mostrar inmediatamente con !important
          cardImageContainerAnimation.style.display = 'block';
          cardImageContainerAnimation.style.visibility = 'visible';
          cardImageAnimation.style.display = 'block';
          cardImageAnimation.style.visibility = 'visible';
          cardImageAnimation.style.opacity = '1';
          
          // Verificar carga
          cardImageAnimation.onload = () => {
            console.log('Image loaded successfully in envelope');
            cardImageContainerAnimation.style.display = 'block';
            cardImageContainerAnimation.style.visibility = 'visible';
          };
          cardImageAnimation.onerror = () => {
            console.error('Error loading image in envelope card:', PAGE_DATA.imageUrl);
            // Mantener visible incluso si hay error
            cardImageContainerAnimation.style.display = 'block';
            cardImageContainerAnimation.style.visibility = 'visible';
          };
        }

        // Mostrar animación del sobre
        envelopeAnimationContainer.classList.add('active');

        // Manejar clic en el sobre
        let envelopeOpened = false;
        envelopeAnimation.addEventListener('click', async function() {
          if (!envelopeOpened) {
            envelopeOpened = true;
            this.classList.add('open');
            
            // Efecto de confeti al abrir el sobre
            startConfetti();
            
            // Incrementar contador de visualizaciones (clicks en el sobre)
            try {
              const response = await fetch(`${PAGE_DATA.baseUrl}/api/pages/${PAGE_DATA.code}/play`, {
                method: 'POST',
              });
              const data = await response.json();
              if (data.success) {
                PAGE_DATA.playCount = data.data.playCount;
                
                // Si la tarjeta fue destruida, mostrar mensaje
                if (data.data.destroyed) {
                  updateLimitsInfo();
                  updateHeaderTitle();
                  // Mostrar mensaje después de abrir el sobre
                  setTimeout(() => {
                    alert('🔒 La tarjeta se ha autodestruido');
                  }, 1500);
                  return;
                }
                
                updateLimitsInfo();
                updateHeaderTitle();
              }
            } catch (error) {
              console.error('Error incrementing view count:', error);
            }
            
            // Ocultar texto de instrucción
            if (instructionTextAnimation) {
              instructionTextAnimation.style.opacity = '0';
              instructionTextAnimation.style.transition = 'opacity 0.3s';
            }

            // Después de la animación, ocultar el sobre y mostrar el contenido
            setTimeout(() => {
              if (envelopeAnimationContainer) {
                envelopeAnimationContainer.classList.remove('active');
                envelopeAnimationContainer.style.display = 'none';
              }
              
              // Mostrar el contenido normal de la tarjeta
              if (playerView) {
                playerView.classList.add('active');
              }

              // Cargar imagen si existe - SIEMPRE se muestra dentro de la carta, incluso si es wallpaper
              console.log('Loading image after envelope open:', {
                hasImageUrl: !!PAGE_DATA.imageUrl,
                imageUrl: PAGE_DATA.imageUrl,
                isWallpaper: PAGE_DATA.useImageAsWallpaper,
                hasDisplayImage: !!displayImage,
                hasDisplayImageImg: !!displayImageImg
              });
              
              if (PAGE_DATA.imageUrl && displayImage && displayImageImg) {
                // Si es wallpaper, aplicar como fondo Y también mostrar dentro de la carta
                if (PAGE_DATA.useImageAsWallpaper) {
                  console.log('Setting image as wallpaper AND in card');
                  // Aplicar como fondo
                  document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
                  document.body.style.backgroundSize = 'cover';
                  document.body.style.backgroundPosition = 'center';
                  document.body.style.backgroundAttachment = 'fixed';
                  document.body.classList.add('has-wallpaper');
                  
                  // TAMBIÉN mostrar dentro de la carta
                  displayImageImg.src = PAGE_DATA.imageUrl;
                  displayImage.style.display = 'block';
                  displayImage.style.visibility = 'visible';
                  displayImage.style.opacity = '1';
                } else {
                  // Mostrar la imagen solo dentro de la carta
                  console.log('Displaying image in card:', PAGE_DATA.imageUrl);
                  displayImageImg.src = PAGE_DATA.imageUrl;
                  displayImage.style.display = 'block';
                  displayImage.style.visibility = 'visible';
                  displayImage.style.opacity = '1';
                }
                
                // Asegurar que se muestre después de cargar
                displayImageImg.onload = () => {
                  console.log('Image loaded successfully');
                  displayImage.style.display = 'block';
                  displayImage.style.visibility = 'visible';
                  displayImage.style.opacity = '1';
                };
                displayImageImg.onerror = () => {
                  console.error('Error loading image:', PAGE_DATA.imageUrl);
                  // Mantener visible incluso si hay error
                  displayImage.style.display = 'block';
                  displayImage.style.visibility = 'visible';
                  displayImage.style.opacity = '1';
                };
                
                // Forzar visibilidad después de un momento
                setTimeout(() => {
                  if (PAGE_DATA.imageUrl && displayImage) {
                    console.log('Forcing image visibility');
                    displayImage.style.display = 'block';
                    displayImage.style.visibility = 'visible';
                    displayImage.style.opacity = '1';
                    if (displayImageImg) {
                      displayImageImg.style.display = 'block';
                      displayImageImg.style.visibility = 'visible';
                      displayImageImg.style.opacity = '1';
                    }
                  }
                }, 200);
              } else {
                console.log('Cannot display image - missing requirements');
              }

              // Mostrar video si existe
              const displayVideo = document.getElementById('displayVideo');
              const displayVideoContainer = document.getElementById('displayVideoContainer');
              if (PAGE_DATA.videoUrl && displayVideo && displayVideoContainer) {
                loadVideoInContainer(PAGE_DATA.videoUrl, displayVideoContainer, displayVideo);
              }

              updateLimitsInfo();
              updateHeaderTitle();
            }, 1500); // Esperar a que termine la animación del sobre
          }
        });

        // Hacer el sobre focusable para accesibilidad
        envelopeAnimation.setAttribute('tabindex', '0');
        envelopeAnimation.setAttribute('role', 'button');
        envelopeAnimation.setAttribute('aria-label', 'Haz clic para abrir el sobre');

        // También permitir abrir con tecla Enter o Espacio
        envelopeAnimation.addEventListener('keydown', function(e) {
          if ((e.key === 'Enter' || e.key === ' ') && !envelopeOpened) {
            e.preventDefault();
            this.click();
          }
        });
      } else {
        // Si no hay animación, mostrar contenido directamente
        if (playerView) {
          playerView.classList.add('active');
        }
        
        // Cargar imagen si existe (cuando no hay animación)
        if (PAGE_DATA.imageUrl && displayImage && displayImageImg) {
          console.log('Loading image without animation:', {
            hasImageUrl: !!PAGE_DATA.imageUrl,
            imageUrl: PAGE_DATA.imageUrl,
            isWallpaper: PAGE_DATA.useImageAsWallpaper
          });
          
          // Si es wallpaper, aplicar como fondo Y también mostrar dentro de la carta
          if (PAGE_DATA.useImageAsWallpaper) {
            // Aplicar como fondo
            document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.classList.add('has-wallpaper');
            
            // TAMBIÉN mostrar dentro de la carta
            console.log('Displaying image in content (no animation, wallpaper + card):', PAGE_DATA.imageUrl);
            displayImageImg.src = PAGE_DATA.imageUrl;
            displayImage.style.display = 'block';
            displayImage.style.visibility = 'visible';
            displayImage.style.opacity = '1';
          } else {
            // Mostrar la imagen solo dentro de la carta
            console.log('Displaying image in content (no animation):', PAGE_DATA.imageUrl);
            displayImageImg.src = PAGE_DATA.imageUrl;
            displayImage.style.display = 'block';
            displayImage.style.visibility = 'visible';
            displayImage.style.opacity = '1';
          }
          
          displayImageImg.onload = () => {
            console.log('Image loaded successfully (no animation)');
            displayImage.style.display = 'block';
            displayImage.style.visibility = 'visible';
            displayImage.style.opacity = '1';
          };
          displayImageImg.onerror = () => {
            console.error('Error loading image (no animation):', PAGE_DATA.imageUrl);
            displayImage.style.display = 'block';
            displayImage.style.visibility = 'visible';
            displayImage.style.opacity = '1';
          };
        }
        
        updateLimitsInfo();
        updateHeaderTitle();
      }
    }

    // Función para actualizar el tiempo de grabación
    function updateRecordingTime() {
      if (recordingStartTime && mediaRecorder && mediaRecorder.state === 'recording') {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        recordButton.textContent = `⏹ Detener (${minutes}:${seconds.toString().padStart(2, '0')})`;
      }
    }

    // Grabación de audio
    recordButton.addEventListener('click', async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Detener grabación
        mediaRecorder.stop();
        recordButton.textContent = '🎤 Grabar Mensaje';
        recordButton.classList.remove('recording');
        if (recordingTimer) {
          clearInterval(recordingTimer);
          recordingTimer = null;
        }
        recordingStartTime = null;
      } else {
        // Iniciar grabación
        try {
          // Verificar si hay un audio previo
          if (audioBlob) {
            if (!confirm('Ya tienes un audio grabado. ¿Deseas reemplazarlo?')) {
              return;
            }
            // Limpiar audio previo
            audioBlob = null;
            audioChunks = [];
            previewAudio.src = '';
            audioPreview.classList.remove('active');
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          
          recordingStream = stream;
          
          // Detectar el mejor tipo MIME disponible
          let mimeType = 'audio/webm';
          const options = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
          ];
          
          for (const option of options) {
            if (MediaRecorder.isTypeSupported(option)) {
              mimeType = option;
              break;
            }
          }

          mediaRecorder = new MediaRecorder(stream, { mimeType });
          audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
              // Determinar el tipo MIME del blob
              const blobType = mimeType.split(';')[0] || 'audio/webm';
              audioBlob = new Blob(audioChunks, { type: blobType });
              
              // Verificar que el blob tenga contenido
              if (audioBlob.size === 0) {
                showStatus('Error: La grabación está vacía. Intenta de nuevo.', 'error');
                return;
              }

              const audioUrl = URL.createObjectURL(audioBlob);
              previewAudio.src = audioUrl;
              audioPreview.classList.add('active');
              
              // Mostrar información del audio
              const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
              document.getElementById('audioStatus').textContent = 
                `Audio grabado (${sizeMB} MB) - ${blobType}`;
              
              showStatus('✅ Audio grabado exitosamente', 'success');
            } else {
              showStatus('Error: No se capturó ningún audio. Intenta de nuevo.', 'error');
            }
            
            // Detener todos los tracks del stream
            recordingStream.getTracks().forEach(track => {
              track.stop();
            });
            recordingStream = null;
          };

          mediaRecorder.onerror = (event) => {
            console.error('Error en MediaRecorder:', event);
            showStatus('Error durante la grabación. Intenta de nuevo.', 'error');
            if (recordingStream) {
              recordingStream.getTracks().forEach(track => track.stop());
              recordingStream = null;
            }
          };

          // Iniciar grabación
          recordingStartTime = Date.now();
          mediaRecorder.start(1000); // Capturar datos cada segundo
          recordButton.textContent = '⏹ Detener (0:00)';
          recordButton.classList.add('recording');
          
          // Actualizar tiempo cada segundo
          recordingTimer = setInterval(updateRecordingTime, 1000);
          
          showStatus('🎤 Grabando...', 'loading');
        } catch (error) {
          console.error('Error accessing microphone:', error);
          let errorMsg = 'No se pudo acceder al micrófono.';
          
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError') {
            errorMsg = 'Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador.';
          } else if (error.name === 'NotFoundError') {
            errorMsg = 'No se encontró ningún micrófono. Por favor, conecta un micrófono e intenta de nuevo.';
          } else if (error.name === 'NotReadableError') {
            errorMsg = 'El micrófono está siendo usado por otra aplicación. Por favor, cierra otras aplicaciones.';
          } else if (error.name === 'OverconstrainedError') {
            errorMsg = 'El micrófono no soporta las características requeridas.';
          }
          
          showStatus(errorMsg, 'error');
          
          if (recordingStream) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
          }
        }
      }
    });

    // Eliminar audio grabado
    deleteAudioBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de eliminar el audio grabado?')) {
        // Limpiar blob y URL
        if (previewAudio.src) {
          URL.revokeObjectURL(previewAudio.src);
        }
        audioBlob = null;
        audioChunks = [];
        previewAudio.src = '';
        audioPreview.classList.remove('active');
        
        // Detener grabación si está activa
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          recordButton.textContent = '🎤 Grabar Mensaje';
          recordButton.classList.remove('recording');
          if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
          }
        }
        
        // Detener stream si está activo
        if (recordingStream) {
          recordingStream.getTracks().forEach(track => track.stop());
          recordingStream = null;
        }
        
        showStatus('Audio eliminado', 'success');
        setTimeout(() => {
          statusMessage.classList.remove('active');
        }, 2000);
      }
    });

    // Manejar envío del formulario
    personalizeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Verificar que se aceptaron los términos y es mayor de edad
      if (!termsAccepted || !isAdult) {
        showStatus('Debes aceptar los términos y condiciones, la política anti-bullying y confirmar que eres mayor de edad para continuar', 'error');
        termsModal.style.display = 'flex';
        return;
      }
      
      // Validar campos
      const senderName = document.getElementById('senderName').value.trim();
      const recipientName = document.getElementById('recipientName').value.trim();
      const writtenMessage = document.getElementById('writtenMessage').value.trim();

      if (!senderName) {
        showStatus('Por favor, ingresa tu nombre', 'error');
        document.getElementById('senderName').focus();
        return;
      }

      if (!recipientName) {
        showStatus('Por favor, ingresa el nombre del destinatario', 'error');
        document.getElementById('recipientName').focus();
        return;
      }

      if (!writtenMessage) {
        showStatus('Por favor, escribe un mensaje', 'error');
        document.getElementById('writtenMessage').focus();
        return;
      }

      if (!audioBlob) {
        showStatus('Por favor, graba un mensaje de voz', 'error');
        recordButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Verificar tamaño del archivo (máximo 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (audioBlob.size > maxSize) {
        showStatus(`El audio es demasiado grande (${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB). Máximo: 50 MB`, 'error');
        return;
      }

      // Detener cualquier grabación activa
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        if (recordingTimer) {
          clearInterval(recordingTimer);
          recordingTimer = null;
        }
      }

      const formData = new FormData();
      formData.append('senderName', senderName);
      formData.append('recipientName', recipientName);
      formData.append('writtenMessage', writtenMessage);
      
      // Agregar imagen si existe
      if (selectedImageFile) {
        formData.append('image', selectedImageFile);
      }
      
      // Agregar opción de wallpaper
      if (useImageAsWallpaperCheckbox && useImageAsWallpaperCheckbox.checked) {
        formData.append('useImageAsWallpaper', 'true');
      }
      
      // Agregar URL de video si existe
      const videoUrlInput = document.getElementById('videoUrl');
      if (videoUrlInput && videoUrlInput.value.trim()) {
        formData.append('videoUrl', videoUrlInput.value.trim());
      }
      
      // Determinar la extensión del archivo basado en el tipo MIME
      let extension = 'webm';
      if (audioBlob.type.includes('ogg')) {
        extension = 'ogg';
      } else if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) {
        extension = 'm4a';
      } else if (audioBlob.type.includes('wav')) {
        extension = 'wav';
      }
      
      formData.append('audio', audioBlob, `voice-message.${extension}`);

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando...';
      showStatus('Subiendo audio y creando tu tarjeta...', 'loading');

      try {
        const response = await fetch(`${PAGE_DATA.baseUrl}/api/pages/${PAGE_DATA.code}/personalize`, {
          method: 'PUT',
          body: formData,
        });

        // Verificar si la respuesta es JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Error del servidor: ${text}`);
        }

        if (!response.ok) {
          throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
        }

        if (data.success) {
          showStatus('¡Tarjeta creada exitosamente! Redirigiendo...', 'success');
          
          // Limpiar URL del blob para liberar memoria
          if (previewAudio.src) {
            URL.revokeObjectURL(previewAudio.src);
          }
          
          // Actualizar datos
          PAGE_DATA.isPersonalized = true;
          if (data.data.audioUrl) {
            audio.src = data.data.audioUrl;
          }
          
          const titleElement = document.querySelector('.player-container h1');
          const descElement = document.querySelector('.player-container .description');
          
          if (titleElement) {
            titleElement.textContent = data.data.title || `De ${data.data.senderName} para ${data.data.recipientName}`;
          }
          if (descElement) {
            descElement.textContent = data.data.description || data.data.writtenMessage;
          }

          // Mostrar imagen si fue subida
          if (data.data.imageUrl) {
            PAGE_DATA.imageUrl = data.data.imageUrl;
            PAGE_DATA.useImageAsWallpaper = data.data.useImageAsWallpaper || false;
            
            // Si la imagen debe usarse como wallpaper, aplicarla
            if (PAGE_DATA.useImageAsWallpaper && PAGE_DATA.imageUrl) {
              document.body.style.backgroundImage = `url('${PAGE_DATA.imageUrl}')`;
              document.body.style.backgroundSize = 'cover';
              document.body.style.backgroundPosition = 'center';
              document.body.style.backgroundAttachment = 'fixed';
              document.body.classList.add('has-wallpaper');
              // Ocultar la imagen del contenido si es wallpaper
              if (displayImage) displayImage.style.display = 'none';
            } else {
              // Mostrar la imagen en el contenido si no es wallpaper
              if (displayImage && PAGE_DATA.imageUrl) {
                displayImageImg.src = PAGE_DATA.imageUrl;
                displayImage.style.display = 'block';
              }
            }
          }

          // Mostrar video si fue agregado
          const displayVideo = document.getElementById('displayVideo');
          const displayVideoContainer = document.getElementById('displayVideoContainer');
          if (data.data.videoUrl && displayVideo && displayVideoContainer) {
            PAGE_DATA.videoUrl = data.data.videoUrl;
            loadVideoInContainer(data.data.videoUrl, displayVideoContainer, displayVideo);
          }

          // Cambiar a vista de reproducción primero
          setTimeout(() => {
            personalizationForm.classList.remove('active');
            playerView.classList.add('active');
            updateLimitsInfo();
            updateHeaderTitle();
            // Hacer scroll al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Mostrar modal de compartir después de cambiar la vista
            setTimeout(() => {
              showShareModal(data.data.senderName, data.data.recipientName);
            }, 500);
          }, 2000);
        } else {
          throw new Error(data.message || 'Error al crear la tarjeta');
        }
      } catch (error) {
        console.error('Error:', error);
        let errorMessage = error.message || 'Error al crear la tarjeta';
        
        // Mensajes más amigables
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica que el servidor esté corriendo.';
        } else if (errorMessage.includes('413')) {
          errorMessage = 'El archivo de audio es demasiado grande. Intenta grabar un audio más corto.';
        } else if (errorMessage.includes('400')) {
          errorMessage = 'Datos inválidos. Por favor, verifica que todos los campos estén completos.';
        }
        
        showStatus(`Error: ${errorMessage}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Tarjeta';
      }
    });

    function showStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.className = `status-message active ${type}`;
      setTimeout(() => {
        statusMessage.classList.remove('active');
      }, type === 'error' ? 5000 : 3000);
    }

    // Verificar si está expirado
    function isExpired() {
      if (!PAGE_DATA.expirationDate) return false;
      return new Date() > PAGE_DATA.expirationDate;
    }

    // Verificar si puede reproducir (preservadas siempre pueden)
    function canPlay() {
      if (PAGE_DATA.isPreserved) return true;
      if (isExpired()) return false;
      return PAGE_DATA.playCount < PAGE_DATA.maxPlays;
    }

    // Mostrar información de límites (ocultar contador si está preservada)
    function updateLimitsInfo() {
      if (PAGE_DATA.isPreserved) {
        limitsInfo.style.display = 'none';
        limitsInfo.textContent = '';
        updateHeaderTitle();
        return;
      }
      limitsInfo.style.display = '';
      if (isExpired()) {
        limitsInfo.textContent = '⏰ Esta tarjeta expiró el 14 de febrero a las 12:00 AM';
        limitsInfo.className = 'limits-info expired';
        playButton.disabled = true;
        audio.disabled = true;
        updateHeaderTitle();
        return;
      }

      const remaining = PAGE_DATA.maxPlays - PAGE_DATA.playCount;
      const expirationDate = new Date('2026-02-14T00:00:00');
      const expirationDateStr = expirationDate.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) + ' 12:00 AM';
      
      if (remaining <= 0) {
        limitsInfo.textContent = '🔒 Has alcanzado el límite de visualizaciones';
        limitsInfo.className = 'limits-info expired';
        playButton.disabled = true;
        audio.disabled = true;
        updateHeaderTitle();
      } else {
        limitsInfo.textContent = `👁️ Visualizaciones restantes: ${remaining} de ${PAGE_DATA.maxPlays} (expira el ${expirationDateStr})`;
        limitsInfo.className = 'limits-info';
        updateHeaderTitle();
      }
    }

    // Estado del reproductor
    let isPlaying = false;
    let hasIncrementedPlay = false;

    // Actualizar estado cuando el audio se carga
    audio.addEventListener('loadedmetadata', () => {
      status.textContent = 'Audio listo para reproducir';
    });

    audio.addEventListener('canplay', () => {
      status.textContent = 'Audio listo para reproducir';
    });

    audio.addEventListener('error', (e) => {
      status.textContent = 'Error al cargar el audio. Por favor, intenta más tarde.';
      status.style.color = '#dc3545';
      playButton.disabled = true;
      console.error('Error loading audio:', e);
    });

    // Controlar reproducción desde el botón
    playButton.addEventListener('click', async () => {
      if (!canPlay()) {
        alert('No puedes reproducir más veces. Límite alcanzado o expirado.');
        return;
      }

      if (isPlaying) {
        audio.pause();
        playButton.textContent = '▶';
        playButton.classList.remove('playing');
        isPlaying = false;
      } else {
        // Incrementar contador solo cuando empieza a reproducir
        if (!hasIncrementedPlay) {
          try {
            const response = await fetch(`${PAGE_DATA.baseUrl}/api/pages/${PAGE_DATA.code}/play`, {
              method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
              PAGE_DATA.playCount = data.data.playCount;
              
              // Si la tarjeta fue destruida, mostrar mensaje y ocultar reproductor
              if (data.data.destroyed) {
                updateLimitsInfo();
                updateHeaderTitle();
                showStatus('🔒 La tarjeta se ha autodestruido', 'error');
                return;
              }
              
              updateLimitsInfo();
              updateHeaderTitle();
              hasIncrementedPlay = true;
            }
          } catch (error) {
            console.error('Error incrementing play count:', error);
          }
        }

        audio.play().then(() => {
          playButton.textContent = '⏸';
          playButton.classList.add('playing');
          isPlaying = true;
          status.textContent = 'Reproduciendo...';
        }).catch((error) => {
          console.error('Error playing audio:', error);
          status.textContent = 'Error al reproducir el audio';
          status.style.color = '#dc3545';
        });
      }
    });

    // Sincronizar con los controles nativos del audio
    audio.addEventListener('play', () => {
      playButton.textContent = '⏸';
      playButton.classList.add('playing');
      isPlaying = true;
      status.textContent = 'Reproduciendo...';
    });

    audio.addEventListener('pause', () => {
      playButton.textContent = '▶';
      playButton.classList.remove('playing');
      isPlaying = false;
      status.textContent = 'Pausado';
    });

    audio.addEventListener('ended', () => {
      playButton.textContent = '▶';
      playButton.classList.remove('playing');
      isPlaying = false;
      hasIncrementedPlay = false;
      status.textContent = 'Audio finalizado';
    });

    // Mostrar progreso
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (isPlaying) {
          status.textContent = `Reproduciendo... ${Math.round(percent)}%`;
        }
      }
    });

    // Función para mostrar modal de compartir
    function showShareModal(senderName, recipientName) {
      const shareModal = document.getElementById('shareModal');
      const shareModalMessage = document.getElementById('shareModalMessage');
      const closeShareModal = document.getElementById('closeShareModal');
      const shareInstagram = document.getElementById('shareInstagram');
      const shareFacebook = document.getElementById('shareFacebook');
      const shareWhatsApp = document.getElementById('shareWhatsApp');
      const shareTwitter = document.getElementById('shareTwitter');
      const copyUrlBtn = document.getElementById('copyUrl');
      const copyUrlFeedback = document.getElementById('copyUrlFeedback');

      if (!shareModal) {
        console.error('Share modal not found');
        return;
      }

      // Actualizar mensaje
      if (shareModalMessage) {
        shareModalMessage.textContent = `${senderName || 'Alguien'} para ${recipientName || 'ti'}`;
      }

      // URL relativa de la tarjeta
      const cardUrl = `${PAGE_DATA.baseUrl}/page/${PAGE_DATA.code}`;
      const shareText = `${senderName || 'Alguien'} para ${recipientName || 'ti'}`;
      const fullShareText = `${shareText} - ${cardUrl}`;

      // Limpiar event listeners anteriores para evitar duplicados
      const newCloseBtn = closeShareModal?.cloneNode(true);
      if (closeShareModal && newCloseBtn) {
        closeShareModal.parentNode?.replaceChild(newCloseBtn, closeShareModal);
      }

      // Mostrar modal con display flex
      shareModal.style.display = 'flex';
      shareModal.style.alignItems = 'center';
      shareModal.style.justifyContent = 'center';

      // Cerrar modal - usar el nuevo elemento si existe
      const closeBtn = document.getElementById('closeShareModal');
      if (closeBtn) {
        closeBtn.onclick = () => {
          shareModal.style.display = 'none';
        };
      }

      // Compartir en Instagram (abre en nueva pestaña con el texto)
      const instagramBtn = document.getElementById('shareInstagram');
      if (instagramBtn) {
        instagramBtn.onclick = () => {
          // Instagram no tiene API directa, abrimos la app o web
          const instagramUrl = `https://www.instagram.com/`;
          window.open(instagramUrl, '_blank');
          // Mostrar mensaje para que el usuario pegue manualmente
          if (navigator.clipboard) {
            navigator.clipboard.writeText(fullShareText).then(() => {
              alert('Texto copiado. Pégalo en tu publicación de Instagram.');
            });
          }
        };
      }

      // Compartir en Facebook
      const facebookBtn = document.getElementById('shareFacebook');
      if (facebookBtn) {
        facebookBtn.onclick = () => {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}&quote=${encodeURIComponent(shareText)}`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
        };
      }

      // Compartir en WhatsApp
      const whatsappBtn = document.getElementById('shareWhatsApp');
      if (whatsappBtn) {
        whatsappBtn.onclick = () => {
          // Mensaje personalizado para WhatsApp
          const whatsappMessage = `te mande una tarjeta virtual, da click aqui\n${shareText} - ${cardUrl}`;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(whatsappUrl, '_blank');
        };
      }

      // Compartir en Twitter/X
      const twitterBtn = document.getElementById('shareTwitter');
      if (twitterBtn) {
        twitterBtn.onclick = () => {
          const twitterText = `${shareText} - ${cardUrl}`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(cardUrl)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
        };
      }

      // Copiar URL
      const copyBtn = document.getElementById('copyUrl');
      if (copyBtn) {
        copyBtn.onclick = async () => {
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(cardUrl);
              const feedback = document.getElementById('copyUrlFeedback');
              if (feedback) {
                feedback.style.display = 'block';
                setTimeout(() => {
                  feedback.style.display = 'none';
                }, 2000);
              }
            } else {
              // Fallback para navegadores antiguos
              const textArea = document.createElement('textarea');
              textArea.value = cardUrl;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              const feedback = document.getElementById('copyUrlFeedback');
              if (feedback) {
                feedback.style.display = 'block';
                setTimeout(() => {
                  feedback.style.display = 'none';
                }, 2000);
              }
            }
          } catch (error) {
            console.error('Error copying URL:', error);
            alert('Error al copiar URL. Por favor, cópiala manualmente: ' + cardUrl);
          }
        };
      }
    }
