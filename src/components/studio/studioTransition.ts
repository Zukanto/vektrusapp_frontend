/**
 * "Dimming the Lights" — Cinematic Studio Entry/Exit Transitions
 *
 * Entry choreography (~1000ms):
 *   Phase 2 (0–400ms):    Dark overlay dims current page to #09090b
 *   Darkness (400–550ms):  Brief total darkness, route changes
 *   Phase 3 (550–1050ms):  Overlay fades, Studio elements stagger-reveal
 *
 * Exit choreography ("Lights On", ~900ms) — mirrors entry in reverse:
 *   Content retreats (0–300ms)
 *   Dock slides down (120–420ms)
 *   TopBar fades (200–450ms)
 *   Brief darkness (500–600ms)
 *   Overlay reveals bright destination (600–900ms)
 */

import type { NavigateFunction } from 'react-router-dom';

const OVERLAY_ID = 'studio-dimming-overlay';

// ── Shared easing curves ──
const EASE_OUT = 'cubic-bezier(0.0, 0, 0.2, 1)';
const EASE_IN_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ── Entry timing (ms) ──
const DIMMING_DURATION = 400;
const DARKNESS_PAUSE = 150;
const OVERLAY_FADEOUT = 300;

// ── Exit timing (ms) ──
const EXIT_ANIM_DURATION = 300;     // per-element animation length
const EXIT_DARKNESS_PAUSE = 100;    // brief black between studio and destination
const EXIT_REVEAL_DURATION = 350;   // overlay fade revealing destination

function createOverlay(initialOpacity: number): HTMLDivElement {
  document.getElementById(OVERLAY_ID)?.remove();

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',
    backgroundColor: '#09090b',
    opacity: String(initialOpacity),
    pointerEvents: 'all',
  });
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * "Dimming the Lights" — Entry transition to Studio.
 * Pass a reelId to navigate to /studio/<reelId>, or omit for /studio.
 */
export function enterStudio(navigate: NavigateFunction, reelId?: string) {
  const overlay = createOverlay(0);

  void overlay.offsetHeight;
  overlay.style.transition = `opacity ${DIMMING_DURATION}ms ${EASE_IN_OUT}`;
  overlay.style.opacity = '1';

  const targetPath = reelId ? `/studio/${reelId}` : '/studio';

  setTimeout(() => {
    navigate(targetPath);

    setTimeout(() => {
      overlay.style.transition = `opacity ${OVERLAY_FADEOUT}ms ${EASE_OUT}`;
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => overlay.remove(), OVERLAY_FADEOUT + 50);
    }, DARKNESS_PAUSE);
  }, DIMMING_DURATION);
}

/**
 * "Lights On" — Exit transition from Studio.
 *
 * Mirrors entry in reverse order:
 *   Content retreats first (scale down + fade)
 *   Dock slides back down
 *   TopBar fades out last (the frame disappears last)
 *   Brief total darkness
 *   Destination page revealed through fading overlay
 */
export function exitStudio(navigate: NavigateFunction, targetPath: string = '/planner') {
  const root = document.querySelector('[data-studio-root]') as HTMLElement | null;

  // Last element to finish animating determines when we navigate
  let maxEndTime = 0;

  if (root) {
    const children = Array.from(root.children) as HTMLElement[];

    children.forEach((el) => {
      const isContent = el.classList.contains('studio-reveal-content');
      const isDock = el.classList.contains('studio-reveal-dock');
      // TopBar = everything else (first child)

      // Reverse of entry order: Content first → Dock → TopBar last
      let delay: number;
      let transform: string;

      if (isContent) {
        // Content retreats first — reverse of "breathe in"
        delay = 0;
        transform = 'translateY(10px) scale(0.97)';
      } else if (isDock) {
        // Dock slides back down — reverse of "slide up"
        delay = 120;
        transform = 'translateY(20px)';
      } else {
        // TopBar fades last — reverse of "fade in first"
        delay = 200;
        transform = 'translateY(0)';
      }

      const endTime = delay + EXIT_ANIM_DURATION;
      if (endTime > maxEndTime) maxEndTime = endTime;

      el.style.transition = [
        `opacity ${EXIT_ANIM_DURATION}ms ${EASE_IN_OUT} ${delay}ms`,
        `transform ${EXIT_ANIM_DURATION}ms ${EASE_OUT_EXPO} ${delay}ms`,
      ].join(', ');
      el.style.opacity = '0';
      el.style.transform = transform;
    });
  }

  // After all elements have animated out + brief darkness
  setTimeout(() => {
    // Overlay at full opacity (same color as Studio bg = invisible)
    const overlay = createOverlay(1);

    navigate(targetPath);

    // Smooth fade-out to reveal the bright destination
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = `opacity ${EXIT_REVEAL_DURATION}ms ${EASE_OUT}`;
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), EXIT_REVEAL_DURATION + 50);
      });
    });
  }, maxEndTime + EXIT_DARKNESS_PAUSE);
}
