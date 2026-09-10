import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

export function createBorderCommand(): Command {
  return new Command('border')
    .description('Add a border to an image')
    .argument('<input>', 'Input image path')
    .requiredOption('-b, --border-width <pixels>', 'Border width in pixels', (v) => parseInt(v, 10))
    .option('-c, --color <color>', 'Border color (hex or name)', 'black')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Adding border...').start();

      try {
        if (options.borderWidth < 1) {
          spinner.fail('Invalid border width');
          logger.error('Border width must be at least 1 pixel');
          process.exit(1);
        }

        const result = await imageProcessor.border({
          input,
          output: options.output,
          width: options.borderWidth,
          color: options.color,
        });

        if (result.success) {
          spinner.succeed('Border added successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Border Width': `${options.borderWidth}px`,
            'Border Color': options.color,
            'New Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Border failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Border failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
