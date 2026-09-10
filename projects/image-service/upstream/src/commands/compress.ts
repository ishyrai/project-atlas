import { Command } from 'commander';
import ora from 'ora';
import * as fs from 'fs';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';
import { OutputFormat } from '../types';

const VALID_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'avif'];

export function createCompressCommand(): Command {
  const compress = new Command('compress')
    .description('Compress an image to reduce file size')
    .argument('<input>', 'Input image path')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option('-q, --quality <number>', 'Compression quality (1-100, lower = smaller)', (v) => parseInt(v, 10), 70)
    .option(
      '-f, --format <format>',
      `Output format (${VALID_FORMATS.join(', ')})`,
    )
    .action(async (input: string, options) => {
      const spinner = ora('Compressing image...').start();

      try {
        if (options.quality < 1 || options.quality > 100) {
          spinner.fail('Invalid quality');
          logger.error('Quality must be between 1 and 100');
          process.exit(1);
        }

        if (options.format && !VALID_FORMATS.includes(options.format as OutputFormat)) {
          spinner.fail(`Invalid format: ${options.format}`);
          logger.error(`Valid formats: ${VALID_FORMATS.join(', ')}`);
          process.exit(1);
        }

        const inputStats = fs.statSync(input);
        const inputSize = inputStats.size;

        const result = await imageProcessor.compress({
          input,
          output: options.output,
          quality: options.quality,
          format: options.format as OutputFormat | undefined,
        });

        if (result.success) {
          const outputSize = result.metadata?.size || 0;
          const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

          spinner.succeed('Image compressed successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Original Size': formatBytes(inputSize),
            'New Size': formatBytes(outputSize),
            'Savings': `${savings}%`,
            'Quality': `${options.quality}%`,
          });
        } else {
          spinner.fail('Compression failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Compression failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return compress;
}
