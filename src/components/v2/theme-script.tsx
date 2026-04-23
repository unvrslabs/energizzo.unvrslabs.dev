/**
 * Script sincrono che legge il tema salvato in localStorage e lo applica
 * a <html data-theme="..."> PRIMA del paint React. Previene flash
 * dark → light al primo caricamento della pagina.
 *
 * Da includere in <head> o inizio <body> del root layout.
 */
export function ThemeScript() {
  const code = `
(function() {
  try {
    var t = localStorage.getItem('ild-theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
