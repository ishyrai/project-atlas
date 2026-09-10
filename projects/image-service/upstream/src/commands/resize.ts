import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

const VALID_FIT_OPTIONS = ['cover', 'contain', 'fill', 'inside', 'outside'] as const;

export function createResizeCommand(): Command {
  const resize = new Command('resize')
    .description('Resize an image to specified dimensions')
    .argument('<input>', 'Input image path')
    .option('-w, --width <number>', 'Target width in pixels', (v) => parseInt(v, 10))
    .option('-H, --height <number>', 'Target height in pixels', (v) => parseInt(v, 10))
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option(
      '-f, --fit <mode>',
      `Fit mode (${VALID_FIT_OPTIONS.join(', ')})`,
      'inside'
    )
    .option('-b, --background <color>', 'Background color for contain mode (hex or name)', 'white')
    .action(async (input: string, options) => {
      const spinner = ora('Resizing image...').start();

      try {
        if (!options.width && !options.height) {
          spinner.fail('Invalid dimensions');
          logger.error('Please specify at least width (-w) or height (-h)');
          process.exit(1);
        }

        if (!VALID_FIT_OPTIONS.includes(options.fit)) {
          spinner.fail(`Invalid fit mode: ${options.fit}`);
          logger.error(`Valid fit modes: ${VALID_FIT_OPTIONS.join(', ')}`);
          process.exit(1);
        }

        const result = await imageProcessor.resize({
          input,
          output: options.output,
          width: options.width,
          height: options.height,
          fit: options.fit,
          background: options.background,
        });

        if (result.success) {
          spinner.succeed('Image resized successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'New Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
            'Fit Mode': options.fit,
          });
        } else {
          spinner.fail('Resize failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Resize failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return resize;
}
