import axios from 'axios';
import fs from 'fs/promises';
import { main, fetchGitignore, writeGitignoreFile, getLanguagesFromOptionsOrArgs } from './index';
jest.mock('axios');
jest.mock('fs/promises');

describe('fetchGitignore', () => {
  it('fetches .gitignore content', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'some gitignore content' });
    const result = await fetchGitignore('Node,React');
    expect(result).toBe('some gitignore content');
  });
});

describe('writeGitignoreFile', () => {
  it('writes content to .gitignore', async () => {
    await writeGitignoreFile('some content');
    expect(fs.writeFile).toHaveBeenCalledWith('.gitignore', 'some content');
  });
});

describe('main', () => {
  it('executes main logic', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'some gitignore content' });
    await main();
    expect(fs.writeFile).toHaveBeenCalledWith('.gitignore', 'some gitignore content');
  });
});
