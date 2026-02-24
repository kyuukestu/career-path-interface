import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Main function
export const processAndSaveJob = async (filePath, fileName, rawText, hash) => {
  rawText = rawText.replace(/Updated:.*$/gim, '')
  rawText = rawText.replace(/Reformatted:.*$/gim, '')
  const cleaned = removeRepeatedLines(cleanText(rawText))
  const structured = parseJob(cleaned)

  const id = Date.now()
  const ext = path.extname(fileName)
  const name = path.basename(fileName, ext)
  const safeTitle = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

  const departmentFolder = (structured.department || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()

  // Ensure JSON directory exists
  const jsonDir = path.join(
    process.cwd(),
    '../../',
    `public/JSON-job-descriptions/${departmentFolder}`,
  )

  await fs.promises.mkdir(jsonDir, { recursive: true })

  // Full path to JSON file
  const jsonPath = path.join(jsonDir, `${hash}-${safeTitle}.json`)

  // If JSON already exists → duplicate file
  // if (fs.existsSync(jsonPath)) {
  //   console.log('Duplicate file detected. Skipping save.')
  //   return null
  // }

  // Path to the PDF for public access
  const pdfPublicPath = path.join(
    `/uploaded-job-descriptions/${departmentFolder}`,
    path.basename(filePath),
  )

  const jobIndex = {
    id,
    title: `${hash}-${safeTitle}.json`,
    path: pdfPublicPath,
  }

  const jobIndexDir = path.join(process.cwd(), '../../', 'public/job-index')
  if (!fs.existsSync(jobIndexDir)) {
    fs.mkdirSync(jobIndexDir, { recursive: true })
  }

  const jobIndexPath = path.join(jobIndexDir, `${hash}-${safeTitle}.json`)

  await fs.promises.writeFile(jobIndexPath, JSON.stringify(jobIndex, null, 2))

  // Build the job data
  const jobData = {
    id: hash,
    ...structured,
    pdfPath: pdfPublicPath,
  }

  // Write JSON file
  await fs.promises.writeFile(jsonPath, JSON.stringify(jobData, null, 2))
  console.log(`${jobData.title || safeTitle} saved to: ${jsonPath}`)

  return jobData
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
    'Education/Experience' || 'Education / Experience',
    'Abilities',
  )
  const performanceText = extractSection(text, 'Performance Criteria', "Employee's Name")

  return {
    title: extractSection(text, 'Position Title:' || 'Position', '\n'),
    department: extractSection(text, 'Department:', '\n'),
    purpose: extractSection(
      text,
      'Main Purpose of Job' || 'Main Purpose for Job',
      'Reporting Relationships',
    ),
    relationships: extractSection(text, 'Reporting Relationships', 'Supervisory Responsibilities'),
    supervisory: extractSection(
      text,
      'Supervisory Responsibilities',
      'KEY DUTIES AND RESPONSIBILITIES',
    ),
    knowledge: extractSection(
      text,
      'KNOWLEDGE AND SKILLS REQUIRED',
      'Education/Experience' || 'Education / Experience',
    ),
    key_responsibilities: extractBullets(responsibilitiesText),
    education: extractBullets(educationText),
    performance: extractBullets(performanceText),
  }
}

function extractSection(text, start, end) {
  const regex = new RegExp(`${start}([\\s\\S]*?)${end}`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

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
