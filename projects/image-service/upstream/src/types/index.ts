export type AspectRatio = '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '3:4' | 'custom';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif';

export interface CropOptions {
  input: string;
  output?: string;
  aspectRatio: AspectRatio;
  width?: number;
  height?: number;
  gravity?: 'north' | 'south' | 'east' | 'west' | 'center' | 'entropy' | 'attention';
}

export interface WatermarkOptions {
  input: string;
  watermark: string;
  output?: string;
  opacity?: number;
  position?: WatermarkPosition;
  scale?: number;
  margin?: number;
}

export interface ResizeOptions {
  input: string;
  output?: string;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
}

export interface RotateOptions {
  input: string;
  output?: string;
  angle: number;
  background?: string;
}

export interface ConvertOptions {
  input: string;
  output?: string;
  format: OutputFormat;
  quality?: number;
}

export interface CompressOptions {
  input: string;
  output?: string;
  quality?: number;
  format?: OutputFormat;
}

export interface FlipOptions {
  input: string;
  output?: string;
  direction: 'horizontal' | 'vertical' | 'both';
}

export interface GrayscaleOptions {
  input: string;
  output?: string;
}

export interface BlurOptions {
  input: string;
  output?: string;
  sigma: number;
}

export interface SharpenOptions {
  input: string;
  output?: string;
  sigma?: number;
  flat?: number;
  jagged?: number;
}

export interface TintOptions {
  input: string;
  output?: string;
  color: string;
}

export interface BorderOptions {
  input: string;
  output?: string;
  width: number;
  color: string;
}

export interface ThumbnailOptions {
  input: string;
  output?: string;
  size: number;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  space?: string;
  channels?: number;
  depth?: string;
  density?: number;
  hasAlpha?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  metadata?: ImageMetadata;
  message?: string;
  error?: string;
}
