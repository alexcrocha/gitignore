#!/usr/bin/env ts-node

import axios from 'axios';
import { promises as fs } from 'fs';
import { program } from 'commander';

program
  .option('-l, --languages <type...>', 'comma separated languages or frameworks')
  .option('-li, --list', 'list all available languages and frameworks')
  .action(main)
  .parse(process.argv);

async function main(args: string[] = [], cmdOptions: any = {}): Promise<void> {
  const options = cmdOptions || program.opts();
  const actualArgs = args.length ? args : process.argv;

  if (options.list || actualArgs.includes('list')) {
    try {
      const allLanguages = await fetchGitignore('list');
      printLanguagesInGroups(allLanguages);
      return;
    } catch (error) {
      handleError(error, "list");
      return;
    }
  }

  try {
    const languages = getLanguagesFromOptionsOrArgs(actualArgs, program.args, options.languages);
    const gitignoreContent = await fetchGitignore(languages);
    await writeGitignoreFile(gitignoreContent);
    console.log('Generated .gitignore file');
  } catch (error) {
    handleError(error, "main");
  }
}

function getLanguagesFromOptionsOrArgs(argv: string[], args: string[], optsLanguages: string[] | undefined): string {
  const isLanguagesFlagProvided = argv.includes('-l') || argv.includes('--languages');
  return isLanguagesFlagProvided ? optsLanguages?.join(',') || '' : args.join(',');
}

async function fetchGitignore(languages: string): Promise<string> {
  const response = await axios.get(`https://www.toptal.com/developers/gitignore/api/${languages}`);
  return response.data;
}

async function writeGitignoreFile(content: string): Promise<void> {
  await fs.writeFile('.gitignore', content);
}

function handleError(error: any, context: string): void {
  if (axios.isAxiosError(error)) {
    console.error(`Network error occurred in ${context}: ${error.message}`);
    if (error.response) {
      console.error(`Status Code: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  } else if (error instanceof Error) {
    console.error(`An error occurred in ${context}: ${error.message}`);
  } else {
    console.error(`An unknown error occurred in ${context}`);
  }
}

function printLanguagesInGroups(allLanguages: string) {
  const arr = allLanguages.split('\n').join(',').split(',').sort();
  let currentGroup = '';
  let row: string[] = [];
  console.log('Available languages and frameworks:');
  const printRow = () => {
    if (row.length > 0) {
      console.log(row.join('\t'));
      row = [];
    }
  };
  arr.forEach((lang) => {
    const firstLetter = lang[0].toUpperCase();
    if (currentGroup !== firstLetter) {
      printRow();
      if (currentGroup !== '') {
        console.groupEnd();
      }
      console.group(firstLetter);
      currentGroup = firstLetter;
    }
    row.push(lang);
    if (row.length === 5) {
      printRow();
    }
  });
  printRow();
  if (currentGroup !== '') {
    console.groupEnd();
  }
}

export {
  main,
  fetchGitignore,
  writeGitignoreFile,
  getLanguagesFromOptionsOrArgs,
  handleError,
};
