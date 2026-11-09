// Legal pages: highlights the table-of-contents entry of the section being read.

import { $$ } from '../motion/env.js';

const links = $$('.legal-toc a[href^="#"]');
const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-current', a.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach((s) => io.observe(s));
}
