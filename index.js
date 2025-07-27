import express from "express"
import multer from "multer"
import { nanoid } from "nanoid"
import cors from "cors"
import path from "path"
import fs from "fs"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())

const UPLOAD_DIR = "/tmp/uploads"
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const id = nanoid(10)
    cb(null, id + ext)
  }
})

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } })

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" })
  const url = `${req.protocol}://${req.get("host")}/file/${req.file.filename}`
  res.json({ success: true, url })
})

app.get("/file/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).send("Archivo no encontrado")
  res.sendFile(filePath)
})

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./index.html"))
})

app.listen(PORT, () => console.log(`Adonix Files corriendo en puerto ${PORT}`))
