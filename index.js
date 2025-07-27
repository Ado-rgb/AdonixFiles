import express from "express"
import multer from "multer"
import { nanoid } from "nanoid"
import cors from "cors"
import path from "path"
import fs from "fs"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())

// Sirve index.html desde la carpeta raíz
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'))
})

// Sirve archivos estáticos desde /tmp/uploads
app.use('/files', express.static('/tmp/uploads'))

// Multer guarda en /tmp/uploads (temporal en Vercel)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = '/tmp/uploads'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, nanoid(8) + path.extname(file.originalname))
  }
})

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } })

// Endpoint para subir archivos
app.post('/upload', upload.array('files', 20), (req, res) => {
  const urls = req.files.map(f => `${req.protocol}://${req.get('host')}/files/${f.filename}`)
  res.json({ success: true, files: urls })
})

app.listen(PORT, () => console.log(`Adonix Files corriendo en puerto ${PORT}`))
