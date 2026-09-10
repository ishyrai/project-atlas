import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';
import { WatermarkPosition } from '../types';

const VALID_POSITIONS: WatermarkPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export function createWatermarkCommand(): Command {
  const watermark = new Command('watermark')
    .description('Add a watermark to an image with opacity control')
    .argument('<input>', 'Input image path')
    .requiredOption('-w, --watermark <path>', 'Watermark image/logo path')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option('-p, --opacity <number>', 'Watermark opacity (0.0 to 1.0)', (v) => parseFloat(v), 0.5)
    .option(
      '-pos, --position <position>',
      `Position (${VALID_POSITIONS.join(', ')})`,
      'bottom-right'
    )
    .option('-s, --scale <number>', 'Watermark scale relative to image (0.0 to 1.0)', (v) => parseFloat(v), 0.2)
    .option('-m, --margin <number>', 'Margin from edge in pixels', (v) => parseInt(v, 10), 20)
    .action(async (input: string, options) => {
      const spinner = ora('Adding watermark...').start();

      try {
        if (options.opacity < 0 || options.opacity > 1) {
          spinner.fail('Invalid opacity');
          logger.error('Opacity must be between 0.0 and 1.0');
          process.exit(1);
        }

        if (!VALID_POSITIONS.includes(options.position as WatermarkPosition)) {
          spinner.fail(`Invalid position: ${options.position}`);
          logger.error(`Valid positions: ${VALID_POSITIONS.join(', ')}`);
          process.exit(1);
        }

        const result = await imageProcessor.watermark({
          input,
          watermark: options.watermark,
          output: options.output,
          opacity: options.opacity,
          position: options.position as WatermarkPosition,
          scale: options.scale,
          margin: options.margin,
        });

        if (result.success) {
          spinner.succeed('Watermark added successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Position': options.position,
            'Opacity': `${options.opacity * 100}%`,
            'Scale': `${options.scale * 100}%`,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Watermark failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Watermark failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return watermark;
}
