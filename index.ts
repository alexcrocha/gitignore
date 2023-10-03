#!/usr/bin/env ts-node

import axios from 'axios';
import fs from 'fs/promises';
import { program } from 'commander';

program
  .option('-l, --languages <type...>', 'comma separated languages or frameworks')
  .action(main)
  .parse(process.argv);

async function main(): Promise<void> {
  try {
    const languages = getLanguagesFromOptionsOrArgs(process.argv, program.args, program.opts().languages);
    const gitignoreContent = await fetchGitignore(languages);
    await writeGitignoreFile(gitignoreContent);
    console.log('Generated .gitignore file');
  } catch (error) {
    handleError(error);
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

function handleError(error: any): void {
  console.error(`An error occurred: ${error.message}`);
}

export {
  main,
  fetchGitignore,
  writeGitignoreFile,
  getLanguagesFromOptionsOrArgs,
};
