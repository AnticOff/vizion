// Contact page form. Inactive until CONTACT_FORM.endpoint is set (js/data/contact.js).

import { $ } from '../motion/env.js';
import { LANG } from '../i18n.js';
import { CONTACT_FORM } from '../data/contact.js';

const S = {
  en: {
    inactive: 'The form is not active yet. Please write to us by email for now.',
    sending: 'Sending…',
    sent: 'Thank you, your message has been sent. We will get back to you soon.',
    error: 'The message could not be sent. Please try again, or write to us by email.',
  },
  fr: {
    inactive: 'Le formulaire n’est pas encore actif. Écrivez-nous par e-mail en attendant.',
    sending: 'Envoi…',
    sent: 'Merci, votre message est envoyé. Nous revenons vers vous rapidement.',
    error: 'Le message n’a pas pu être envoyé. Réessayez, ou écrivez-nous par e-mail.',
  },
}[LANG];

const form = $('[data-contact-form]');
if (form) {
  const status = $('[data-form-status]', form);
  const notice = $('[data-form-notice]', form);
  const button = $('button[type="submit"]', form);
  const active = Boolean(CONTACT_FORM.endpoint);
  notice.hidden = active;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (!active) { status.textContent = S.inactive; return; }

    button.disabled = true;
    status.textContent = S.sending;
    try {
      const res = await fetch(CONTACT_FORM.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      status.textContent = S.sent;
    } catch {
      status.textContent = S.error;
    } finally {
      button.disabled = false;
    }
  });
}
