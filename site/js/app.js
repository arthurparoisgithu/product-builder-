// Interactions du portfolio : surlignage du lien de navigation correspondant à la section visible.
// Les démos BriefOps et les simulateurs n8n ont été retirés au profit de la section statique #workflows.
const sectionIds = ['services', 'methode', 'workflows', 'profil', 'contact'];
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
