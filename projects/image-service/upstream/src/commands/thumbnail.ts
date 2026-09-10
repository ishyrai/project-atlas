import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

export function createThumbnailCommand(): Command {
  return new Command('thumbnail')
    .alias('thumb')
    .description('Create a square thumbnail from an image')
    .argument('<input>', 'Input image path')
    .option('-z, --size <pixels>', 'Thumbnail size in pixels', (val) => parseInt(val, 10), 150)
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Creating thumbnail...').start();

      try {
        if (options.size < 1) {
          spinner.fail('Invalid thumbnail size');
          logger.error('Thumbnail size must be at least 1 pixel');
          process.exit(1);
        }

        const result = await imageProcessor.thumbnail({
          input,
          output: options.output,
          size: options.size,
        });

        if (result.success) {
          spinner.succeed('Thumbnail created successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Dimensions': `${options.size}x${options.size}`,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Thumbnail creation failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Thumbnail creation failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
