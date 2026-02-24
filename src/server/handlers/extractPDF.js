import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { PDFParse } from 'pdf-parse'
import { processAndSaveJob } from './processAndSaveJob.js'

export const extractPDF = async (fileName) => {
  const publicDir = path.join(process.cwd(), '../../public')
  const uploadDir = path.join(publicDir, 'uploaded-job-descriptions')
  const indexPath = path.join(publicDir, 'job-index.json')

  const filePath = path.join(uploadDir, fileName)
  const dataBuffer = await fs.promises.readFile(filePath)

  // 🔐 Generate hash
  const hash = crypto.createHash('sha256').update(dataBuffer).digest('hex')

  // 📚 Load existing index
  let jobIndex = []
  if (fs.existsSync(indexPath)) {
    const content = await fs.promises.readFile(indexPath, 'utf-8')
    jobIndex = JSON.parse(content)
  }

  // 🚨 Duplicate check
  const duplicate = jobIndex.find((job) => job.id === hash)

  if (duplicate) {
    console.log('Duplicate PDF detected. Deleting uploaded file.')
    await fs.promises.unlink(filePath)
    return { duplicate: true }
  }

  // 📄 Parse PDF
  const parser = new PDFParse({ data: dataBuffer })
  const result = await parser.getText()
  const rawText = result.text

  // 🧠 Process and save job JSON
  const jobData = await processAndSaveJob(filePath, fileName, rawText, hash)

  // 📌 Append to index
  const newIndexEntry = {
    id: jobData.id,
    title: jobData.title,
    department: jobData.department,
    publicJSONPath: jobData.publicJSONPath,
    publicPDFPath: jobData.publicPDFPath,
  }

  jobIndex.push(newIndexEntry)

  // 💾 Save updated index
  await fs.promises.writeFile(indexPath, JSON.stringify(jobIndex, null, 2))

  return { success: true }
}
