import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.env.IMAGE_SERVICE_LOG_DIR || 'logs');
const logFile = path.join(logDir, 'app.log');

function sanitizeMessage(message: string): string {
  const cwd = process.cwd();
  return message
    .split(`${cwd}${path.sep}`).join('')
    .split(cwd).join('.');
}

function writeToFile(level: string, message: string): void {
  fs.mkdirSync(logDir, { recursive: true });
  const entry = `${new Date().toISOString()} [${level.toUpperCase()}] ${sanitizeMessage(message)}\n`;
  fs.appendFileSync(logFile, entry, 'utf8');
}

export const logger = {
  info: (message: string): void => {
    console.log(chalk.blue('ℹ'), chalk.white(message));
    writeToFile('info', message);
  },

  success: (message: string): void => {
    console.log(chalk.green('✔'), chalk.white(message));
    writeToFile('success', message);
  },

  warning: (message: string): void => {
    console.log(chalk.yellow('⚠'), chalk.yellow(message));
    writeToFile('warning', message);
  },

  error: (message: string): void => {
    console.log(chalk.red('✖'), chalk.red(message));
    writeToFile('error', message);
  },

  debug: (message: string): void => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
      writeToFile('debug', message);
    }
  },

  table: (data: Record<string, string | number | undefined>): void => {
    const loggedData: Record<string, string | number> = {};
    console.log('');
    const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        loggedData[key] = typeof value === 'string' ? sanitizeMessage(value) : value;
        const paddedKey = key.padEnd(maxKeyLength);
        console.log(`  ${chalk.cyan(paddedKey)}  ${chalk.white(value)}`);
      }
    }
    console.log('');
    writeToFile('info', JSON.stringify(loggedData));
  },

  banner: (text: string): void => {
    console.log('');
    writeToFile('info', text);
    console.log(chalk.bold.magenta('═'.repeat(50)));
    console.log(chalk.bold.magenta(`  ${text}`));
    console.log(chalk.bold.magenta('═'.repeat(50)));
    console.log('');
  },

  divider: (): void => {
    console.log(chalk.gray('─'.repeat(50)));
    writeToFile('info', '-'.repeat(50));
  },
};
