import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";

const PDF_TYPES = new Set(["application/pdf"]);
const WORD_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

function getFileExtension(name = "") {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) : "";
}

function isPdf(file) {
  return PDF_TYPES.has(file.type) || getFileExtension(file.name) === "pdf";
}

function isWord(file) {
  const ext = getFileExtension(file.name);
  return WORD_TYPES.has(file.type) || ext === "docx" || ext === "doc";
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Please upload a file using the 'file' form field." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return Response.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (isPdf(file)) {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text || "";
    } else if (isWord(file)) {
      const parsed = await mammoth.extractRawText({ buffer });
      extractedText = parsed.value || "";
    } else {
      return Response.json(
        {
          error:
            "Unsupported file type. Please upload a PDF or Word document (.doc/.docx).",
        },
        { status: 415 }
      );
    }

    return Response.json({ text: extractedText.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed.";
    return Response.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}