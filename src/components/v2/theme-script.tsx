/**
 * Script sincrono che legge il tema salvato in sessionStorage e lo applica
 * a <html data-theme="..."> PRIMA del paint React. Previene flash di colore
 * al primo render.
 *
 * Default = dark. sessionStorage = il tema persiste solo dentro la sessione
 * del browser corrente (tab chiusa / browser chiuso → reset a dark).
 */
export function ThemeScript() {
  const code = `
(function() {
  try {
    var t = sessionStorage.getItem('ild-theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
