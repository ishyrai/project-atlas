#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import {
  createCropCommand,
  createWatermarkCommand,
  createResizeCommand,
  createRotateCommand,
  createConvertCommand,
  createCompressCommand,
  createBorderCommand,
  createThumbnailCommand,
  createInfoCommand,
  createFlipCommand,
  createGrayscaleCommand,
  createBlurCommand,
  createSharpenCommand,
  createTintCommand,
  createNegativeCommand,
  createNormalizeCommand,
} from './commands';
import { logger } from './utils/logger';
import { ensureOutputDir } from './utils/helpers';

const VERSION = '1.0.0';

const BANNER = `
${chalk.magenta('╔═══════════════════════════════════════════════════════╗')}
${chalk.magenta('║')}     ${chalk.bold.white('Image Service')} - ${chalk.cyan('Terminal Image Processing')}      ${chalk.magenta('║')}
${chalk.magenta('║')}                   ${chalk.gray(`v${VERSION}`)}                            ${chalk.magenta('║')}
${chalk.magenta('╚═══════════════════════════════════════════════════════╝')}
`;

function main(): void {
  logger.info(`Image Service v${VERSION}: ${process.argv.slice(2).join(' ') || '(no command)'}`);
  // Ensure output directory exists
  ensureOutputDir();

  const program = new Command();

  program
    .name('imgserv')
    .description('A powerful terminal-based image processing service')
    .version(VERSION, '-v, --version', 'Display version number')
    .addHelpText('beforeAll', BANNER)
    .configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => cmd.name(),
    });

  // Add all commands
  program.addCommand(createCropCommand());
  program.addCommand(createWatermarkCommand());
  program.addCommand(createResizeCommand());
  program.addCommand(createRotateCommand());
  program.addCommand(createConvertCommand());
  program.addCommand(createCompressCommand());
  program.addCommand(createBorderCommand());
  program.addCommand(createThumbnailCommand());
  program.addCommand(createInfoCommand());
  program.addCommand(createFlipCommand());
  program.addCommand(createGrayscaleCommand());
  program.addCommand(createBlurCommand());
  program.addCommand(createSharpenCommand());
  program.addCommand(createTintCommand());
  program.addCommand(createNegativeCommand());
  program.addCommand(createNormalizeCommand());

  // Custom help with examples
  program.addHelpText(
    'after',
    `
${chalk.bold.yellow('Examples:')}

  ${chalk.green('Crop to 16:9 aspect ratio:')}
  $ imgserv crop image.jpg -r 16:9

  ${chalk.green('Add watermark with 50% opacity:')}
  $ imgserv watermark image.jpg -w logo.png -p 0.5 -pos bottom-right

  ${chalk.green('Resize to 800px width:')}
  $ imgserv resize image.jpg -w 800

  ${chalk.green('Convert to WebP format:')}
  $ imgserv convert image.jpg -f webp -q 85

  ${chalk.green('Compress with 70% quality:')}
  $ imgserv compress image.jpg -q 70

  ${chalk.green('Create thumbnail:')}
  $ imgserv thumbnail image.jpg -s 200

  ${chalk.green('Apply blur effect:')}
  $ imgserv blur image.jpg -s 5

  ${chalk.green('Add border:')}
  $ imgserv border image.jpg -w 10 -c "#ff0000"

${chalk.bold.cyan('Output:')}
  All processed images are saved to the ${chalk.yellow('./output')} folder by default.
  Use ${chalk.yellow('-o, --output')} option to specify a custom output path.

${chalk.bold.cyan('More Info:')}
  Use ${chalk.yellow('imgserv <command> --help')} for detailed command options.
`
  );

  // Error handling for unknown commands
  program.on('command:*', (operands) => {
    logger.error(`Unknown command: ${operands[0]}`);
    logger.info('Run "imgserv --help" for a list of available commands.');
    process.exit(1);
  });

  // Parse arguments
  program.parse(process.argv);

  // Show help if no command provided
  if (process.argv.length <= 2) {
    program.outputHelp();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

main();
