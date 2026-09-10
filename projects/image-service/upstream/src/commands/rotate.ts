import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

export function createRotateCommand(): Command {
  const rotate = new Command('rotate')
    .description('Rotate an image by a specified angle')
    .argument('<input>', 'Input image path')
    .requiredOption('-a, --angle <degrees>', 'Rotation angle in degrees', (v) => parseFloat(v))
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option('-b, --background <color>', 'Background color for empty areas (hex or name)', 'transparent')
    .action(async (input: string, options) => {
      const spinner = ora('Rotating image...').start();

      try {
        const result = await imageProcessor.rotate({
          input,
          output: options.output,
          angle: options.angle,
          background: options.background,
        });

        if (result.success) {
          spinner.succeed('Image rotated successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Angle': `${options.angle}°`,
            'Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Rotation failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Rotation failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return rotate;
}
