import { REGIONS_DATA } from '../data/regionsData.js';
import { gameState } from '../services/GameState.js';

/**
 * Fase 2 (prompt 2) — Certificado descargable al completar (dominar al 80%+)
 * las 5 regiones del programa. Se dibuja 100% client-side en un <canvas> y se
 * exporta como PNG — sin dependencias nuevas (no se pidió instalar un
 * generador de PDF para esta tarea, solo GSAP para las animaciones).
 */

const WIDTH = 1600;
const HEIGHT = 1131; // proporción A4 apaisada

async function loadCertificateFonts() {
  try {
    await Promise.all([
      document.fonts.load('800 64px "Outfit"'),
      document.fonts.load('700 34px "Outfit"'),
      document.fonts.load('600 32px "Outfit"'),
      document.fonts.load('400 26px "Inter"')
    ]);
  } catch (e) {
    // Si Google Fonts no cargó (offline, etc.) el canvas usa la fuente de
    // respaldo del sistema — el certificado igual se genera.
  }
}

function drawBackground(ctx) {
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, '#121212');
  bgGrad.addColorStop(0.5, '#1a0710');
  bgGrad.addColorStop(1, '#121212');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowTopLeft = ctx.createRadialGradient(WIDTH * 0.15, HEIGHT * 0.15, 0, WIDTH * 0.15, HEIGHT * 0.15, WIDTH * 0.4);
  glowTopLeft.addColorStop(0, 'rgba(128,0,32,0.45)');
  glowTopLeft.addColorStop(1, 'transparent');
  ctx.fillStyle = glowTopLeft;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowBottomRight = ctx.createRadialGradient(WIDTH * 0.85, HEIGHT * 0.85, 0, WIDTH * 0.85, HEIGHT * 0.85, WIDTH * 0.4);
  glowBottomRight.addColorStop(0, 'rgba(184,134,11,0.28)');
  glowBottomRight.addColorStop(1, 'transparent');
  ctx.fillStyle = glowBottomRight;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(184,134,11,0.5)';
  ctx.strokeRect(58, 58, WIDTH - 116, HEIGHT - 116);
}

async function drawCertificate() {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  await loadCertificateFonts();
  drawBackground(ctx);
  ctx.textAlign = 'center';

  ctx.font = '110px sans-serif';
  ctx.fillText('🍷', WIDTH / 2, 220);

  ctx.fillStyle = '#B8860B';
  ctx.font = '800 60px "Outfit", sans-serif';
  ctx.fillText('CERTIFICADO DE MAESTRÍA ENOLÓGICA', WIDTH / 2, 320);

  ctx.fillStyle = '#F5EFE0';
  ctx.font = '600 32px "Outfit", sans-serif';
  ctx.fillText('VINOTIPOS · Programa Interactivo de Enología', WIDTH / 2, 372);

  ctx.font = '400 30px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(245,239,224,0.85)';
  ctx.fillText('Se certifica que el jugador completó y dominó (80%+ de aciertos)', WIDTH / 2, 470);
  ctx.fillText('las 5 regiones vitivinícolas del programa:', WIDTH / 2, 508);

  ctx.font = '700 32px "Outfit", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  const regionsLine = REGIONS_DATA.map(r => `${r.flag} ${r.name}`).join('   •   ');
  ctx.fillText(regionsLine, WIDTH / 2, 580);

  ctx.font = '400 26px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(245,239,224,0.7)';
  ctx.fillText(
    `XP acumulado: ${gameState.state.xp} · Racha máxima registrada: ${gameState.state.streak} días`,
    WIDTH / 2, 640
  );

  const dateStr = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillText(`Emitido el ${dateStr}`, WIDTH / 2, 680);

  ctx.strokeStyle = 'rgba(184,134,11,0.5)';
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 220, 800);
  ctx.lineTo(WIDTH / 2 + 220, 800);
  ctx.stroke();

  ctx.font = '800 42px "Outfit", sans-serif';
  ctx.fillStyle = '#B8860B';
  ctx.fillText('Héctor García — El Sommelier RD', WIDTH / 2, 860);

  ctx.font = '400 24px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(245,239,224,0.6)';
  ctx.fillText('Fundador · Programa Vinotipos', WIDTH / 2, 895);

  ctx.font = '400 22px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(245,239,224,0.45)';
  ctx.fillText(
    'Contenido educativo. Bebe con responsabilidad. Prohibida su venta o consumo a menores de edad.',
    WIDTH / 2, HEIGHT - 70
  );

  return canvas;
}

/**
 * Dibuja el certificado y lo monta como preview + botón de descarga dentro
 * del contenedor dado (usado por CourseEngine al terminar la última región).
 */
export async function mountCertificatePreview(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div class="ce-cert-panel">
      <p class="ce-cert-headline">🎓 ¡Curso completo! Generamos tu certificado.</p>
      <div class="ce-cert-preview-wrap">
        <img id="ce-cert-img" class="ce-cert-preview" alt="Certificado Vinotipos" />
      </div>
      <a id="ce-cert-download" class="btn-header ce-action-btn" download="vinotipos-certificado.png">
        Descargar Certificado
      </a>
    </div>
  `;

  const canvas = await drawCertificate();
  const dataUrl = canvas.toDataURL('image/png');

  const img = containerEl.querySelector('#ce-cert-img');
  if (img) img.src = dataUrl;

  const link = containerEl.querySelector('#ce-cert-download');
  if (link) link.href = dataUrl;
}
