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
