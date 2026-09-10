import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

export function createInfoCommand(): Command {
  return new Command('info')
    .alias('metadata')
    .description('Display image metadata and information')
    .argument('<input>', 'Input image path')
    .action(async (input: string) => {
      const spinner = ora('Reading image metadata...').start();

      try {
        const metadata = await imageProcessor.getMetadata(input);

        spinner.succeed('Image metadata retrieved!');
        logger.banner('Image Information');
        logger.table({
          'File': input,
          'Format': metadata.format?.toUpperCase(),
          'Dimensions': formatDimensions(metadata.width, metadata.height),
          'Width': metadata.width ? `${metadata.width}px` : undefined,
          'Height': metadata.height ? `${metadata.height}px` : undefined,
          'File Size': formatBytes(metadata.size || 0),
          'Color Space': metadata.space,
          'Channels': metadata.channels,
          'Bit Depth': metadata.depth,
          'DPI': metadata.density,
          'Has Alpha': metadata.hasAlpha ? 'Yes' : 'No',
        });
      } catch (error) {
        spinner.fail('Failed to read image metadata');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
