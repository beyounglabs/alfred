const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const axios = require('axios');

const coverageFile = join(__dirname, '..', 'coverage', 'coverage-summary.json');
const repositoryFile = join(__dirname, '..', 'repository.txt');

const SLACK_URL = process.env.SLACK_URL;

let info = [process.env.REPOSITORY_NAME, process.env.BRANCH_NAME].filter(
  Boolean,
);

if (!info.length) {
  info = readFileSync(repositoryFile, 'utf8').split('\n');
}

let [repository, branch] = info;

repository = [
  firstLetter.toUpperCase(),
  ...restLetters.filter(value => value !== '\n'),
].join('');

branch = branch.trim();

const repositoryLink = `https://bitbucket.org/beautybrands/${repository}`;
const branchLink = `${repositoryLink}/branch/${branch}?dest=develop`;
const repositoryText = `<${repositoryLink}|${repository}>`;
const branchText = `<${branchLink}|${branch}>`;

const getColor = pct => {
  if (pct > 80) return 'good';
  if (pct <= 80 && pct > 50) return 'warning';
  if (pct <= 50) return 'danger';
};

const { total: coverage } = JSON.parse(readFileSync(coverageFile, 'utf8'));

const keys = ['Statements', 'Branches', 'Functions', 'Lines'];

const request = {
  text: [repositoryText, branchText].join(' / '),
  attachments: keys.map(key => {
    const keyLowerCase = key.toLowerCase();
    const { pct, covered, total } = coverage[keyLowerCase];

    return {
      color: getColor(pct),
      fields: [
        {
          title: key,
          value: `${pct}% (${covered} / ${total})`,
        },
      ],
    };
  }),
};

axios.post(SLACK_URL, request);
