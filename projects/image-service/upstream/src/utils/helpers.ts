import * as path from 'path';
import * as fs from 'fs';
import { AspectRatio, WatermarkPosition } from '../types';
import { logger } from './logger';

const OUTPUT_DIR = path.resolve(process.cwd(), 'output');

export function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

export function generateOutputPath(
  inputPath: string,
  suffix: string,
  customOutput?: string,
  newExtension?: string
): string {
  if (customOutput) {
    const outputDir = path.dirname(customOutput);
    if (outputDir !== '.' && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const resolvedOutput = path.resolve(customOutput);
    logger.info(`Output selected: ${customOutput}`);
    return resolvedOutput;
  }

  ensureOutputDir();
  const ext = newExtension || path.extname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  const timestamp = Date.now();
  const outputPath = path.join(OUTPUT_DIR, `${basename}_${suffix}_${timestamp}${ext}`);
  logger.info(`Generated output: ${path.relative(process.cwd(), outputPath)}`);
  return outputPath;
}

export function validateFilePath(filePath: string): void {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    logger.error(`File validation failed: ${filePath}`);
    throw new Error(`File not found: ${filePath}`);
  }
  const stats = fs.statSync(resolvedPath);
  logger.debug(`File validated: ${filePath} (${formatBytes(stats.size)})`);
}

export function isValidImageFormat(filePath: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.gif', '.svg'];
  const ext = path.extname(filePath).toLowerCase();
  return validExtensions.includes(ext);
}

export function getAspectRatioDimensions(ratio: AspectRatio): { widthRatio: number; heightRatio: number } {
  const ratios: Record<AspectRatio, { widthRatio: number; heightRatio: number }> = {
    '1:1': { widthRatio: 1, heightRatio: 1 },
    '4:3': { widthRatio: 4, heightRatio: 3 },
    '16:9': { widthRatio: 16, heightRatio: 9 },
    '3:2': { widthRatio: 3, heightRatio: 2 },
    '2:3': { widthRatio: 2, heightRatio: 3 },
    '9:16': { widthRatio: 9, heightRatio: 16 },
    '3:4': { widthRatio: 3, heightRatio: 4 },
    'custom': { widthRatio: 1, heightRatio: 1 },
  };

  return ratios[ratio] || ratios['1:1'];
}

export function calculateCropDimensions(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AspectRatio
): { width: number; height: number; left: number; top: number } {
  const { widthRatio, heightRatio } = getAspectRatioDimensions(aspectRatio);
  const targetRatio = widthRatio / heightRatio;
  const imageRatio = imageWidth / imageHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (imageRatio > targetRatio) {
    cropHeight = imageHeight;
    cropWidth = Math.round(imageHeight * targetRatio);
  } else {
    cropWidth = imageWidth;
    cropHeight = Math.round(imageWidth / targetRatio);
  }

  const left = Math.round((imageWidth - cropWidth) / 2);
  const top = Math.round((imageHeight - cropHeight) / 2);

  return { width: cropWidth, height: cropHeight, left, top };
}

export function getWatermarkGravity(position: WatermarkPosition): string {
  const gravityMap: Record<WatermarkPosition, string> = {
    'top-left': 'northwest',
    'top-center': 'north',
    'top-right': 'northeast',
    'center-left': 'west',
    'center': 'center',
    'center-right': 'east',
    'bottom-left': 'southwest',
    'bottom-center': 'south',
    'bottom-right': 'southeast',
  };

  return gravityMap[position] || 'southeast';
}

export function parseColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  const namedColors: Record<string, { r: number; g: number; b: number }> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    transparent: { r: 0, g: 0, b: 0 },
  };

  return namedColors[color.toLowerCase()] || namedColors.white;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDimensions(width?: number, height?: number): string {
  if (width && height) {
    return `${width}x${height}`;
  }
  return 'Unknown';
}
