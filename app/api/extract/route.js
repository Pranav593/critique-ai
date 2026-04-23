import { NextResponse } from "next/server";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

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
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please select a PDF or Word document." },
        { status: 400 }
      );
    }

    // Check if it's actually a file
    if (typeof file === "string") {
      return NextResponse.json(
        { error: "Invalid file upload. Please try again." },
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

    // Check file type
    const fileType = file.type;
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";

    // Extract text based on file type
    if (fileType === "application/pdf") {
      // PDF extraction
      try {
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          { error: "Failed to read PDF file. The file may be corrupted or password-protected." },
          { status: 400 }
        );
      }
    } else {
      // Word document extraction (.doc or .docx)
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (wordError) {
        console.error("Word parsing error:", wordError);
        return NextResponse.json(
          { error: "Failed to read Word document. The file may be corrupted." },
          { status: 400 }
        );
      }
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
        fileType: fileType
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in /api/extract:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the file. Please try again." },
      { status: 500 }
    );
  }
}