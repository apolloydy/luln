// Contact.jsx
import React from 'react';
import { useLocale } from './i18n/LocaleProvider';

function Contact() {
  const { t } = useLocale();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{t("contact.title")}</h2>
      <p>{t("contact.lead")}</p>
      <a 
        href="mailto:contactus@luln.org?subject=Hello%20from%20LULN" 
        style={{ color: 'lightgreen', fontWeight: 'bold', textDecoration: 'underline' }}
      >
        {t("contact.cta")}: contactus@luln.org
      </a>
    </div>
  );
}

export default Contact;
