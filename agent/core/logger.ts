import chalk from 'chalk';
import ora, { Ora } from 'ora';

const ICONS = {
  info: chalk.cyan('ℹ'),
  success: chalk.green('✔'),
  warn: chalk.yellow('⚠'),
  error: chalk.red('✖'),
  step: chalk.blueBright('◆'),
  ai: chalk.magenta('✦'),
  file: chalk.green('📄'),
  run: chalk.yellow('▶'),
  deploy: chalk.cyan('🚀'),
};

class Logger {
  private _spinner: Ora | null = null;

  banner(): void {
    console.log('');
    console.log(chalk.bold.blueBright('╔══════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blueBright('║') + chalk.bold.white('   🤖  DevMedic Agent  —  Autonomous AI Developer  ') + chalk.bold.blueBright('║'));
    console.log(chalk.bold.blueBright('╚══════════════════════════════════════════════════╝'));
    console.log('');
  }

  step(n: number, total: number, msg: string): void {
    this.stopSpinner();
    console.log('');
    console.log(
      chalk.bold.blueBright(`  STEP ${n}/${total}`) +
        chalk.bold.white(` — ${msg}`)
    );
    console.log(chalk.gray('  ' + '─'.repeat(50)));
  }

  info(msg: string): void {
    console.log(`  ${ICONS.info} ${chalk.white(msg)}`);
  }

  success(msg: string): void {
    console.log(`  ${ICONS.success} ${chalk.green(msg)}`);
  }

  warn(msg: string): void {
    console.log(`  ${ICONS.warn} ${chalk.yellow(msg)}`);
  }

  error(msg: string): void {
    console.log(`  ${ICONS.error} ${chalk.red(msg)}`);
  }

  ai(msg: string): void {
    console.log(`  ${ICONS.ai} ${chalk.magenta(msg)}`);
  }

  file(filePath: string): void {
    console.log(`  ${ICONS.file} ${chalk.green(filePath)}`);
  }

  run(cmd: string): void {
    console.log(`  ${ICONS.run} ${chalk.yellow(cmd)}`);
  }

  deploy(msg: string): void {
    console.log(`  ${ICONS.deploy} ${chalk.cyan(msg)}`);
  }

  dim(msg: string): void {
    console.log(`  ${chalk.gray(msg)}`);
  }

  blank(): void {
    console.log('');
  }

  spin(msg: string): Ora {
    this.stopSpinner();
    this._spinner = ora({
      text: chalk.cyan(msg),
      spinner: 'dots',
      color: 'cyan',
    }).start();
    return this._spinner;
  }

  stopSpinner(success?: string, fail?: string): void {
    if (!this._spinner) return;
    if (success) {
      this._spinner.succeed(chalk.green(success));
    } else if (fail) {
      this._spinner.fail(chalk.red(fail));
    } else {
      this._spinner.stop();
    }
    this._spinner = null;
  }

  section(title: string): void {
    this.stopSpinner();
    console.log('');
    console.log(
      chalk.bold.bgBlueBright.white(`  ${title}  `)
    );
    console.log('');
  }

  keyValue(key: string, value: string): void {
    console.log(`  ${chalk.gray(key + ':')} ${chalk.white(value)}`);
  }

  divider(): void {
    console.log(chalk.gray('  ' + '─'.repeat(50)));
  }
}

export const logger = new Logger();
