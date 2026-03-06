import * as core from '@actions/core';

export interface CommitInfo {
  message: string;
  author: string;
}

export interface CommitCountConfig {
  minCount?: number;
  maxCount?: number;
}

export interface CommitMatchConfig {
  commitMessage?: string[];
  commitAuthor?: string[];
  commitCount?: CommitCountConfig[];
}

export function toCommitMatchConfig(config: any): CommitMatchConfig {
  const commitConfig: CommitMatchConfig = {};

  if (config['commit-message']) {
    commitConfig.commitMessage =
      typeof config['commit-message'] === 'string'
        ? [config['commit-message']]
        : config['commit-message'];
  }

  if (config['commit-author']) {
    commitConfig.commitAuthor =
      typeof config['commit-author'] === 'string'
        ? [config['commit-author']]
        : config['commit-author'];
  }

  if (config['commit-count']) {
    const countConfigs = Array.isArray(config['commit-count'])
      ? config['commit-count']
      : [config['commit-count']];

    commitConfig.commitCount = countConfigs.map((cc: any) => ({
      minCount: cc['min-count'],
      maxCount: cc['max-count']
    }));
  }

  return commitConfig;
}

export function checkAnyCommitMessage(
  commits: CommitInfo[],
  patterns: string[]
): boolean {
  core.debug(`   checking "commit-message" patterns`);
  const matchers = patterns.map(p => new RegExp(p));

  for (const matcher of matchers) {
    for (const commit of commits) {
      core.debug(`    - ${matcher} against "${commit.message}"`);
      if (matcher.test(commit.message)) {
        core.debug(`    "commit-message" pattern matched`);
        return true;
      }
    }
  }

  core.debug(`   "commit-message" patterns did not match`);
  return false;
}

export function checkAllCommitMessage(
  commits: CommitInfo[],
  patterns: string[]
): boolean {
  core.debug(`   checking "commit-message" patterns (all)`);
  const matchers = patterns.map(p => new RegExp(p));

  for (const matcher of matchers) {
    const found = commits.some(commit => {
      core.debug(`    - ${matcher} against "${commit.message}"`);
      return matcher.test(commit.message);
    });

    if (!found) {
      core.debug(`    "commit-message" pattern ${matcher} did not match any commit`);
      return false;
    }
  }

  core.debug(`   "commit-message" patterns all matched`);
  return true;
}

export function checkAnyCommitAuthor(
  commits: CommitInfo[],
  patterns: string[]
): boolean {
  core.debug(`   checking "commit-author" patterns`);
  const matchers = patterns.map(p => new RegExp(p));

  for (const matcher of matchers) {
    for (const commit of commits) {
      core.debug(`    - ${matcher} against "${commit.author}"`);
      if (matcher.test(commit.author)) {
        core.debug(`    "commit-author" pattern matched`);
        return true;
      }
    }
  }

  core.debug(`   "commit-author" patterns did not match`);
  return false;
}

export function checkAllCommitAuthor(
  commits: CommitInfo[],
  patterns: string[]
): boolean {
  core.debug(`   checking "commit-author" patterns (all)`);
  const matchers = patterns.map(p => new RegExp(p));

  for (const matcher of matchers) {
    const found = commits.some(commit => {
      core.debug(`    - ${matcher} against "${commit.author}"`);
      return matcher.test(commit.author);
    });

    if (!found) {
      core.debug(`    "commit-author" pattern ${matcher} did not match any commit`);
      return false;
    }
  }

  core.debug(`   "commit-author" patterns all matched`);
  return true;
}

export function checkAnyCommitCount(
  commitCount: number,
  configs: CommitCountConfig[]
): boolean {
  core.debug(`   checking "commit-count" (count: ${commitCount})`);

  for (const config of configs) {
    const aboveMin = config.minCount === undefined || commitCount >= config.minCount;
    const belowMax = config.maxCount === undefined || commitCount <= config.maxCount;

    if (aboveMin && belowMax) {
      core.debug(`   "commit-count" matched`);
      return true;
    }
  }

  core.debug(`   "commit-count" did not match`);
  return false;
}

export function checkAllCommitCount(
  commitCount: number,
  configs: CommitCountConfig[]
): boolean {
  core.debug(`   checking "commit-count" (all, count: ${commitCount})`);

  for (const config of configs) {
    const aboveMin = config.minCount === undefined || commitCount >= config.minCount;
    const belowMax = config.maxCount === undefined || commitCount <= config.maxCount;

    if (!aboveMin || !belowMax) {
      core.debug(`   "commit-count" did not match`);
      return false;
    }
  }

  core.debug(`   "commit-count" all matched`);
  return true;
}
