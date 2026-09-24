import confetti from 'canvas-confetti';

export function fireLuxuryConfetti() {
  // Gold, cyan, green, red, and purple pieces as specified
  const colors = ['#D4AF37', '#06B6D4', '#10B981', '#EF4444', '#A855F7', '#FFF0B8'];

  // Left cannon
  confetti({
    particleCount: 65,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.7 },
    colors,
    ticks: 240,
    gravity: 0.9,
    scalar: 1.1,
  });

  // Right cannon
  confetti({
    particleCount: 65,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.7 },
    colors,
    ticks: 240,
    gravity: 0.9,
    scalar: 1.1,
  });

  // Center star burst
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors,
      ticks: 280,
      gravity: 0.75,
      shapes: ['square', 'circle'],
      scalar: 1.2,
    });
  }, 180);
}

export const fireConfetti = fireLuxuryConfetti;
