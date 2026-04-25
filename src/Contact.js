// Contact.jsx
import React from 'react';
import { useLocale } from './i18n/LocaleProvider';

function Contact() {
  const { t } = useLocale();

  return (
    <main className="contact-page">
      <section className="contact-panel">
        <span className="contact-eyebrow">LULN</span>
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.lead")}</p>
        <a
          href="mailto:contactus@luln.org?subject=Hello%20from%20LULN"
          className="contact-mail-link"
        >
          <span>{t("contact.cta")}</span>
          <strong>contactus@luln.org</strong>
        </a>
      </section>
    </main>
  );
}

export default Contact;
