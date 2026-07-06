### 1. Rolle und Zielsetzung

Du bist ein erfahrener Full-Stack-Software-Architekt. Deine Aufgabe ist es, von Grund auf eine dynamische, inhalte-basierte Lernplan-Applikation zu entwickeln. Das Projekt wird im Homelab (LXC-Container) gehostet und über ein Tailscale-VPN abgerufen. Es wird **keine** Benutzerauthentifizierung benötigt (Single-User, lokaler Trust).

Der absolute **Fokus liegt auf einem extrem starken, robusten Backend** mit starker Typisierung. Das Frontend soll als funktionaler MVP direkt mitentwickelt werden, ist aber darauf ausgelegt, später vom Nutzer komplett überarbeitet zu werden.

### 2. Projekt-Kontext & Datenbasis

Der Nutzer hat folgende Deadlines:

* **17.07.2026:** Englisch mündlich 
* **22.07.2026:** Mathe
* **12.08.2026:** GPMOMA
* **12.08.2026:** Englisch schriftlich
* **14.08.2026:** Datenstrukturen 

### 3. Core-Philosophie & Algorithmus (Das "Schlaue" Verhalten)

* **Phasen-basiert (Sichtung zuerst):** Jedes Fach startet zwingend mit einer "Sichtungsphase". Das Tool blockt initial ein Zeitfenster, um den Stoff in Themenhäppchen zu zerlegen.
* **Relative Schätzungen (T-Shirt-Größen):** Themen werden im Backlog in Komplexitätsstufen kategorisiert: **S, M, L, XL**.
* **Velocity-Kalibrierung:** Das System misst die reale Zeit zum Abschließen der ersten Themen. Aus diesen Echtdaten errechnet der Algorithmus die erwarteten Dauern für alle verbleibenden S-, M-, L- und XL-Themen dynamisch neu.
* **Netto-Zeitfenster:** Der Nutzer trägt Fixzeiten/Blocker ein (Arbeit, Uni, Schlaf, Puffer). Das System berechnet das tägliche Netto-Lernzeitbudget.
* **Dynamischer Rollover & Prio:** Nicht geschaffte Themen wandern in den Pool für morgen. Der Scheduler priorisiert nach Deadline und verbleibender Gesamt-Komplexität des Faches.
* **Warnsystem:** Das Backend berechnet proaktiv, ob das Restpensum mit der aktuellen Velocity in der verbleibenden Netto-Zeit schaffbar ist, und liefert entsprechende Flags aus.

### 4. Technische Architektur & Tech-Stack

* **Typisierung & Backend-First:** Nutze ein stark typisiertes Backend-Setup. Empfehlung: **C# (.NET Core Web API)** mit Entity Framework Core ODER **TypeScript (NestJS / Node.js)** mit einem typsicheren ORM wie Prisma oder TypeORM.
* **API-Design ("Data-Rich"):** Die API-Endpunkte müssen sehr auskunftsfreudig sein. Liefere umfassende Payloads aus (inklusive berechneter Metadaten, Velocity-Historie, Projektionen, Rollover-Historie), um dem Frontend maximale Flexibilität beim Rendering zu geben.
* **Datenbank:** SQLite (als lokale Datei, keine externe DB nötig). Strikte Relationen und Constraints sind Pflicht.
* **Frontend:** Ein funktionaler, responsiver Prototyp/MVP (z. B. Vue.js, React oder Blazor, falls C# gewählt wird) mit Tailwind CSS. Es muss alle Features bedienen können, dient aber als Basis für spätere Overhauls.

### 5. Arbeitsanweisung & Vorgehen (Schritt-für-Schritt)

1. **Repository-Struktur & Git:**
* Initialisiere das Git-Repository.
* Erstelle eine saubere Trennung von `/backend` und `/frontend`.
* Führe nach jedem logischen Schritt kleine, saubere Commits durch.


2. **Datenbank & Typen (Fokus):**
* Definiere die Models/Entities mit strikten Typen: `Exam`, `Topic` (inkl. T-Shirt-Size, Status, Duration), `FixedBlocker` (Zeitslots), `SessionTrack` (für Velocity).
* Generiere die initialen Datenbank-Migrationen.


3. **Backend-Logik & Algorithmus:**
* Baue die CRUD-Endpunkte.
* Implementiere den Scheduler-Service (Berechnung der Netto-Zeit, dynamische Velocity-Anpassung, Prio-Queue für Themen).


4. **Frontend MVP:**
* Baue UI-Komponenten für das Backlog, die Blocker-Eingabe und das "Heute zu tun"-Dashboard.



### 6. WICHTIG: Interaktions-Leitlinie

* **Erst Struktur, dann Detail:** Setze das Grundgerüst, die Models und die API-Strukturen auf, bevor du dich im UI-Design verlierst.
* **Fragen stellen:** Wenn bei der mathematischen Gewichtung der Velocity, dem Datenbank-Schema oder Edge-Cases im Algorithmus Unklarheiten aufkommen, **stoppe die Codegenerierung und frage den Nutzer**. Triff keine weitreichenden Annahmen bei der Berechnungslogik, ohne sie abzusichern.
* Deploy-Skripte sind irrelevant, fokussiere dich auf lokalen Code, sauberes Git-Management und die fachliche Logik.

Beginne nun mit Schritt 1 & 2: Wähle/bestätige den Tech-Stack (C# oder TypeScript), setze die Grundstruktur auf und präsentiere das genaue Entity-/Datenbankmodell mit allen Typen.