#!/usr/bin/env ts-node

import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';

import { program } from 'commander';

program
  .option('-l, --languages <type...>', 'comma separated languages or frameworks')
  .action(async (args) => {
    if (args && args.length > 0) {
      const languages = args.join(',');
      const gitignoreContent = await fetchGitignore(languages);
      await writeFileAsync('.gitignore', gitignoreContent);
    } else {
      console.log("No languages specified. Exiting.");
    }
  })
  .parse(process.argv);

const options = program.opts();


const writeFileAsync = promisify(fs.writeFile);

async function fetchGitignore(languages: string): Promise<string> {
  const response = await axios.get(`https://www.toptal.com/developers/gitignore/api/${languages}`);
  return response.data;
}

async function generateGitignore() {
  const languages = options.languages;
  const gitignoreContent = await fetchGitignore(languages);
  await writeFileAsync('.gitignore', gitignoreContent);
}

generateGitignore().catch(console.error);
