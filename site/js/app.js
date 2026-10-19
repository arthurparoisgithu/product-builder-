// Interactions du portfolio : surlignage du lien de navigation correspondant à la section visible.
// Les démos BriefOps et les simulateurs n8n ont été retirés au profit de la section statique #workflows.
const sectionIds = ['services', 'methode', 'workflows', 'video', 'contact'];
const navLinks = document.querySelectorAll('.header nav a');

if ('IntersectionObserver' in window && navLinks.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => link.classList.toggle('current', link.hash === `#${entry.target.id}`));
    }
  }, { rootMargin: '-20% 0px -60% 0px' });
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// Apparition au scroll (fade + léger slide-up), une seule fois par section.
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }
}

// Secours pour les liens mailto : sur un poste sans messagerie par défaut configurée
// (fréquent sur un ordinateur d'entreprise), le clic ne fait rien de visible.
// On copie l'adresse dans le presse-papiers et on le signale, sans empêcher le mailto.
const mailLinks = document.querySelectorAll('a[href^="mailto:"]');
if (mailLinks.length && navigator.clipboard) {
  const toast = document.createElement('p');
  toast.className = 'mail-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let hideTimer;
  mailLinks.forEach(link => {
    link.addEventListener('click', () => {
      const email = decodeURIComponent(link.href.slice('mailto:'.length).split('?')[0]);
      navigator.clipboard.writeText(email).then(() => {
        toast.textContent = `Adresse copiée : ${email} — si rien ne s'ouvre, collez-la dans votre messagerie.`;
        toast.classList.add('visible');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => toast.classList.remove('visible'), 6000);
      }).catch(() => {});
    });
  });
}
