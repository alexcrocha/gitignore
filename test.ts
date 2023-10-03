import axios from 'axios';
import fs from 'fs/promises';
import { main, fetchGitignore, writeGitignoreFile, getLanguagesFromOptionsOrArgs } from './index';
jest.mock('axios');
jest.mock('fs/promises');

describe('fetchGitignore', () => {
  it('fetches .gitignore content', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'some gitignore content' });
    const result = await fetchGitignore('node,react');
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

describe('getLanguagesFromOptionsOrArgs', () => {
  it('returns languages from --languages flag', () => {
    const argv = ['/node/path', '/script/path', '--languages', 'node', 'react'];
    const args = ['node', 'react'];
    const optsLanguages = ['node', 'react'];
    const result = getLanguagesFromOptionsOrArgs(argv, args, optsLanguages);
    expect(result).toBe('node,react');
  });

  it('returns languages from -l flag', () => {
    const argv = ['/node/path', '/script/path', '-l', 'node', 'react'];
    const args = ['node', 'react'];
    const optsLanguages = ['node', 'react'];
    const result = getLanguagesFromOptionsOrArgs(argv, args, optsLanguages);
    expect(result).toBe('node,react');
  });

  it('returns languages from positional arguments if no flags are provided', () => {
    const argv = ['/node/path', '/script/path', 'node', 'react'];
    const args = ['node', 'react'];
    const optsLanguages = undefined;
    const result = getLanguagesFromOptionsOrArgs(argv, args, optsLanguages);
    expect(result).toBe('node,react');
  });

  it('returns an empty string if no languages are provided', () => {
    const argv = ['/node/path', '/script/path'];
    const args: string[] = [];
    const optsLanguages = undefined;
    const result = getLanguagesFromOptionsOrArgs(argv, args, optsLanguages);
    expect(result).toBe('');
  });
});
