# Gitignore Generator

A command-line utility to dynamically generate `.gitignore` files based on specified languages or frameworks. This tool is developed as a school project and utilizes the [gitignore.io](https://www.toptal.com/developers/gitignore) API. Please consider supporting gitignore.io if you find this utility helpful.

## Installation

Install the package globally using npm:

```bash
npm install -g @alexcrocha/gitignore
```

## Usage

```bash
gitignore -l node ruby java
```

Or use:

```bash
gitignore node ruby java
```

This will generate a .gitignore file in the current directory with ignore rules for Node.js, Ruby, and Java.

### Options

- `-l` or `--languages` - Specify languages or frameworks to generate a .gitignore file for

- `-li` or `--list` - List all available languages and frameworks

### Listing All Supported Languages and Frameworks

```bash
gitignore -li
```

Or use:

```bash
gitignore list
```

This will print out a list of all the languages and frameworks this utility can generate .gitignore rules for, grouped by the first letter.
