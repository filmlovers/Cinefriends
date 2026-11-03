CINEFREINDS — SITO WEB STATICO

CONTENUTO
- index.html: homepage, film della settimana, programmazione e modulo prenotazioni.
- styles.css: grafica responsive per computer e smartphone.
- films.js: elenco dei film e dati da aggiornare ogni settimana.
- script.js: visualizzazione automatica di film e programmazione.
- grazie.html: pagina mostrata dopo l'invio del modulo.

1. PERSONALIZZARE I FILM
Apri films.js con un editor di testo. Modifica i film, le date, l'orario, la sala e l'indirizzo.
Il primo film nell'elenco è quello mostrato in homepage. Aggiungi o rimuovi oggetti seguendo la stessa struttura.
I poster sono grafiche tipografiche originali, non locandine ufficiali. Puoi sostituirli con immagini autorizzate.

2. ATTIVARE LE PRENOTAZIONI (WEB3FORMS, GRATUITO)
Il modulo usa Web3Forms (piano gratuito: 250 invii al mese; verifica i limiti aggiornati su web3forms.com/pricing).
- Vai su https://web3forms.com, inserisci l'email che riceverà le prenotazioni e copia la "Access Key" che ti arriva.
- Apri prenotazioni-config.js e incolla la chiave in accessKey. La chiave serve solo a inviare i moduli e può stare nel sito pubblico.
- (Facoltativo) In fallbackEmail inserisci un indirizzo: se l'invio fallisce, si apre l'app di posta con la prenotazione già scritta. L'indirizzo sarà visibile a chiunque legga il codice della pagina.
- Pubblica il sito e invia una prenotazione di prova. Finché accessKey è vuoto il modulo mostra un avviso e non invia nulla.
- Più destinatari: nel piano gratuito la chiave ha una sola email. Per avvisare due persone usa una regola di inoltro automatico nella casella che riceve le prenotazioni.
Nota privacy: il modulo raccoglie nome, email e numero di posti. Inserisci sul sito un'informativa privacy adeguata al tuo caso e raccogli solo i dati necessari. Il testo di consenso incluso è un promemoria essenziale, non sostituisce un'informativa GDPR completa.

3. PUBBLICARE GRATIS CON GITHUB PAGES
- Crea un account gratuito su GitHub.
- Crea un nuovo repository pubblico, ad esempio "cineforum".
- Carica tutti i file mantenendo la struttura.
- Vai in Settings > Pages.
- In "Build and deployment" scegli "Deploy from a branch", branch "main" e cartella "/ (root)", poi salva.
- Dopo qualche minuto GitHub mostrerà l'indirizzo pubblico del sito nella sezione Pages.

ALTERNATIVA
Puoi caricare la cartella su Netlify Drop per una pubblicazione rapida; verifica le condizioni del piano gratuito e configura il dominio se necessario.

NOTE
Il sito è statico: non serve acquistare un dominio o un hosting per iniziare. Per le prenotazioni serve inserire la chiave Web3Forms in prenotazioni-config.js come descritto sopra.


4. ATTIVARE LA SEZIONE PROPOSTE (COMMENTI CON GISCUS)
Giscus salva i commenti nelle "Discussions" di un repository GitHub pubblico. I visitatori accedono (o si registrano) con GitHub.
- Usa il repository pubblico del sito. In Settings > General > Features attiva "Discussions".
- Nella tab Discussions crea una categoria "Proposte" di tipo "Announcements" (solo i maintainer creano discussioni, tutti commentano).
- Installa l'app Giscus: https://github.com/apps/giscus (concedi l'accesso al repository).
- Vai su https://giscus.app, inserisci il repository, scegli la categoria "Proposte" e la modalità "Titolo della pagina/Specifica".
- Copia i valori data-repo, data-repo-id e data-category-id nel file giscus-config.js (campi repo, repoId, categoryId).
- Pubblica: i commenti compaiono nella sezione Proposte. Finché il file è vuoto, il sito mostra un avviso.
Nota: il sito non può avere un proprio modulo di registrazione GitHub. La sezione spiega come creare l'account (https://github.com/signup) e il riquadro dei commenti mostra il pulsante "Sign in with GitHub".

5. IMMAGINE HOMEPAGE
L'illustrazione in homepage è assets/hero-cinefriends.svg. Per usare una foto, salvala in assets/ e cambia il percorso nel tag <img class="hero-img"> di index.html.
