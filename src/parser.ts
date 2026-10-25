type ListFrame = { indent: number; tag: "ul" | "ol" };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(line: string): string {
  return line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// close every open list that is indented deeper than toIndent
function closeLists(stack: ListFrame[], toIndent: number): string {
  let html = "";
  while (stack.length && stack[stack.length - 1].indent > toIndent) {
    html += `</li></${stack.pop()!.tag}>`;
  }
  return html;
}

export function parseMarkdown(text: string): string {
  const lines = escapeHtml(text).split("\n");
  const stack: ListFrame[] = [];
  let html = "";

  for (const line of lines) {
    const item = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);

    if (item) {
      const indent = item[1].replace(/\t/g, "  ").length;
      const tag = /\d/.test(item[2]) ? "ol" : "ul";

      html += closeLists(stack, indent);
      const top = stack[stack.length - 1];

      if (top && top.indent === indent) {
        if (top.tag === tag) {
          html += "</li>";                       // next item, same list
        } else {
          html += `</li></${top.tag}><${tag}>`;
          stack.pop();
          stack.push({ indent, tag });
        }
      } else {
        html += `<${tag}>`;
        stack.push({ indent, tag });
      }

      html += `<li>${inline(item[3])}`;
      continue;
    }

    html += closeLists(stack, -1);

    const header = line.match(/^(#{1,6})\s+(.*)$/);
    if (header) {
      const level = header[1].length;
      html += `<h${level}>${inline(header[2])}</h${level}>`;
    } else if (line.trim() !== "") {
      html += `<p>${inline(line)}</p>`;
    }
  }

  html += closeLists(stack, -1);
  return html;
}