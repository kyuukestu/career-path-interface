import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const uploadPDF = () => {
  // Configure storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(process.cwd(), '../../public/uploaded-job-descriptions')
      console.log('CWD: ', process.cwd())

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true })
        console.log(`Created upload directory: ${uploadPath}`)
      }

      cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      // Generate unique filename
      const ext = path.extname(file.originalname)
      const name = path.basename(file.originalname, ext)
      const safeName =
        name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .trim() + ext.toLowerCase()

      // const filename = file.originalname

      console.log(`Saving file: ${safeName}`)
      cb(null, safeName)
    },
  })

  // File filter to accept only images and PDFs
  const fileFilter = (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false)
    }
  }

  // Configure multer
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  })

  return upload
}
