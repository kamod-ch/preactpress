---
name: no-commit
description: Verbietet Git-Commits durch den Cursor-Agenten in diesem Repository. Use when staging changes, writing commit messages, running git commit, git add for commit, amending commits, pushing commits, or when commit workflows are considered.
---

# Keine Commits durch Cursor

Cursor darf in diesem Repository **keine Git-Commits** erstellen.

## Regeln

- **Niemals** `git commit`, `git commit --amend` oder vergleichbare Commit-Befehle ausführen.
- **Niemals** Dateien gezielt für einen Commit stagen (`git add`), um danach zu committen.
- Code ändern ist erlaubt; committen überlässt der Nutzer.

## Stattdessen

- Änderungen kurz zusammenfassen
- Optional eine Commit-Message als Vorschlag formulieren
- Den Nutzer bitten, selbst zu committen
