# SRC CBC Report Generator

A web-based application built with **React**, **TypeScript**, and **Tailwind CSS** to parse, compare, and generate clinical Complete Blood Count (CBC) reports. The tool parses CSV/Excel outputs from hematology analyzers (like Sysmex/Mindray) and generates print-ready comparison reports.

---

## 🚀 Key Features

* **Automatic Sample Matching:** Fuzzy ID pairing strategy automatically groups baseline control samples (e.g. `P-102`) with corresponding comparison samples (e.g. `SRC11-P102` or `P102-3`).
* **Strict A4 Print Layouts:** Built-in PDF dimensions (`210mm x 297mm`) with page-break styles and an increased left margin (`25mm`) for filing and hole-punching.
* **Custom Layout Controls:** Real-time settings panel to upload custom logos, resize logo images, reposition dates, change font sizes, and edit column/badge names.
* **Batch PDF Generation:** One-click batch PDF generator to compile all matched reports into a single, high-resolution PDF document.
* **100% Client-Side:** Processes files locally in the browser using [SheetJS](https://sheetjs.com/) and [jsPDF](https://github.com/parallax/jsPDF). No data is sent to external servers.

---

## 🛠️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* npm, yarn, or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/PiyushSRC/SRC-CBC.git
cd SRC-CBC
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
To bundle the application into static files for production hosting (placed inside the `dist/` directory):
```bash
npm run build
```

---

## 📁 File Structure

* `App.tsx` — Main application logic, layout control panel, keyboard listeners, and PDF batch script.
* `components/` — Modular components including `FileUpload` (drag-and-drop parser) and `ReportPage` (A4 print layout).
* `utils/dataProcessing.ts` — Excel parsing logic, fuzzy ID matching strategies, and status change checking.
* `types.ts` — Common TypeScript interface definitions and standard CBC parameters.
