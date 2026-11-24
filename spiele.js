// Liste aller Spiele (Startseite und Kamerafahrt) und Vorbereitung der Kamerafahrt.
// Synchron im <head> laden, vor fx.js: Kommt man per Kamerafahrt an, wird die Seite bis zum ersten
// Bild in der Spielfarbe gehalten, damit zwischen den Seiten nichts aufblitzt. fx.js übernimmt dann.
// n: Name, p: Datei, bg/fg: Farben, d: Symbol (ein SVG-Pfad, viewBox 64)
const SPIELE = [
  { n: 'Der Dümmste fliegt',  p: 'derduemmstefliegt.html', bg: '#2B4BFF', fg: '#FFFFFF', d: 'M4 30l56-22-20 48-9-19z' },
  { n: 'Zündschnur',          p: 'zuendschnur.html',       bg: '#C8371D', fg: '#FFFFFF', d: 'M10 38a18 18 0 1 0 36 0a18 18 0 1 0-36 0zM38 22l8-10 4 4-8 10zM54 0l2 5 5 2-5 2-2 5-2-5-5-2 5-2z' },
  { n: 'Stirnraten',          p: 'stirnraten.html',        bg: '#FF86BC', fg: '#16161A', d: 'M15 44a17 17 0 1 0 34 0a17 17 0 1 0-34 0zM18 6h28v18H18z' },
  { n: 'Wizard',              p: 'wizard.html',            bg: '#5B33C4', fg: '#FFC531', d: 'M34 4l13 37H17zM5 49a27 7 0 1 0 54 0a27 7 0 1 0-54 0z' },
  { n: 'Spyfall',             p: 'spyfall.html',           bg: '#1F2430', fg: '#FFC531', d: 'M18 26c0-11 6-17 14-17s14 6 14 17zM6 26h52v6H6zM14 46a8 8 0 1 0 16 0a8 8 0 1 0-16 0zM34 46a8 8 0 1 0 16 0a8 8 0 1 0-16 0z' },
  { n: 'Werwölfe',            p: 'werwolf.html',           bg: '#17306B', fg: '#F4EDB8', d: 'M40 8a24 24 0 1 0 16 36a20 20 0 0 1-16-36z' }
];

// DOLLY: { p: Spiel, back: true wenn es vom Spiel zurück zur Startseite geht }, nur ein paar Sekunden gültig
var DOLLY = null;
try {
  const d = JSON.parse(sessionStorage.getItem('fx-dolly'));
  sessionStorage.removeItem('fx-dolly');
  const g = d && Date.now() - d.t < 8000 && SPIELE.find(s => s.p === d.p);
  if (g && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    DOLLY = { ...g, back: d.back };
    const st = document.createElement('style');
    st.id = 'fx-enter';
    st.textContent = `html { background:${g.bg} !important; } body { visibility:hidden; }`;
    document.head.append(st);
    setTimeout(() => st.remove(), 3000); // Sicherheitsnetz, falls fx.js nicht lädt
  }
} catch {}
