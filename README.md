# Bank Exam Mock Test App (Local)

A local mock-test application for bank exam practice. It supports:

- Creating custom questions manually
- Uploading a JSON question bank
- Downloading your current set as a JSON file
- Re-uploading that JSON file later for your next test
- Running a timed test with score summary
- Saving data locally in browser storage

## Run locally on Windows

Because this is a static app, you can run it directly:

1. Open `index.html` in Microsoft Edge/Chrome.
2. Or serve it with a local server:

```powershell
cd <project-folder>
python -m http.server 8080
```

Then open: `http://localhost:8080`

## JSON workflow (download + upload for next test)

1. Add your questions in the app.
2. Click **Download Current Set (JSON)**.
3. A file named `bank-exam-questions.json` is saved.
4. Next time, open the app and upload that file.
5. Choose import mode:
   - **Append**: adds uploaded questions to existing ones.
   - **Replace**: replaces existing questions with uploaded file.

You can also start from the included `sample-questions.json` file.

## Supported JSON formats

The app accepts either:

### Format A (array)

```json
[
  {
    "question": "The RBI headquarters is located in?",
    "options": ["Delhi", "Mumbai", "Pune", "Kolkata"],
    "answerIndex": 1
  }
]
```

### Format B (exported object)

```json
{
  "version": 1,
  "questions": [
    {
      "question": "The RBI headquarters is located in?",
      "options": ["Delhi", "Mumbai", "Pune", "Kolkata"],
      "answerIndex": 1
    }
  ]
}
```

## Microsoft Store launch direction

For Microsoft Store, package this UI using one of these:

1. **PWA in Edge + PWABuilder** (fastest)
2. **WinUI 3 / WebView2 wrapper** for this web app
3. **Electron + MSIX packaging**

This repository is a prototype UI and can be used as the front-end for those packaging workflows.
