import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

import { PDFParse } from 'pdf-parse'

import { processAndSaveJob } from './processAndSaveJob.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// TODO: FilePath needs to be passed from the frontend
export const extractPDF = async (fileName) => {
  const ext = path.extname(fileName)
  const name = path.basename(fileName, ext)
  const safeTitle = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

  const filePath = path.join(process.cwd(), '../../public/uploaded-job-descriptions', fileName)
  const dataBuffer = await fs.promises.readFile(filePath)

  const hash = crypto.createHash('sha256').update(dataBuffer).digest('hex')
  const jsonDir = path.join(process.cwd(), '../../', 'public/JSON-job-descriptions')

  const jsonPath = path.join(jsonDir, `${hash}-${safeTitle}.json`)

  // 🚨 Duplicate detected
  if (fs.existsSync(jsonPath)) {
    console.log('Duplicate PDF detected. Deleting uploaded file.')

    await fs.promises.unlink(filePath) // delete duplicate PDF
    return { duplicate: true }
  }

  // pass the buffer directly
  const parser = new PDFParse({ data: dataBuffer })
  // const data = await pdf(dataBuffer)

  // const rawText = data.text
  const result = await parser.getText()

  const rawText = result.text

  return processAndSaveJob(filePath, fileName, rawText, hash)
}
