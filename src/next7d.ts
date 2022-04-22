#!/usr/bin/env node

import chalk from "chalk";
import { execaSync } from "execa";

type Result = {
  name: string;
  tasks: Task[];
}[];

interface Task {
  title: string;
  priority: number;
  items: { title: string; status: number }[];
}

function highlightLinks(s: string, useColor = true): string {
  return s.replace(
    /\[([^]+)\]\(([^)]+)\)|(https?:\/\/[a-z0-9/%.]+)/g,
    (_, title, url, bareURL) =>
      bareURL
        ? (useColor ? chalk.blue : chalk).underline(bareURL)
        : `${(useColor ? chalk.green : chalk).underline(title)} ` +
          `${(useColor ? chalk.blue : chalk).underline(url)}`
  );
}

const { stdout } = execaSync("osascript", [
  "-l",
  "JavaScript",
  "-e",
  'Application("TickTick").next7daysTasks()',
]);

const result = JSON.parse(stdout) as unknown as Result;

result.forEach(({ name, tasks }, i) => {
  if (i > 0) console.log("");
  console.log(chalk.underline.bold(`# ${name}`));

  tasks.forEach(({ title, priority, items }) => {
    const marker =
      {
        5: chalk.bold.red("!"),
        3: chalk.bold.yellow("*"),
      }[priority] ?? "-";
    console.log(`${marker} ${title}`);
    items.forEach(({ title, status }) => {
      if (status === 1) {
        console.log(chalk.grey(`    x ${highlightLinks(title, false)}`));
      } else {
        console.log(`    - ${highlightLinks(title)}`);
      }
    });
  });
});