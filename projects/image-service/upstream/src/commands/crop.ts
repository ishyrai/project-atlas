import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';
import { AspectRatio } from '../types';

const VALID_RATIOS: AspectRatio[] = ['1:1', '4:3', '16:9', '3:2', '2:3', '9:16', '3:4'];

export function createCropCommand(): Command {
  const crop = new Command('crop')
    .description('Crop an image to a fixed aspect ratio')
    .argument('<input>', 'Input image path')
    .requiredOption(
      '-r, --ratio <ratio>',
      `Aspect ratio (${VALID_RATIOS.join(', ')})`,
      '1:1'
    )
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .option('-w, --width <number>', 'Final width after crop', (v) => parseInt(v, 10))
    .option('-H, --height <number>', 'Final height after crop', (v) => parseInt(v, 10))
    .option(
      '-g, --gravity <position>',
      'Crop gravity (north, south, east, west, center, entropy, attention)',
      'center'
    )
    .action(async (input: string, options) => {
      const spinner = ora('Processing image...').start();

      try {
        if (!VALID_RATIOS.includes(options.ratio as AspectRatio)) {
          spinner.fail(`Invalid aspect ratio: ${options.ratio}`);
          logger.error(`Valid ratios: ${VALID_RATIOS.join(', ')}`);
          process.exit(1);
        }

        const result = await imageProcessor.crop({
          input,
          output: options.output,
          aspectRatio: options.ratio as AspectRatio,
          width: options.width,
          height: options.height,
          gravity: options.gravity,
        });

        if (result.success) {
          spinner.succeed('Image cropped successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
            'Format': result.metadata?.format?.toUpperCase(),
          });
        } else {
          spinner.fail('Crop failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Crop failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return crop;
}
