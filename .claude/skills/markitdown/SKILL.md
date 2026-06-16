---
name: markitdown
description: >
  Convert any file to Markdown using Microsoft's MarkItDown tool before reading it with Claude.
  Use this skill ALWAYS when the user asks to convert, read, summarize, or extract content from
  any of these file types: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), images with text,
  audio files, YouTube URLs, HTML, CSV, JSON, XML, or ZIP archives.
  Also trigger when the user says "usa MarkItDown", "convierte con MarkItDown", "convert with MarkItDown",
  "lee este archivo", "extrae el texto de", "convierte este PDF/Excel/Word", or any variation
  indicating they want a file read efficiently before Claude processes it.
  PREFER this skill over direct file reading to save tokens and improve accuracy.
compatibility: Requires `markitdown[all]`. Install if missing: `pip install 'markitdown[all]' --break-system-packages`
---

# MarkItDown Skill

Converts files to Markdown so Claude reads them token-efficiently.

## Supported formats

PDF, Word (.docx), Excel (.xlsx/.xls), PowerPoint (.pptx), Images (OCR), Audio (transcription),
YouTube URLs, Web pages, HTML, CSV, JSON, XML, ZIP, EPUB.

## Workflow

**1. Verify install** (skip if already confirmed this session):

```bash
markitdown --version || pip install 'markitdown[all]' --break-system-packages
```

**2. Convert and read:**

```bash
# Uploaded file
markitdown /mnt/user-data/uploads/<filename>

# URL (YouTube or web)
markitdown "https://..."

# Long doc — preview first
markitdown /mnt/user-data/uploads/<filename> | head -300
```

**3. Use the output** to answer the user's question directly. No need to save to file unless asked.

## Error handling

- Wrong path → `ls /mnt/user-data/uploads/` to check filename
- docx fallback → `pandoc file.docx -t markdown --wrap=none`
- Audio needs Whisper → `pip install 'markitdown[audio-transcription]' --break-system-packages`
- YouTube fails → check video is public and has captions
