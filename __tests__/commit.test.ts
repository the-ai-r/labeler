import {
  CommitInfo,
  toCommitMatchConfig,
  checkAnyCommitMessage,
  checkAllCommitMessage,
  checkAnyCommitAuthor,
  checkAllCommitAuthor,
  checkAnyCommitCount,
  checkAllCommitCount
} from '../src/commit';

jest.mock('@actions/core');

const commits: CommitInfo[] = [
  {message: 'feat: add new feature', author: 'developer'},
  {message: 'fix: resolve bug', author: 'dependabot[bot]'},
  {message: 'chore: update deps', author: 'renovate[bot]'}
];

describe('toCommitMatchConfig', () => {
  it('returns empty config when no commit keys present', () => {
    expect(toCommitMatchConfig({})).toEqual({});
  });

  it('parses commit-message as array', () => {
    const config = toCommitMatchConfig({
      'commit-message': ['^feat:', '^fix:']
    });
    expect(config).toEqual({commitMessage: ['^feat:', '^fix:']});
  });

  it('wraps commit-message string in array', () => {
    const config = toCommitMatchConfig({'commit-message': '^feat:'});
    expect(config).toEqual({commitMessage: ['^feat:']});
  });

  it('parses commit-author as array', () => {
    const config = toCommitMatchConfig({
      'commit-author': ['^dependabot', '^renovate']
    });
    expect(config).toEqual({commitAuthor: ['^dependabot', '^renovate']});
  });

  it('wraps commit-author string in array', () => {
    const config = toCommitMatchConfig({'commit-author': '^dependabot'});
    expect(config).toEqual({commitAuthor: ['^dependabot']});
  });

  it('parses commit-count object', () => {
    const config = toCommitMatchConfig({
      'commit-count': {'min-count': 5, 'max-count': 10}
    });
    expect(config).toEqual({commitCount: [{minCount: 5, maxCount: 10}]});
  });

  it('parses commit-count array', () => {
    const config = toCommitMatchConfig({
      'commit-count': [{'min-count': 5}, {'max-count': 10}]
    });
    expect(config).toEqual({
      commitCount: [
        {minCount: 5, maxCount: undefined},
        {minCount: undefined, maxCount: 10}
      ]
    });
  });
});

describe('checkAnyCommitMessage', () => {
  it('returns true when any pattern matches any commit', () => {
    expect(checkAnyCommitMessage(commits, ['^feat:'])).toBe(true);
  });

  it('returns true when second pattern matches', () => {
    expect(checkAnyCommitMessage(commits, ['^nope', '^fix:'])).toBe(true);
  });

  it('returns false when no pattern matches', () => {
    expect(checkAnyCommitMessage(commits, ['^nope', '^nada'])).toBe(false);
  });

  it('returns false for empty commits', () => {
    expect(checkAnyCommitMessage([], ['^feat:'])).toBe(false);
  });
});

describe('checkAllCommitMessage', () => {
  it('returns true when all patterns match at least one commit', () => {
    expect(checkAllCommitMessage(commits, ['^feat:', '^fix:'])).toBe(true);
  });

  it('returns false when a pattern matches no commit', () => {
    expect(checkAllCommitMessage(commits, ['^feat:', '^nope'])).toBe(false);
  });
});

describe('checkAnyCommitAuthor', () => {
  it('returns true when any pattern matches any author', () => {
    expect(checkAnyCommitAuthor(commits, ['^dependabot'])).toBe(true);
  });

  it('returns false when no pattern matches', () => {
    expect(checkAnyCommitAuthor(commits, ['^github-actions'])).toBe(false);
  });
});

describe('checkAllCommitAuthor', () => {
  it('returns true when all patterns match at least one author', () => {
    expect(
      checkAllCommitAuthor(commits, ['^dependabot', '^renovate'])
    ).toBe(true);
  });

  it('returns false when a pattern matches no author', () => {
    expect(
      checkAllCommitAuthor(commits, ['^dependabot', '^github-actions'])
    ).toBe(false);
  });
});

describe('checkAnyCommitCount', () => {
  it('returns true when count meets min threshold', () => {
    expect(checkAnyCommitCount(10, [{minCount: 5}])).toBe(true);
  });

  it('returns false when count is below min threshold', () => {
    expect(checkAnyCommitCount(3, [{minCount: 5}])).toBe(false);
  });

  it('returns true when count is within range', () => {
    expect(checkAnyCommitCount(7, [{minCount: 5, maxCount: 10}])).toBe(true);
  });

  it('returns false when count exceeds max', () => {
    expect(checkAnyCommitCount(15, [{minCount: 5, maxCount: 10}])).toBe(false);
  });

  it('returns true when any config matches', () => {
    expect(
      checkAnyCommitCount(3, [{minCount: 10}, {maxCount: 5}])
    ).toBe(true);
  });

  it('returns true for max-only config', () => {
    expect(checkAnyCommitCount(2, [{maxCount: 5}])).toBe(true);
  });
});

describe('checkAllCommitCount', () => {
  it('returns true when count satisfies all configs', () => {
    expect(
      checkAllCommitCount(7, [{minCount: 5}, {maxCount: 10}])
    ).toBe(true);
  });

  it('returns false when count fails any config', () => {
    expect(
      checkAllCommitCount(3, [{minCount: 5}, {maxCount: 10}])
    ).toBe(false);
  });
});
