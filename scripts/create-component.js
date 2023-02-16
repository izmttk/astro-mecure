import inquirer from 'inquirer';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { pascalCase } from 'change-case';
const componentsDir = 'src/components';


const generateTsxTemplate = (name) => (
`import React from 'react';

export interface ${pascalCase(name)}Props {

}

export default function ${pascalCase(name)}({
  ...rest
}: ${pascalCase(name)}Props) {
  return (
    <div>${pascalCase(name)}</div>
  )
}
`);

const generateIndexTemplate = (name) => (
`export { default } from './${pascalCase(name)}';
export * from './${pascalCase(name)}';
`);

async function validateName(name) {
  if (typeof name !== 'string') {
    return 'Please input a string!';
  }
  if (name.length === 0) {
    return 'Name should not be empty!';
  }
  const results = await Promise.allSettled([
    fs.stat(path.join(componentsDir, `${name}.jsx`)),
    fs.stat(path.join(componentsDir, `${name}.tsx`)),
    fs.stat(path.join(componentsDir, `${name}`)),
  ]);

  if (results.some(result => result.status === 'fulfilled')) {
    return `Component "${name}" already exists!`;
  }
  return true;
}


function exit() {
  console.log(chalk.red(`Creating procedure canceled!`));
  process.exit();
}

async function createComponent(name) {

  const componentName = pascalCase(name);
  const tsxTemplate = generateTsxTemplate(componentName);
  const indexTemplate = generateIndexTemplate(componentName);

  const dir = path.join(componentsDir, componentName);
  await fs.mkdir(dir);

  const tsxFile = path.join(dir, `${componentName}.tsx`);
  const indexFile = path.join(dir, `index.ts`);

  await fs.writeFile(tsxFile, tsxTemplate, {
    flag: 'wx'
  });
  await fs.writeFile(indexFile, indexTemplate, {
    flag: 'wx'
  });
  console.log(chalk.green(`Successfully created component at ${dir}`));
}

async function main() {
  const response = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What\'s the component name?',
      validate: validateName
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: answers => `We will create directory at ${path.join(componentsDir, pascalCase(answers.name))}, continue?`,
      default: true,
    }
  ]);
  if (!response.confirm) exit();
  await createComponent(response.name);
}

main()