import { Command } from 'commander';
import ora from 'ora';
import { imageProcessor } from '../services/ImageProcessor';
import { logger } from '../utils/logger';
import { formatBytes, formatDimensions } from '../utils/helpers';

export function createFlipCommand(): Command {
  return new Command('flip')
    .description('Flip an image horizontally or vertically')
    .argument('<input>', 'Input image path')
    .requiredOption(
      '-d, --direction <direction>',
      'Flip direction (horizontal, vertical, both)'
    )
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Flipping image...').start();

      try {
        const validDirections = ['horizontal', 'vertical', 'both'];
        if (!validDirections.includes(options.direction)) {
          spinner.fail(`Invalid direction: ${options.direction}`);
          logger.error(`Valid directions: ${validDirections.join(', ')}`);
          process.exit(1);
        }

        const result = await imageProcessor.flip({
          input,
          output: options.output,
          direction: options.direction,
        });

        if (result.success) {
          spinner.succeed('Image flipped successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Direction': options.direction,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Flip failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Flip failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createGrayscaleCommand(): Command {
  return new Command('grayscale')
    .alias('greyscale')
    .description('Convert an image to grayscale')
    .argument('<input>', 'Input image path')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Converting to grayscale...').start();

      try {
        const result = await imageProcessor.grayscale({
          input,
          output: options.output,
        });

        if (result.success) {
          spinner.succeed('Image converted to grayscale!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Dimensions': formatDimensions(result.metadata?.width, result.metadata?.height),
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Grayscale conversion failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Grayscale conversion failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createBlurCommand(): Command {
  return new Command('blur')
    .description('Apply blur effect to an image')
    .argument('<input>', 'Input image path')
    .option('-s, --sigma <number>', 'Blur sigma (0.3 to 1000)', (v) => parseFloat(v), 3)
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Applying blur...').start();

      try {
        if (options.sigma < 0.3 || options.sigma > 1000) {
          spinner.fail('Invalid sigma value');
          logger.error('Sigma must be between 0.3 and 1000');
          process.exit(1);
        }

        const result = await imageProcessor.blur({
          input,
          output: options.output,
          sigma: options.sigma,
        });

        if (result.success) {
          spinner.succeed('Blur applied successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Sigma': options.sigma,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Blur failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Blur failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createSharpenCommand(): Command {
  return new Command('sharpen')
    .description('Sharpen an image')
    .argument('<input>', 'Input image path')
    .option('-s, --sigma <number>', 'Sharpen sigma', (v) => parseFloat(v), 1)
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Sharpening image...').start();

      try {
        const result = await imageProcessor.sharpen({
          input,
          output: options.output,
          sigma: options.sigma,
        });

        if (result.success) {
          spinner.succeed('Image sharpened successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Sigma': options.sigma,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Sharpen failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Sharpen failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createTintCommand(): Command {
  return new Command('tint')
    .description('Apply a color tint to an image')
    .argument('<input>', 'Input image path')
    .requiredOption('-c, --color <color>', 'Tint color (hex or name)')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Applying tint...').start();

      try {
        const result = await imageProcessor.tint({
          input,
          output: options.output,
          color: options.color,
        });

        if (result.success) {
          spinner.succeed('Tint applied successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Color': options.color,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Tint failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Tint failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createNegativeCommand(): Command {
  return new Command('negative')
    .alias('invert')
    .description('Create a negative/inverted version of an image')
    .argument('<input>', 'Input image path')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Creating negative...').start();

      try {
        const result = await imageProcessor.negative(input, options.output);

        if (result.success) {
          spinner.succeed('Negative created successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Negative failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Negative failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

export function createNormalizeCommand(): Command {
  return new Command('normalize')
    .description('Normalize image contrast')
    .argument('<input>', 'Input image path')
    .option('-o, --output <path>', 'Output file path (default: output folder)')
    .action(async (input: string, options) => {
      const spinner = ora('Normalizing image...').start();

      try {
        const result = await imageProcessor.normalize(input, options.output);

        if (result.success) {
          spinner.succeed('Image normalized successfully!');
          logger.table({
            'Input': result.inputPath,
            'Output': result.outputPath,
            'Size': formatBytes(result.metadata?.size || 0),
          });
        } else {
          spinner.fail('Normalize failed');
          logger.error(result.error || 'Unknown error');
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Normalize failed');
        logger.error(error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
