import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { PdfRenderRequest } from "@kahf/domain";

export class RuntimeDocumentsService {
  async renderPdfFile(request: PdfRenderRequest, fileName?: string) {
    const safeFileName = fileName ?? `${slugify(request.title)}.pdf`;
    const absolutePath = resolveExportsPath(safeFileName);
    const pdfBuffer = buildSimplePdfBuffer(request);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, pdfBuffer);

    return {
      fileName: safeFileName,
      absolutePath,
      downloadPath: `/exports/${safeFileName}`,
    };
  }
}

function resolveExportsPath(fileName: string) {
  if (existsSync(resolve(process.cwd(), "src/main.ts")) || existsSync(resolve(process.cwd(), "dist/main.js"))) {
    return resolve(process.cwd(), "data/exports", fileName);
  }

  return resolve(process.cwd(), "apps/api/data/exports", fileName);
}

function buildSimplePdfBuffer(request: PdfRenderRequest) {
  const lines = [request.title, "", ...request.sections.flatMap((section) => [section.heading, ...section.body, ""])];
  const pageChunks = chunkLines(lines, 32);

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");

  const pageIds = pageChunks.map((_, index) => 3 + index * 2);
  const contentIds = pageChunks.map((_, index) => 4 + index * 2);

  objects.push(
    `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj`,
  );

  pageChunks.forEach((pageLines, index) => {
    const pageId = pageIds[index];
    const contentId = contentIds[index];
    objects.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${
        pageIds.length * 2 + 3
      } 0 R >> >> /Contents ${contentId} 0 R >> endobj`,
    );

    const stream = buildPageStream(pageLines);
    objects.push(
      `${contentId} 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream endobj`,
    );
  });

  const fontId = pageIds.length * 2 + 3;
  objects.push(`${fontId} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function buildPageStream(lines: string[]) {
  const commands = ["BT", "/F1 18 Tf", "72 760 Td"];
  lines.forEach((line, index) => {
    if (index === 0) {
      commands.push(`(${escapePdfText(line)}) Tj`);
      commands.push("/F1 12 Tf");
      return;
    }

    commands.push("0 -20 Td");
    commands.push(`(${escapePdfText(line)}) Tj`);
  });
  commands.push("ET");
  return commands.join("\n");
}

function chunkLines(lines: string[], size: number) {
  const chunks: string[][] = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks.length > 0 ? chunks : [["No content"]];
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
