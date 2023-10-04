import axios from 'axios';
import fs from 'fs/promises';
import { main, fetchGitignore, writeGitignoreFile, getLanguagesFromOptionsOrArgs, handleError } from './cli';
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
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('executes main logic successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'some gitignore content' });
    await main();
    expect(fs.writeFile).toHaveBeenCalledWith('.gitignore', 'some gitignore content');
    expect(mockConsoleLog).toHaveBeenCalledWith('Generated .gitignore file');
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('handles errors correctly', async () => {
    const errorMsg = 'Something went wrong';
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMsg));
    await main();
    expect(mockConsoleError).toHaveBeenCalledWith(`An error occurred in main: ${errorMsg}`);
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('fetches and displays the list when --list flag is used', async () => {
    const mockLanguages = 'Java,Python,Ruby';
    (axios.get as jest.Mock).mockResolvedValue({ data: mockLanguages });

    await main(['--list'], { list: true });

    expect(mockConsoleLog.mock.calls).toEqual(expect.arrayContaining([
      ['Available languages and frameworks:'],
      ['Java'],
      ['Python'],
      ['Ruby']
    ]));
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('fetches and displays the list when "list" is a positional argument', async () => {
    const mockLanguages = 'Java,Python,Ruby';
    (axios.get as jest.Mock).mockResolvedValue({ data: mockLanguages });

    await main(['list'], {});

    expect(mockConsoleLog.mock.calls).toEqual(expect.arrayContaining([
      ['Available languages and frameworks:'],
      ['Java'],
      ['Python'],
      ['Ruby']
    ]));
    expect(mockConsoleError).not.toHaveBeenCalled();
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

describe('handleError', () => {
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
    jest.resetAllMocks();
  });

  it('handles Axios errors', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      response: {
        status: 404,
        data: 'Not Found'
      }
    };

    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

    handleError(axiosError, 'fetchGitignore');

    expect(mockConsoleError).toHaveBeenCalledWith('Network error occurred in fetchGitignore: Network Error');
    expect(mockConsoleError).toHaveBeenCalledWith('Status Code: 404');
    expect(mockConsoleError).toHaveBeenCalledWith('Data: "Not Found"');
  });

  it('handles generic Error objects', () => {
    const genericError = new Error('Something went wrong');

    handleError(genericError, 'main');

    expect(mockConsoleError).toHaveBeenCalledWith('An error occurred in main: Something went wrong');
  });

  it('handles unknown errors', () => {
    const unknownError = 'An unknown error';

    handleError(unknownError, 'main');

    expect(mockConsoleError).toHaveBeenCalledWith('An unknown error occurred in main');
  });
});
