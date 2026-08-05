export class Corchito {
  constructor(containerEl) {
    this.container = containerEl;
    this.state = 'idle'; // idle | acierto | fallo | racha_fallos | bloqueado
    this.speechText = '';
  }

  setState(newState, speechText = '') {
    this.state = newState;
    this.speechText = speechText;
    this.render();
  }

  render() {
    if (!this.container) return;

    // Expresión de Ojos según Estado UX
    let eyesSvg = '';
    let glassFill = '#B8860B';
    let glassOpacity = '0.9';

    switch (this.state) {
      case 'acierto':
        // Ojos en arco de felicidad
        eyesSvg = `
          <path d="M 42 46 Q 49 36 56 46" stroke="#2B180A" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <path d="M 64 46 Q 71 36 78 46" stroke="#2B180A" stroke-width="3.5" fill="none" stroke-linecap="round" />
        `;
        glassFill = '#FFD700';
        break;
      case 'fallo':
        // Ojos tristes / cerrados
        eyesSvg = `
          <path d="M 42 42 L 56 48" stroke="#2B180A" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 64 48 L 78 42" stroke="#2B180A" stroke-width="3.5" stroke-linecap="round" />
        `;
        glassFill = '#800020';
        glassOpacity = '0.4';
        break;
      case 'racha_fallos':
        // Ojos de mareo en espiral
        eyesSvg = `
          <circle cx="49" cy="44" r="5.5" stroke="#800020" stroke-width="2.5" fill="none" stroke-dasharray="3,3" />
          <circle cx="71" cy="44" r="5.5" stroke="#800020" stroke-width="2.5" fill="none" stroke-dasharray="3,3" />
        `;
        glassFill = '#800020';
        break;
      case 'bloqueado':
        // Ojos de advertencia
        eyesSvg = `
          <line x1="44" y1="39" x2="54" y2="49" stroke="#D92538" stroke-width="3.5" stroke-linecap="round" />
          <line x1="54" y1="39" x2="44" y2="49" stroke="#D92538" stroke-width="3.5" stroke-linecap="round" />
          <line x1="66" y1="39" x2="76" y2="49" stroke="#D92538" stroke-width="3.5" stroke-linecap="round" />
          <line x1="76" y1="39" x2="66" y2="49" stroke="#D92538" stroke-width="3.5" stroke-linecap="round" />
        `;
        break;
      default:
        // Idle: Ojos curiosos expresivos
        eyesSvg = `
          <circle cx="49" cy="44" r="4.5" fill="#2B180A" />
          <circle cx="71" cy="44" r="4.5" fill="#2B180A" />
          <circle cx="51" cy="42" r="1.5" fill="#FFF" />
          <circle cx="73" cy="42" r="1.5" fill="#FFF" />
        `;
        break;
    }

    const html = `
      <div class="corchito-wrapper corchito-${this.state}">
        ${this.speechText ? `<div class="corchito-speech-bubble">${this.speechText}</div>` : ''}
        
        <svg class="corchito-svg" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Sombras de fondo -->
          <ellipse cx="60" cy="130" rx="34" ry="7" fill="rgba(0,0,0,0.5)" />

          <!-- CUERPO CILÍNDRICO DE CORCHO DE VINO -->
          <g class="corchito-body">
            <!-- Cilindro Base Principal (Forma Inconfundible de Tapón de Corcho) -->
            <!-- Tapa Superior Ovalada del Cilindro -->
            <ellipse cx="60" cy="22" rx="32" ry="10" fill="url(#corchoTopGradiente)" stroke="#B8860B" stroke-width="1.5" />
            
            <!-- Paredes Cilíndricas con Bisel -->
            <path d="M 28 22 L 28 110 C 28 118, 92 118, 92 110 L 92 22 Z" fill="url(#corchoCilindroGradiente)" stroke="#B8860B" stroke-width="1.5" />

            <!-- Mancha Tinto Borgoña en la Base Inferior (Sello de Botella Descorchada) -->
            <path d="M 28 104 C 28 116, 92 116, 92 104 C 92 112, 28 112, 28 104 Z" fill="url(#manchaVinoGradiente)" opacity="0.85" />

            <!-- TEXTURA POROSA Y GRIETAS NATURALES DE MADERA DE CORCHO -->
            <g opacity="0.65">
              <!-- Poros oscuros pequeños -->
              <circle cx="36" cy="35" r="1.2" fill="#4A2E16" />
              <circle cx="84" cy="40" r="1.5" fill="#4A2E16" />
              <circle cx="33" cy="65" r="1.8" fill="#4A2E16" />
              <circle cx="86" cy="75" r="1.3" fill="#4A2E16" />
              <circle cx="42" cy="98" r="1.4" fill="#4A2E16" />
              <circle cx="78" cy="102" r="1.6" fill="#4A2E16" />
              
              <!-- Grietas longitudinales de prensado de corteza de alcornoque -->
              <path d="M 35 32 Q 33 48 36 60" stroke="#6E4723" stroke-width="1.5" stroke-linecap="round" />
              <path d="M 85 45 Q 87 62 84 78" stroke="#6E4723" stroke-width="1.5" stroke-linecap="round" />
              <path d="M 40 75 Q 38 88 41 100" stroke="#6E4723" stroke-width="1.2" stroke-linecap="round" />
              <path d="M 80 28 Q 82 36 79 44" stroke="#6E4723" stroke-width="1.2" stroke-linecap="round" />

              <!-- Anillos horizontales de compresión de botella -->
              <path d="M 30 52 Q 60 56 90 52" stroke="rgba(110,71,35,0.25)" stroke-width="1.5" fill="none" />
              <path d="M 29 80 Q 60 84 91 80" stroke="rgba(110,71,35,0.25)" stroke-width="1.5" fill="none" />
            </g>

            <!-- EXPRESIONES FACIALES EN EL CILINDRO -->
            <!-- Ojos Expresivos -->
            ${eyesSvg}

            <!-- Boca Expresiva -->
            ${this.state === 'acierto' 
              ? `<path d="M 52 60 Q 60 70 68 60" stroke="#2B180A" stroke-width="3" fill="#800020" stroke-linecap="round" />`
              : this.state === 'fallo' || this.state === 'racha_fallos'
              ? `<path d="M 53 65 Q 60 58 67 65" stroke="#2B180A" stroke-width="3" fill="none" stroke-linecap="round" />`
              : `<path d="M 53 60 Q 60 66 67 60" stroke="#2B180A" stroke-width="2.5" fill="none" stroke-linecap="round" />`
            }

            <!-- Candado Indicador en Estado Bloqueado -->
            ${this.state === 'bloqueado' 
              ? `<g transform="translate(52, 75)">
                  <rect x="2" y="6" width="12" height="10" rx="2" fill="#D92538" />
                  <path d="M 4 6 V 3 C 4 1, 12 1, 12 3 V 6" stroke="#D92538" stroke-width="2" fill="none" />
                 </g>`
              : ''
            }

            <!-- Copa de Vino en la Mano (System State Indicator) -->
            <g transform="translate(85, 62)">
              <path d="M 0 0 C 0 14, 16 14, 16 0 Z" fill="rgba(245,239,224,0.25)" stroke="#F5EFE0" stroke-width="1.5" />
              <path d="M 2 4 C 2 12, 14 12, 14 4 Z" fill="${glassFill}" opacity="${glassOpacity}" />
              <line x1="8" y1="14" x2="8" y2="24" stroke="#F5EFE0" stroke-width="1.5" />
              <line x1="3" y1="24" x2="13" y2="24" stroke="#F5EFE0" stroke-width="1.5" />
            </g>
          </g>

          <!-- GRADIENTES 3D REALISTAS DE CORCHO DE VINO DE ALCORNOQUE -->
          <defs>
            <!-- Gradiente de Pared Cilíndrica -->
            <linearGradient id="corchoCilindroGradiente" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#8C6333" />
              <stop offset="25%" stop-color="#D4B07B" />
              <stop offset="65%" stop-color="#C59E68" />
              <stop offset="100%" stop-color="#6E4822" />
            </linearGradient>

            <!-- Gradiente de Tapa Superior -->
            <linearGradient id="corchoTopGradiente" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E5C596" />
              <stop offset="70%" stop-color="#BA945E" />
              <stop offset="100%" stop-color="#8C6333" />
            </linearGradient>

            <!-- Mancha de Vino Tinto Borgoña en la Base -->
            <linearGradient id="manchaVinoGradiente" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="transparent" />
              <stop offset="100%" stop-color="#800020" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    `;

    this.container.innerHTML = html;
  }

  destroy() {
    this.container = null;
  }
}
