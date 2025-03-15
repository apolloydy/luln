// Contact.jsx
import React from 'react';

function Contact() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Contact Us</h2>
      <p>If you would like to send us a message, please click below:</p>
      <a 
        href="mailto:no-reply@luln.org?subject=Hello%20from%20LULN" 
        style={{ color: 'lightgreen', fontWeight: 'bold', textDecoration: 'underline' }}
      >
        Send Email
      </a>
    </div>
  );
}

export default Contact;