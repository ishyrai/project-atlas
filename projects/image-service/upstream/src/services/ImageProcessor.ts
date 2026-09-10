import sharp, { Sharp } from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import {
  CropOptions,
  WatermarkOptions,
  ResizeOptions,
  RotateOptions,
  ConvertOptions,
  CompressOptions,
  FlipOptions,
  GrayscaleOptions,
  BlurOptions,
  SharpenOptions,
  TintOptions,
  BorderOptions,
  ThumbnailOptions,
  ProcessingResult,
  ImageMetadata,
  WatermarkPosition,
} from '../types';
import {
  generateOutputPath,
  validateFilePath,
  calculateCropDimensions,
  parseColor,
} from '../utils/helpers';

export class ImageProcessor {
  private static instance: ImageProcessor;

  private constructor() {}

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  async getMetadata(inputPath: string): Promise<ImageMetadata> {
    validateFilePath(inputPath);
    const metadata = await sharp(inputPath).metadata();
    const stats = fs.statSync(inputPath);

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
    };
  }

  async crop(options: CropOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `crop_${options.aspectRatio.replace(':', 'x')}`, options.output);

      const metadata = await sharp(options.input).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Unable to read image dimensions');
      }

      const cropDimensions = calculateCropDimensions(
        metadata.width,
        metadata.height,
        options.aspectRatio
      );

      let pipeline = sharp(options.input);

      if (options.gravity) {
        pipeline = pipeline.resize({
          width: cropDimensions.width,
          height: cropDimensions.height,
          fit: 'cover',
          position: options.gravity,
        });
      } else {
        pipeline = pipeline.extract({
          left: cropDimensions.left,
          top: cropDimensions.top,
          width: cropDimensions.width,
          height: cropDimensions.height,
        });
      }

      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, { fit: 'fill' });
      }

      await pipeline.toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image cropped to ${options.aspectRatio} aspect ratio`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async watermark(options: WatermarkOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      validateFilePath(options.watermark);

      const outputPath = generateOutputPath(options.input, 'watermarked', options.output);
      const opacity = options.opacity ?? 0.5;
      const position = options.position ?? 'bottom-right';
      const scale = options.scale ?? 0.2;
      const margin = options.margin ?? 20;

      const [inputMeta, watermarkMeta] = await Promise.all([
        sharp(options.input).metadata(),
        sharp(options.watermark).metadata(),
      ]);

      if (!inputMeta.width || !inputMeta.height) {
        throw new Error('Unable to read input image dimensions');
      }

      if (!watermarkMeta.width || !watermarkMeta.height) {
        throw new Error('Unable to read watermark image dimensions');
      }

      const watermarkWidth = Math.round(inputMeta.width * scale);
      const watermarkHeight = Math.round(
        (watermarkWidth / watermarkMeta.width) * watermarkMeta.height
      );

      const watermarkBuffer = await sharp(options.watermark)
        .resize(watermarkWidth, watermarkHeight, { fit: 'inside' })
        .ensureAlpha()
        .composite([
          {
            input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in',
          },
        ])
        .toBuffer();

      const { left, top } = this.calculateWatermarkPosition(
        inputMeta.width,
        inputMeta.height,
        watermarkWidth,
        watermarkHeight,
        position,
        margin
      );

      await sharp(options.input)
        .composite([
          {
            input: watermarkBuffer,
            left,
            top,
            blend: 'over',
          },
        ])
        .toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Watermark added at ${position} with ${opacity * 100}% opacity`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private calculateWatermarkPosition(
    imageWidth: number,
    imageHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
    position: WatermarkPosition,
    margin: number
  ): { left: number; top: number } {
    const positions: Record<WatermarkPosition, { left: number; top: number }> = {
      'top-left': { left: margin, top: margin },
      'top-center': { left: Math.round((imageWidth - watermarkWidth) / 2), top: margin },
      'top-right': { left: imageWidth - watermarkWidth - margin, top: margin },
      'center-left': { left: margin, top: Math.round((imageHeight - watermarkHeight) / 2) },
      'center': {
        left: Math.round((imageWidth - watermarkWidth) / 2),
        top: Math.round((imageHeight - watermarkHeight) / 2),
      },
      'center-right': {
        left: imageWidth - watermarkWidth - margin,
        top: Math.round((imageHeight - watermarkHeight) / 2),
      },
      'bottom-left': { left: margin, top: imageHeight - watermarkHeight - margin },
      'bottom-center': {
        left: Math.round((imageWidth - watermarkWidth) / 2),
        top: imageHeight - watermarkHeight - margin,
      },
      'bottom-right': {
        left: imageWidth - watermarkWidth - margin,
        top: imageHeight - watermarkHeight - margin,
      },
    };

    return positions[position];
  }

  async resize(options: ResizeOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(
        options.input,
        `resized_${options.width || 'auto'}x${options.height || 'auto'}`,
        options.output
      );

      const fit = options.fit || 'inside';
      const background = options.background
        ? { ...parseColor(options.background), alpha: 1 }
        : undefined;

      await sharp(options.input)
        .resize(options.width, options.height, {
          fit,
          background,
          withoutEnlargement: true,
        })
        .toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image resized to ${options.width || 'auto'}x${options.height || 'auto'}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async rotate(options: RotateOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `rotated_${options.angle}`, options.output);

      const background = options.background
        ? { ...parseColor(options.background), alpha: 1 }
        : { r: 0, g: 0, b: 0, alpha: 0 };

      await sharp(options.input).rotate(options.angle, { background }).toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image rotated by ${options.angle} degrees`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async convert(options: ConvertOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(
        options.input,
        'converted',
        options.output,
        `.${options.format}`
      );

      const quality = options.quality || 85;
      let pipeline = sharp(options.input);

      switch (options.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality });
          break;
        case 'png':
          pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 10) });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality });
          break;
        case 'tiff':
          pipeline = pipeline.tiff({ quality });
          break;
        case 'gif':
          pipeline = pipeline.gif();
          break;
      }

      await pipeline.toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image converted to ${options.format.toUpperCase()}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async compress(options: CompressOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, 'compressed', options.output);

      const quality = options.quality || 70;
      const inputMeta = await sharp(options.input).metadata();
      const format = options.format || (inputMeta.format as any) || 'jpeg';

      let pipeline = sharp(options.input);

      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: 9,
            palette: true,
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, effort: 9 });
          break;
        default:
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      }

      await pipeline.toFile(outputPath);

      const inputStats = fs.statSync(options.input);
      const outputStats = fs.statSync(outputPath);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image compressed. Size reduced by ${savings}%`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async flip(options: FlipOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `flip_${options.direction}`, options.output);

      let pipeline = sharp(options.input);

      if (options.direction === 'horizontal' || options.direction === 'both') {
        pipeline = pipeline.flop();
      }
      if (options.direction === 'vertical' || options.direction === 'both') {
        pipeline = pipeline.flip();
      }

      await pipeline.toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image flipped ${options.direction}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async grayscale(options: GrayscaleOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, 'grayscale', options.output);

      await sharp(options.input).grayscale().toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: 'Image converted to grayscale',
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async blur(options: BlurOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `blur_${options.sigma}`, options.output);

      await sharp(options.input).blur(options.sigma).toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Blur applied with sigma ${options.sigma}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sharpen(options: SharpenOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, 'sharpened', options.output);

      await sharp(options.input)
        .sharpen({
          sigma: options.sigma || 1,
          m1: options.flat || 1.0,
          m2: options.jagged || 2.0,
        })
        .toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: 'Image sharpened',
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async tint(options: TintOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `tint_${options.color}`, options.output);

      const color = parseColor(options.color);

      await sharp(options.input).tint(color).toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Image tinted with color ${options.color}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async border(options: BorderOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `border_${options.width}px`, options.output);

      const color = parseColor(options.color);

      await sharp(options.input)
        .extend({
          top: options.width,
          bottom: options.width,
          left: options.width,
          right: options.width,
          background: { ...color, alpha: 1 },
        })
        .toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Border added: ${options.width}px ${options.color}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async thumbnail(options: ThumbnailOptions): Promise<ProcessingResult> {
    try {
      validateFilePath(options.input);
      const outputPath = generateOutputPath(options.input, `thumb_${options.size}`, options.output);

      await sharp(options.input)
        .resize(options.size, options.size, {
          fit: 'cover',
          position: 'attention',
        })
        .toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath: options.input,
        outputPath,
        metadata: outputMetadata,
        message: `Thumbnail created: ${options.size}x${options.size}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath: options.input,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async negative(inputPath: string, output?: string): Promise<ProcessingResult> {
    try {
      validateFilePath(inputPath);
      const outputPath = generateOutputPath(inputPath, 'negative', output);

      await sharp(inputPath).negate({ alpha: false }).toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath,
        outputPath,
        metadata: outputMetadata,
        message: 'Negative effect applied',
      };
    } catch (error) {
      return {
        success: false,
        inputPath,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async normalize(inputPath: string, output?: string): Promise<ProcessingResult> {
    try {
      validateFilePath(inputPath);
      const outputPath = generateOutputPath(inputPath, 'normalized', output);

      await sharp(inputPath).normalize().toFile(outputPath);

      const outputMetadata = await this.getMetadata(outputPath);

      return {
        success: true,
        inputPath,
        outputPath,
        metadata: outputMetadata,
        message: 'Image normalized (contrast stretched)',
      };
    } catch (error) {
      return {
        success: false,
        inputPath,
        outputPath: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const imageProcessor = ImageProcessor.getInstance();
