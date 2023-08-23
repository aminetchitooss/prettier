#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const sleep = (ms = 2000) => new Promise(r => setTimeout(r, ms));

async function welcome() {
  console.log(`
    ${chalk.bgCyan('Welcome to our prettier setup')} 
  `);
}

async function start() {
  const answers = await inquirer.prompt({
    name: 'default_setup',
    type: 'list',
    message: 'Which setup would you like ?\n',
    choices: ['Standard (Full)', 'Custom']
  });

  return handleAnswer(answers.default_setup !== 'Custom');
}

async function handleAnswer(isDefault) {
  let print_width;
  let tab_width;
  let willIgnoreFileBeCreated,
    formatOnsave = true;
  if (!isDefault) {
    print_width = await askPrintWidth();
    tab_width = await askTabWidth();
    willIgnoreFileBeCreated = await createIgnoreFile();
    formatOnsave = await setFormatOnSave();
  }
  const spinner = createSpinner('Generating cool stuff...').start();

  try {
    if (isDefault) await createPrettierFile();
    else await createPrettierFile(print_width, tab_width, willIgnoreFileBeCreated, formatOnsave);
    await sleep(500);
    spinner.success({ text: `You're all set` });
  } catch (error) {
    spinner.error({ text: `💀💀💀 Game over, Something clearly went wrong!` });
    console.log(error);
    process.exit(1);
  }
}

async function askPrintWidth() {
  const answers = await inquirer.prompt({
    name: 'print_width',
    type: 'input',
    message: 'How many characters untill line break ?',
    default() {
      return 100;
    }
  });

  return answers.print_width;
}

async function askTabWidth() {
  const answers = await inquirer.prompt({
    name: 'tab_width',
    type: 'input',
    message: 'Whats the size of tab indentation ?',
    default() {
      return 2;
    }
  });

  return answers.tab_width;
}

async function createIgnoreFile() {
  const answers = await inquirer.prompt({
    name: 'should_ignore_file_be_created',
    type: 'list',
    message: 'Would you like to add .prettierignore file and format all files ?\n',
    choices: ['Yes', 'No']
  });

  return answers.should_ignore_file_be_created == 'Yes';
}

async function setFormatOnSave() {
  const answers = await inquirer.prompt({
    name: 'should_format_on_save',
    type: 'list',
    message: 'Would you like to format on save ?\n',
    choices: ['Yes', 'No']
  });

  return answers.should_format_on_save == 'Yes';
}

async function createPrettierFile(
  printWidth = 100,
  tabWidth = 2,
  willIgnoreFileBeCreated = true,
  formatOnSave = true
) {
  if (isNaN(Number(printWidth)) || isNaN(Number(tabWidth))) throw 'error hna ';

  const prettierContent = `{
  "arrowParens": "avoid",
  "singleQuote": true,
  "bracketSpacing": true,
  "endOfLine": "lf",
  "tabWidth": ${tabWidth},
  "trailingComma": "none",
  "printWidth": ${printWidth},
  "semi": true,
  "htmlWhitespaceSensitivity": "ignore",
  "bracketSameLine": true
}`;

  const formatOnsaveContent = `{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}`;

  const prettierIgnoreContent = `.azure-pipelines
.azuredevops
.VSCodeCounter
coverage
build
dist
e2e
junit
node_modules
.angular
package-lock.json
package.json
.env`;

  await writeFile('.prettierrc', prettierContent, 'utf8');
  await writeFile('.prettierrc.json', prettierContent, 'utf8');
  if (willIgnoreFileBeCreated) await writeFile('.prettierignore', prettierIgnoreContent, 'utf8');
  if (formatOnSave) {
    await mkdir('.vscode', { recursive: true });
    await writeFile(join('.vscode', 'settings.json'), formatOnsaveContent, 'utf8');
  }
  if (willIgnoreFileBeCreated) execSync('npx prettier --write .');
}

function endProcess() {
  figlet(`Tchitos!\n at your service.`, (err, data) => {
    console.log(gradient.pastel.multiline(data) + '\n');

    console.log(
      chalk.green(`Coding ain't about knowledge; it's about making the command line look cool
      `)
    );
    process.exit(0);
  });
}

await welcome();
await start();
endProcess();
