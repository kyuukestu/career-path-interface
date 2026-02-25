import fs from 'fs'
import path from 'path'
import { json } from 'stream/consumers'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Main function
export const processAndSaveJob = async (filePath, fileName, rawText, hash) => {
  const publicDir = path.join(process.cwd(), '../../public')

  rawText = rawText.replace(/Updated:.*$/gim, '')
  rawText = rawText.replace(/Reformatted:.*$/gim, '')
  const cleaned = removeRepeatedLines(cleanText(rawText))
  const structured = parseJob(cleaned)

  const ext = path.extname(fileName)
  const name = path.basename(fileName, ext)
  const safeTitle = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

  // TODO: Sanitize file names for better readability; removes excessive underscores
  const departmentFolder = (structured.department || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const jsonDir = path.join(publicDir, `JSON-job-descriptions`, departmentFolder)
  // Ensure JSON directory exists
  await fs.promises.mkdir(jsonDir, { recursive: true })

  // NOTE: Public access paths
  const jsonPublicPath = `/JSON-job-descriptions/${departmentFolder}/${safeTitle}.json`
  // TODO: Organize this by department; need to update the upload location as well.
  const pdfPublicPath = `/uploaded-job-descriptions/${safeTitle}.pdf`

  // Return Job-Index for ExtractPDF function
  const jobData = {
    id: hash,
    ...structured,
    publicJSONPath: jsonPublicPath,
    publicPDFPath: pdfPublicPath,
  }

  // Full path to JSON file
  const jsonPath = path.join(jsonDir, `${safeTitle}.json`)

  // Write JSON file
  await fs.promises.writeFile(jsonPath, JSON.stringify(jobData, null, 2))
  console.log(`${jobData.title || safeTitle} saved to: ${jsonPath}`)

  return {
    id: hash,
    title: structured.title,
    department: structured.department,
    publicJSONPath: jsonPublicPath,
    publicPDFPath: pdfPublicPath,
  }
}

// -------------------
// Helper functions
// -------------------

function parseJob(text) {
  const responsibilitiesText = extractSection(
    text,
    'KEY DUTIES AND RESPONSIBILITIES',
    'KNOWLEDGE AND SKILLS REQUIRED',
  )
  const educationText = extractSection(
    text,
    ['Education/Experience', 'Education / Experience'],
    'Abilities',
  )
  const performanceText = extractSection(text, 'Performance Criteria', "Employee's Name")

  return {
    title: extractSection(text, ['Position Title:', 'Position'], '\n'),
    department: extractSection(text, 'Department:', '\n'),
    purpose: extractSection(
      text,
      ['Main Purpose of Job', 'Main Purpose for Job'],
      'Reporting Relationships',
    ),
    relationships: extractSection(text, 'Reporting Relationships', 'Supervisory Responsibilities'),
    supervisory: extractSection(
      text,
      'Supervisory Responsibilities',
      'KEY DUTIES AND RESPONSIBILITIES',
    ),
    knowledge: extractSection(text, 'KNOWLEDGE AND SKILLS REQUIRED', [
      'Education/Experience',
      'Education / Experience',
    ]),
    key_responsibilities: extractBullets(responsibilitiesText),
    education: extractBullets(educationText),
    performance: extractBullets(performanceText),
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSection(text, start, end) {
  const starts = Array.isArray(start) ? start : [start]
  const ends = Array.isArray(end) ? end : [end]

  for (const s of starts) {
    for (const e of ends) {
      const regex = new RegExp(`${escapeRegex(s)}([\\s\\S]*?)${escapeRegex(e)}`, 'i')

      const match = text.match(regex)
      if (match) return match[1].trim()
    }
  }

  return ''
}

// TODO Better splitting; new lines start with digit followed by '.'?
function extractBullets(sectionText) {
  return sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function cleanText(rawText) {
  let text = rawText

  // Remove "-- 1 of 3 --"
  text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')

  // Remove "Page 2 of 3"
  text = text.replace(/Page\s+\d+\s+of\s+\d+/gi, '')

  return text
}

function removeRepeatedLines(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const counts = {}
  lines.forEach((line) => {
    counts[line] = (counts[line] || 0) + 1
  })

  // Remove lines that appear more than twice
  const cleaned = lines.filter((line) => counts[line] < 3)

  return cleaned.join('\n')
}
