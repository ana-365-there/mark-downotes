# Markdown Notes

A browser-based Markdown note-taking app with a live preview. Type Markdown on the left and see the rendered HTML on the right, instantly.

**Live demo:** https://mark-downotes.vercel.app/

## Project chosen

**Project 2: Markdown Note-Taking App** (Web Development Projects Assessment 01)

## Features

**Core**
- Split-screen layout: a `<textarea>` editor on the left and a `<div>` preview on the right (stacked vertically on mobile)
- Live rendering on every change, driven by the `input` event
- Custom Markdown parser written with regular expressions, supporting headers (`#` to `######`), bold (`**text**`), and unordered, ordered and nested lists
- Styled output pane so headers and lists are visually distinct

**Stretch goals**
- **Save Note:** stores the raw Markdown in `localStorage` and restores it on page load
- **Download as `.md`** and **Download as `.html`** (the HTML export is a complete, standalone page)

**Extras**
- Clear Storage button (with a confirmation prompt)
- Collapsible Markdown tips section with a link to a full syntax guide
- Placeholder text in the empty preview pane
- Responsive layout for phones and desktops

## Tech stack

- [Vite](https://vite.dev/) (vanilla TypeScript template)
- TypeScript
- Plain DOM APIs (no UI framework)
- `localStorage` for persistence
- CSS Grid and custom properties for layout and theming

## Project structure

```
src/
├── main.ts       # finds elements, wires up event listeners
├── parser.ts     # parseMarkdown(): Markdown string -> HTML string
├── notes.ts      # saveNote / loadNote / clearNote (localStorage)
├── download.ts   # downloadFile() using Blob + temporary link
├── dom.ts        # typed querySelector helper
└── style.css
```

`parser.ts` and `notes.ts` don't depend on each other. `main.ts` connects them: raw text is what gets saved, and the parser only runs when rendering.

## Running locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

## Challenges and what I learned

This was my first project written by hand in TypeScript (previous projects were plain JS/JSX), so most of the learning was on the TypeScript side.

**TypeScript**
- **`null` from DOM queries.** `document.querySelector` returns `T | null`, so every element lookup needed a null check before `.value` or `.addEventListener` would type-check. Instead of repeating the check, I wrote a small generic helper, `$<T extends HTMLElement>(selector)`, which throws a clear error if the element is missing and otherwise returns a correctly typed element (for example `HTMLTextAreaElement`, so `.value` works).
- **Nullable `localStorage` values.** `localStorage.getItem` returns `string | null`, but `loadNote()` is typed to return a plain `string`. I used the nullish coalescing operator (`?? ""`) so the rest of the code never has to deal with `null`.
- **Modelling the list parser's state.** Nested lists needed a stack of open lists. I defined a `ListFrame` type with an `indent: number` and a `tag: "ul" | "ol"` (a string literal union), so TypeScript rejects any tag other than the two valid ones. I also learned when a non-null assertion (`stack.pop()!`) is justified: only after checking the stack isn't empty.
- **Typed module boundaries.** Splitting the code into `parser.ts`, `notes.ts`, `download.ts` and `dom.ts` meant giving every exported function explicit parameter and return types (for example `parseMarkdown(text: string): string`). This made `main.ts` easy to reason about, since it only connects functions with known signatures.
- **Strict mode and the build step.** Vite's dev server compiles TypeScript without fully type-checking it, but `npm run build` runs the type checker with `strict` enabled. Unused variables and implicit types that were fine in dev mode are errors in a production build, so I made `npm run build` part of my checks before deploying.
- **Declaration order.** A `const` element reference declared at the bottom of `main.ts` was used by `render()` before it was initialised. That threw an error which stopped the event listeners from attaching, so typing did nothing and there was no visible message on the page. The browser console showed it. Since then I declare all element references at the top of the file.

**Parsing and security**
- **Rendering user input safely.** Setting `innerHTML` with raw text is an XSS risk, so the parser escapes `&`, `<` and `>` *before* converting Markdown. Typed HTML shows as text instead of running.
- **Nested and ordered lists.** Lists can't be parsed one line at a time, because a nested list has to sit inside its parent `<li>`. The parser tracks indentation and closes lists as the indentation decreases.

**CSS (revision)**
- I used this project to revise CSS Grid, specificity and cascade order. The one detail I hadn't met before was that `1fr` columns can't shrink below their content width, so on mobile the preview was clipped until I switched to `minmax(0, 1fr)`.

## Limitations and future improvements

The parser covers the Markdown required by the assignment. Not yet supported:
- Italics, strikethrough, links and images
- Inline code and fenced code blocks
- Blockquotes and tables

A library such as `marked.js` would handle these, or I could extend the parser. Other ideas: multiple saved notes, auto-save while typing, and a dark/light theme toggle.

Notes are stored only in the browser's `localStorage`, so they are not synced across devices or browsers.
