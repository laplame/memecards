import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const processedDir = process.env.PROCESSED_DIR || './processed';

// Crear directorios si no existen
[uploadDir, processedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtro de archivos - solo audio
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/aac',
    'audio/flac',
    'audio/x-m4a',
    'audio/opus',
    'audio/3gpp',
    'audio/3gp',
  ];

  // También verificar por extensión si el mimetype no está en la lista
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac', '.flac', '.opus', '.3gp', '.3gpp'];

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Solo se permiten archivos de audio. Tipo recibido: ${file.mimetype}, Extensión: ${fileExtension}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
});
