@AGENTS.md

## Project summary sheet (keep it in sync)

The project summary lives in Google Sheets: "PolyVault – Project Summary"
https://docs.google.com/spreadsheets/d/1jjaUuaJ709RCFK1ZpiQKmSt7D8RU7CAakMujTXKjlfs/edit
(spreadsheetId `1jjaUuaJ709RCFK1ZpiQKmSt7D8RU7CAakMujTXKjlfs`, edit it with the Google Sheets connector; never create a new copy).

After any change to this project (new feature, revision, fix, language/content change, commit, push/deploy), update the sheet in the same session, in Bahasa Indonesia:
- **Changelog**: append a row (Tanggal as text `'YYYY-MM-DD`, Commit hash or `-`, Perubahan, Status: Ter-deploy / Di-commit, belum di-push / Belum di-commit). Update the Status of earlier rows when they get committed or deployed.
- **Features**: add or edit rows; Status is one of Selesai / Test mode / Perlu server / Coming soon.
- **Languages**: keep counts in sync with `src/lib/seed` (column F is a formula, don't overwrite it).
- **Folders & Files**: add new top-level folders or key files.
- **To-do & Review**: add open items; set Status to Selesai when done.
- **Overview**: update the text rows (Status deploy, Terakhir diperbarui); the counts are formulas.
