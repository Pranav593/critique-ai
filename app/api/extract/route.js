import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

export async function POST(req) {
  try {
    // Get the form data from the request
    let formData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid request. Please send a file using form data." },
        { status: 400 }
      );
    }

    // Get the file from form data
    const file = formData.get("file");

    // Check if file exists
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded. Please select a PDF or Word document." },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty. Please upload a valid document." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // Extract text based on file type
    if (isPdf(file)) {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || "";
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { error: "Failed to read PDF file. The file may be corrupted or password-protected." },
          { status: 400 }
        );
      }
    } else if (isWord(file)) {
      try {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value || "";
      } catch (wordError) {
        console.error("Word parsing error:", wordError);
        return NextResponse.json(
          { error: "Failed to read Word document. The file may be corrupted." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)." },
        { status: 415 }
      );
    }

    // Check if any text was extracted
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the file. The document may be empty or contain only images." },
        { status: 400 }
      );
    }

    // Return the extracted text
    return NextResponse.json(
      {
        text: extractedText.trim(),
        fileName: file.name,
        fileSize: file.size,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in /api/extract:", error);
    const message = error instanceof Error ? error.message : "Extraction failed.";
    return NextResponse.json(
      { error: `An unexpected error occurred: ${message}` },
      { status: 500 }
    );
  }
}