# BodyMotionTetris

## Projektbeschreibung

Body-Motion Tetris ist ein innovatives Spiel, das klassische Tetris-Mechaniken mit aktiver Bewegung kombiniert. Ziel ist es, ein körpergesteuertes Spielerlebnis zu schaffen, das Bewegungsmangel entgegenwirkt und die Gesundheit fördert. Spieler verwenden ihren Körper, um die Tetris-Steine zu steuern, anstatt herkömmliche Eingabegeräte zu benutzen. Das Projekt richtet sich besonders an Personen mit einem überwiegend sitzenden Lebensstil und Senioren, die ihre Mobilität verbessern möchten.

## Features

- **Körpergesteuerte Steuerung**: Spieler verwenden Bewegungen, um Steine zu drehen und zu platzieren.
- **Intuitive Bewegungserkennung**: Eine Kamera erfasst die Körperbewegungen und übersetzt sie in Spielsteuerungen.
- **Webbasiert**: Das Spiel ist über eine Website zugänglich.

## Zielgruppe

- Senioren, die ihre Beweglichkeit fördern möchten.
- Personen mit einem überwiegend sitzenden Lebensstil.
- Personen, die spielerisch ihre Gesundheit verbessern möchten.

## Technologie-Stack

- **HTML/CSS/JavaScript**: Für die Benutzeroberfläche und Spiellogik.
- **APIs zur Körpererkennung**: Erfassen und Interpretieren von Körperkoordinaten mithilfe der Kamera.

## Funktionsweise des Spiels

Platzieren der Blöcke: Den rechten Arm nach rechts bewegen um den Block horizontal nach rechts zu verschieben
Den linken Arm nach links bewegen um den Block horizontal nach links zu verschieben

Drehen der Blöcke: Kopf nach links zur Schulter neigen

Droppen der Blöcke: Klatschen, bzw. das Berühren beider Hände

## Projektstruktur

BodyMotionTetris-main/
├── index.html # Startseite der Website
├── play.html # Hauptspielbereich
├── cam.html # Kameraeinstellungen
├── instructions.html # Spielanleitung
├── about.html # Hintergrundgeschichte zu Tetris
├── assets/ # Bilder/Videos
├── play.js # Spiellogik
├── cam.js # Kamera- und Bewegungssteuerung
├── style.css # Startseite der Website, Stile

## Nutzung

1. Website aufrufen und Kamerazugriff erlauben.
2. Bewegungen ausprobieren und die Anleitung auf der Seite "instructions.html" lesen
3. Das Spiel starten und Tetris mit Körperbewegungen spielen!

## Entwicklungsstatus

Das Projekt befindet sich in der Entwicklung. Geplante Features:

- Weitere Bewegungsmuster zur Steuerung
- Verschiedene Spielmodi, die den Schwierigkeitsgrad oder Bewegungsanforderungen anpassen
