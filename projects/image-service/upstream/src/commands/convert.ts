import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';
import { OutputFormat } from '../types';

const VALID_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

export function createConvertCommand(): Command {
  const convert = new Command('convert')
    .description('Convert an image to a different format')
    .argument('<input>', 'Input image path')
    .requiredOption(
      '-f, --format <format>',
      `Output format (${VALID_FORMATS.join(', ')})`
    )
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option('-q, --quality <number>', 'Output quality (1-100)', (v) => parseInt(v, 10), 85)
    .action(async (input: string, options) => {
      const spinner = ora('Converting image...').start();

      try {
        if (!VALID_FORMATS.includes(options.format as OutputFormat)) {
          spinner.fail(`Invalid format: ${options.format}`);
          logger.error(`Valid formats: ${VALID_FORMATS.join(', ')}`);
          process.exit(1);
        }

        if (options.quality < 1 || options.quality > 100) {
          spinner.fail('Invalid quality');
          logger.error('Quality must be between 1 and 100');
          process.exit(1);
        }

        const result = await imageProcessor.convert({
          input,
          output: options.output,
          format: options.format as OutputFormat,
          quality: options.quality,
        });

        if (result.success) {
          spinner.succeed('Image converted successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Format': options.format.toUpperCase(),
            'Quality': `${options.quality}%`,
            'Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Conversion failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Conversion failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return convert;
}
