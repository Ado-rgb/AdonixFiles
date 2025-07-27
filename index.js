import express from "express"
import multer from "multer"
import { nanoid } from "nanoid"
import cors from "cors"
import path from "path"
import fs from "fs"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use('/files', express.static('uploads'))
app.use(express.static('.')) // Sirve index.html desde raíz

// Configuración de multer (sin filtro de tipo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, nanoid(8) + ext)
  }
})

// Permitir archivos hasta 200MB
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } })

// Subida múltiple
app.post('/upload', upload.array('files', 20), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get('host')}/files/${f.filename}`)
  res.json({ success: true, files: urls })
})

app.listen(PORT, () => console.log(`Adonix Files corriendo en ${PORT}`))
