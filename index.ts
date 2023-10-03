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
    const languages = getLanguagesFromOptionsOrArgs();
    const gitignoreContent = await fetchGitignore(languages);
    await writeGitignoreFile(gitignoreContent);
    console.log('Generated .gitignore file');
  } catch (error) {
    handleError(error);
  }
}

function getLanguagesFromOptionsOrArgs(): string {
  const isLanguagesFlagProvided = process.argv.includes('-l') || process.argv.includes('--languages');
  const options = program.opts();
  return isLanguagesFlagProvided ? options.languages.join(',') : program.args.join(',');
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
