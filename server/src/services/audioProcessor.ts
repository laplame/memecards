import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const processedDir = process.env.PROCESSED_DIR || './processed';

export interface AudioInfo {
  duration: number;
  bitrate: number;
  format: string;
  sampleRate: number;
  channels: number;
}

export interface ProcessedAudio {
  originalPath: string;
  processedPath: string;
  info: AudioInfo;
  url: string;
}

/**
 * Obtiene información del archivo de audio
 */
export async function getAudioInfo(filePath: string): Promise<AudioInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Error al obtener información del audio: ${err.message}`));
        return;
      }

      const audioStream = metadata.streams?.find((s) => s.codec_type === 'audio');
      if (!audioStream) {
        reject(new Error('No se encontró stream de audio en el archivo'));
        return;
      }

      resolve({
        duration: metadata.format?.duration || 0,
        bitrate: parseInt(metadata.format?.bit_rate || '0', 10),
        format: metadata.format?.format_name || 'unknown',
        sampleRate: audioStream.sample_rate || 0,
        channels: audioStream.channels || 0,
      });
    });
  });
}

/**
 * Procesa el audio (convierte a formato estándar, normaliza, etc.)
 */
export async function processAudio(
  inputPath: string,
  options?: {
    format?: 'mp3' | 'wav' | 'ogg';
    bitrate?: number;
    sampleRate?: number;
  }
): Promise<ProcessedAudio> {
  const format = options?.format || 'mp3';
  const bitrate = options?.bitrate || 192;
  const sampleRate = options?.sampleRate || 44100;
  const outputFilename = `${uuidv4()}.${format}`;
  const outputPath = path.join(processedDir, outputFilename);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .audioBitrate(bitrate)
      .audioFrequency(sampleRate)
      .audioChannels(2)
      .audioCodec('libmp3lame')
      .format(format);

    // Normalizar audio
    command = command.audioFilters('volume=0.8');

    command
      .on('start', (commandLine) => {
        console.log('FFmpeg iniciado:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Procesando: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', async () => {
        try {
          const info = await getAudioInfo(outputPath);
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          const url = `${baseUrl}/api/audio/stream/${outputFilename}`;

          resolve({
            originalPath: inputPath,
            processedPath: outputPath,
            info,
            url,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        reject(new Error(`Error al procesar audio: ${err.message}`));
      })
      .save(outputPath);
  });
}

/**
 * Convierte audio a diferentes formatos
 */
export async function convertAudio(
  inputPath: string,
  outputFormat: 'mp3' | 'wav' | 'ogg'
): Promise<string> {
  const outputFilename = `${uuidv4()}.${outputFormat}`;
  const outputPath = path.join(processedDir, outputFilename);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .format(outputFormat)
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`Error al convertir audio: ${err.message}`));
      })
      .save(outputPath);
  });
}
