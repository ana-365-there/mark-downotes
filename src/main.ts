// main.ts
import "./style.css";
import { $ } from "./dom";
import { parseMarkdown } from "./parser";
import { saveNote, loadNote, clearNote } from "./notes";
import { downloadFile } from "./download";

const editor = $<HTMLTextAreaElement>("#editor");
const preview = $<HTMLDivElement>("#preview");
const saveBtn = $<HTMLButtonElement>("#save");
const downloadMdBtn = $<HTMLButtonElement>("#download-md");
const downloadHtmlBtn = $<HTMLButtonElement>("#download-html");
const clearBtn = $<HTMLButtonElement>("#clear");

function render(): void {
  preview.innerHTML = parseMarkdown(editor.value);
}

editor.value = loadNote();
render();

editor.addEventListener("input", render);

saveBtn.addEventListener("click", () => saveNote(editor.value));

downloadMdBtn.addEventListener("click", () => {
  downloadFile(editor.value, "note.md", "text/markdown");
});

downloadHtmlBtn.addEventListener("click", () => {
  const body = parseMarkdown(editor.value);
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Note</title>
</head>
<body>
${body}
</body>
</html>`;
  downloadFile(page, "note.html", "text/html");
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear the editor and the saved note?")) return;
  clearNote();
  editor.value = "";
  render();
});