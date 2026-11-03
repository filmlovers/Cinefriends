// EMAIL DI CONFERMA (EMAILJS) — facoltativa.
// Dopo una prenotazione riuscita, chi ha prenotato riceve un'email con i link per aggiungere la serata al calendario.
// Compila i tre campi seguendo la guida nel README (punto 6). Se restano vuoti, l'email non viene inviata
// e il resto del sito funziona normalmente.
window.CONFERMA_CONFIG = {
  publicKey: "V8WPcezNFUm_mw2GhqfWI",   // EmailJS > Account > General > Public Key
  serviceId: "service_u14p9ba",   // EmailJS > Email Services > Service ID (es. "service_xxxxxxx")
  templateId: "template_hlp203s"   // EmailJS > Email Templates > Template ID (es. "template_xxxxxxx")
};
