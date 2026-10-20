// Carrousels horizontaux sur mobile : points de navigation + position courante.
const mq = window.matchMedia('(max-width:700px)');

function setup(track, label) {
  const cards = [...track.children];
  if (cards.length < 2) return;

  const dots = document.createElement('div');
  dots.className = 'carousel-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', label);

  const buttons = cards.map((card, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Carte ${i + 1} sur ${cards.length}`);
    b.addEventListener('click', () => {
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0), behavior: 'smooth' });
    });
    dots.appendChild(b);
    return b;
  });

  const hint = document.createElement('p');
  hint.className = 'carousel-hint';
  hint.textContent = 'Glissez pour voir la suite →';

  track.after(dots);
  dots.after(hint);

  const update = () => {
    if (!mq.matches) return;
    const left = track.scrollLeft;
    let idx = 0, best = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - left - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0));
      if (d < best) { best = d; idx = i; }
    });
    buttons.forEach((b, i) => b.setAttribute('aria-current', i === idx ? 'true' : 'false'));
    if (idx > 0) hint.style.visibility = 'hidden';
  };

  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  mq.addEventListener('change', update);
  update();
}

const services = document.querySelector('.service-grid');
const workflows = document.querySelector('.wf-grid');
if (services) setup(services, 'Navigation entre les services');
if (workflows) setup(workflows, 'Navigation entre les workflows');
