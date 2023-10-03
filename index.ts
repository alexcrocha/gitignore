#!/usr/bin/env ts-node

import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';

import { program } from 'commander';

program
  .option('-l, --languages <type...>', 'comma separated languages or frameworks')
  .action(async () => {
    try {
      const isLanguagesFlagProvided = process.argv.includes('-l') || process.argv.includes('--languages');
      const options = program.opts();
      const languages = isLanguagesFlagProvided ? options.languages.join(',') : program.args.join(',');

      const gitignoreContent = await fetchGitignore(languages);

      const writeFileAsync = promisify(fs.writeFile);
      await writeFileAsync('.gitignore', gitignoreContent);

      console.log('Generated .gitignore file');
    } catch (error) {
      console.error(error);
    }
  })
  .parse(process.argv);

async function fetchGitignore(languages: string): Promise<string> {
  const response = await axios.get(`https://www.toptal.com/developers/gitignore/api/${languages}`);
  return response.data;
}
