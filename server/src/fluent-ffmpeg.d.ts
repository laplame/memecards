/**
 * Declaración local para fluent-ffmpeg (evita depender de @types/fluent-ffmpeg en deploy).
 */
declare module 'fluent-ffmpeg' {
  interface FfprobeStream {
    codec_type?: string;
    sample_rate?: number;
    channels?: number;
    [key: string]: unknown;
  }
  interface FfprobeFormat {
    duration?: number;
    bit_rate?: number | string;
    format_name?: string;
    [key: string]: unknown;
  }
  interface FfprobeData {
    streams?: FfprobeStream[];
    format?: FfprobeFormat;
  }
  interface FfmpegCommand {
    audioBitrate(rate: number): FfmpegCommand;
    audioFrequency(rate: number): FfmpegCommand;
    audioChannels(n: number): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    format(format: string): FfmpegCommand;
    audioFilters(filters: string): FfmpegCommand;
    on(event: 'start', listener: (commandLine: string) => void): FfmpegCommand;
    on(event: 'progress', listener: (progress: { percent?: number }) => void): FfmpegCommand;
    on(event: 'end', listener: () => void): FfmpegCommand;
    on(event: 'error', listener: (err: Error) => void): FfmpegCommand;
    save(path: string): FfmpegCommand;
  }
  interface FfmpegStatic {
    (input?: string): FfmpegCommand;
    ffprobe(
      filePath: string,
      callback: (err: Error | null, metadata: FfprobeData) => void
    ): void;
  }
  const ffmpeg: FfmpegStatic;
  export default ffmpeg;
}
