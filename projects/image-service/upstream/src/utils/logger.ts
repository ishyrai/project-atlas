import chalk from 'chalk';

export const logger = {
  info: (message: string): void => {
    console.log(chalk.blue('ℹ'), chalk.white(message));
  },

  success: (message: string): void => {
    console.log(chalk.green('✔'), chalk.white(message));
  },

  warning: (message: string): void => {
    console.log(chalk.yellow('⚠'), chalk.yellow(message));
  },

  error: (message: string): void => {
    console.log(chalk.red('✖'), chalk.red(message));
  },

  debug: (message: string): void => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  },

  table: (data: Record<string, string | number | undefined>): void => {
    console.log('');
    const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const paddedKey = key.padEnd(maxKeyLength);
        console.log(`  ${chalk.cyan(paddedKey)}  ${chalk.white(value)}`);
      }
    }
    console.log('');
  },

  banner: (text: string): void => {
    console.log('');
    console.log(chalk.bold.magenta('═'.repeat(50)));
    console.log(chalk.bold.magenta(`  ${text}`));
    console.log(chalk.bold.magenta('═'.repeat(50)));
    console.log('');
  },

  divider: (): void => {
    console.log(chalk.gray('─'.repeat(50)));
  },
};
