# Dan’s Garden Care — Website-Entwurf

Statische Website mit HTML, CSS, JavaScript und lokalen Bildern. Kein Build und keine Paketinstallation erforderlich.

## Dateien
- index.html: Inhalte und Seitenstruktur
- style.css: Gestaltung und responsive Ansichten
- main.js: mobiles Menü und Jahreszahl
- assets/: Logo und alle verwendeten Bilder

## GitHub-Upload
1. ZIP entpacken.
2. Repository öffnen und Add file > Upload files wählen.
3. index.html, style.css, main.js, README.md und den gesamten Ordner assets gemeinsam hochladen. Nicht die ZIP-Datei hochladen.
4. Mit Commit changes speichern.

## Vorschau und Bearbeitung
index.html im Browser öffnen. Alternativ im Projektordner mit Python: python3 -m http.server 8000 und http://localhost:8000 öffnen.
Für Claude Code den Repository-Ordner als Projekt verwenden. Die Dateien sind direkt editierbar.
Für klassisches Webhosting index.html, style.css, main.js und assets gemeinsam ins Webverzeichnis kopieren.

## Entwurfsstand
Farben: Grün #14452F, Terrakotta #B5401E, Creme #F5F2E9.
Das Hero-Bild zeigt Dan bei der Gartenarbeit. Die Projektvergleiche verwenden Daniels echte Arbeitsfotos. Logo und Bilder sind enthalten.
Kontaktlinks öffnen Telefon bzw. E-Mail. Zusätzlich gibt es ein Offerte-Formular mit Foto-Upload (siehe unten) – ein klassisches serverseitiges Kontaktformular gibt es weiterhin nicht, da die Seite statisch bleibt.

## Offerte-Formular einrichten
Der Button „Get a quote with photos“ (im Hero und im Kontaktbereich) öffnet ein Formular, in dem Interessenten Name, Kontakt, Standort, eine kurze Beschreibung und bis zu 3 Gartenfotos direkt aus dem Browser senden können. Fotos werden vor dem Versand im Browser verkleinert (lange Kante max. 1600 px, JPEG), damit auch auf mobilen Daten schnell gesendet wird.

Da die Seite keinen eigenen Server hat, läuft der Versand über den kostenlosen Formular-Dienst Web3Forms, der Datei-Uploads unterstützt:
1. Auf https://web3forms.com die E-Mail-Adresse eingeben, an die Anfragen gehen sollen (z. B. Daniels E-Mail). Kein Account/Login nötig.
2. Den per E-Mail zugestellten Access Key kopieren.
3. In `main.js` die Zeile `const QUOTE_ACCESS_KEY = 'PASTE_WEB3FORMS_ACCESS_KEY_HERE';` durch den echten Key ersetzen.

Bis der Key eingetragen ist, zeigt das Formular beim Absenden freundlich „This form isn't switched on yet – please call or email Dan directly.“ an, anstatt fehlzuschlagen. Wer lieber einen anderen Dienst nutzt (z. B. Formspree), passt `QUOTE_ENDPOINT` und die Feldnamen im `submit`-Handler in `main.js` entsprechend an.

Vor dem Go-Live prüfen: Empfangsadresse testen (Testanfrage mit Foto senden), Formularlimits des gewählten Dienstes (Anzahl Anfragen/Monat, Dateigrösse) und ob ein Hinweis zur Datenverwendung der Fotos rechtlich ergänzt werden muss.
Vor einer öffentlichen Veröffentlichung: Daniels Freigabe für Darstellung und Arbeitskleidung, Bildnutzung und Vorher-nachher-Zuordnung einholen; Leistungsangaben und Kontakt prüfen; rechtliche Angaben prüfen/ergänzen. Der Entwurf enthält absichtlich noindex,nofollow — erst für die finale öffentliche Seite entfernen.

## Hosting
Dieser Export ist unabhängig vom bestehenden privaten Sites-Entwurf. GitHub-Uploads aktualisieren dessen veröffentlichte Version nicht automatisch. Es wurden keine Zugangsdaten oder internen Hosting-Konfigurationen exportiert.

## Bilder weboptimiert integrieren
- Fotos als komprimiertes WebP exportieren; Originaldateien nicht direkt in die Seite einbinden.
- Für jedes Foto passende Breiten über `srcset` und zur CSS-Spaltenbreite passende `sizes` angeben. Nicht über die Originalauflösung hinaus vergrössern.
- Hero: 640 / 1024 / 1672 px, Qualitätsstufe 82. Das Motiv zeigt Daniel mit khakifarbenen Arbeitshosen und schwarzen Knieverstärkungen.
- Breite Arbeitsfotos: 480 / 800 / 1400 px; schmale Vergleichsfotos: 320 / 640 / maximal 960 px, Qualitätsstufe 78. Bei kleineren Originalen endet die Reihe früher.
- `width` und `height` müssen dem Seitenverhältnis der Datei entsprechen, damit der Browser Platz reserviert.
- Hero mit `fetchpriority="high"` und `loading="eager"`; Bilder unterhalb des Einstiegs mit `loading="lazy"`. Fotos verwenden `decoding="async"`.
- Nach Bildwechsel Desktop und Mobilansicht auf Bildausschnitt, Schärfe und Ladegrösse prüfen.
