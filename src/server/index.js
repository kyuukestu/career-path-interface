import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { uploadPDF } from './handlers/uploadPDF.js'
import { extractPDF } from './handlers/extractPDF.js'

if (!fs.existsSync('.../../public/uploaded-job-descriptions')) {
  fs.mkdirSync('../../public/uploaded-job-descriptions', { recursive: true })
}

const app = express()

// Enable CORS for development (adjust origin for production)
app.use(
  cors({
    origin: 'http://localhost:5173', // Adjust to your Vue dev server port
    credentials: true,
  }),
)

// Parse JSON bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Upload endpoint
app.post('/api/upload', uploadPDF().array('demo[]', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select at least one file to upload',
      })
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/job-descriptions/${file.filename}`, // Relative path ${file.filename}`, // Public URL path
      uploadedAt: new Date().toISOString(),
    }))

    console.log(`Successfully uploaded ${uploadedFiles.length} file(s)`)

    for (let i = 0; i < uploadedFiles.length; i++) {
      // const ext = path.extname(uploadedFiles[i]) // '.pdf'
      // const name = path.basename(uploadedFiles[i], ext) // 'My PDF File!'

      // const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ext.toLowerCase()
      await extractPDF(uploadedFiles[i].filename)
      // console.log(uploadedFiles[i].path)
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      count: uploadedFiles.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: error.message,
      message: 'Failed to upload files',
    })
  }
})

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size cannot exceed 1MB',
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed',
      })
    }
    return res.status(400).json({
      error: error.code,
      message: error.message,
    })
  }

  if (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
    })
  }

  next()
})

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads/job-descriptions')))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    uploadPath: path.join(__dirname, 'public', 'uploads'),
  })
})

// List uploaded files endpoint (optional - for debugging)
app.get('/api/files', (req, res) => {
  const uploadPath = path.join(__dirname, 'public', 'uploads/job-descriptions')

  if (!fs.existsSync(uploadPath)) {
    return res.json({ files: [] })
  }

  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read upload directory' })
    }

    const fileList = files.map((filename) => {
      const filePath = path.join(uploadPath, filename)
      const stats = fs.statSync(filePath)

      return {
        filename,
        size: stats.size,
        uploadedAt: stats.mtime,
        url: `/uploads/${filename}`,
      }
    })

    res.json({ files: fileList, count: fileList.length })
  })
})

// Get specific file endpoint
app.get('/api/file/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'public', 'uploads', filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  res.sendFile(filePath)
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`
  ====================================
  🚀 Server is running on port ${PORT}
  ====================================

  API Endpoints:
  - POST   http://localhost:${PORT}/api/upload
  - GET    http://localhost:${PORT}/api/health
  - GET    http://localhost:${PORT}/api/files

  Upload Directory: ${path.join(__dirname, 'public', 'uploads/job-descriptions')}

  ====================================
  `)
})
