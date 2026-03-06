import * as core from '@actions/core';
import * as github from '@actions/github';
import {CommitInfo} from '../commit';
import {ClientType} from './types';

export const getCommits = async (
  client: ClientType,
  prNumber: number
): Promise<CommitInfo[]> => {
  const listCommitsOptions = client.rest.pulls.listCommits.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber
  });

  const listCommitsResponse = await client.paginate(listCommitsOptions);
  const commits: CommitInfo[] = listCommitsResponse.map((c: any) => ({
    message: c.commit?.message || '',
    author: c.commit?.author?.name || c.author?.login || ''
  }));

  core.debug('found commits:');
  for (const commit of commits) {
    core.debug(`  "${commit.message}" by ${commit.author}`);
  }

  return commits;
};
