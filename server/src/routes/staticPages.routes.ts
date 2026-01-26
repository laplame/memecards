import { Router, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * GET /terminos
 * Sirve la página de términos y condiciones
 */
router.get('/terminos', async (req: Request, res: Response) => {
  try {
    const templatePath = path.join(__dirname, '../templates/terminos.html');
    const html = await fs.readFile(templatePath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error al servir página de términos:', error);
    res.status(500).send('<h1>Error al cargar la página</h1>');
  }
});

/**
 * GET /antibullying
 * Sirve la página de política anti-bullying
 */
router.get('/antibullying', async (req: Request, res: Response) => {
  try {
    const templatePath = path.join(__dirname, '../templates/antibullying.html');
    const html = await fs.readFile(templatePath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error al servir página de anti-bullying:', error);
    res.status(500).send('<h1>Error al cargar la página</h1>');
  }
});

export { router as staticPagesRouter };
