import type { CalendarWeeks, ContributionDay, OwnedRepo, ProfileData } from './types.mts';

export type GraphQLRequest = <T>(query: string, variables: Readonly<Record<string, unknown>>) => Promise<T>;

const GRAPHQL_URL = 'https://api.github.com/graphql';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_REPO_PAGES = 10;

// Same counters as the github-readme-stats card: commits and contributed-to cover the last year.
const PROFILE_QUERY = `query Profile($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      contributionCalendar {
        weeks { contributionDays { date weekday contributionCount contributionLevel } }
      }
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) { totalCount }
    pullRequests(first: 1) { totalCount }
    openIssues: issues(states: OPEN) { totalCount }
    closedIssues: issues(states: CLOSED) { totalCount }
  }
}`;

// Every owned repository the token can read: public ones only with GITHUB_TOKEN,
// private ones too with a read-only METRICS_TOKEN.
const REPOS_QUERY = `query Repos($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER) {
      pageInfo { hasNextPage endCursor }
      nodes {
        isFork
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: readonly { message: string }[];
}

interface Count {
  totalCount: number;
}

interface ProfileQueryData {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      contributionCalendar: { weeks: readonly { contributionDays: readonly ContributionDay[] }[] };
    };
    repositoriesContributedTo: Count;
    pullRequests: Count;
    openIssues: Count;
    closedIssues: Count;
  } | null;
}

interface RepoNode {
  isFork: boolean;
  stargazerCount: number;
  languages: { edges: readonly { size: number; node: { name: string; color: string | null } }[] } | null;
}

interface ReposQueryData {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: readonly RepoNode[];
    };
  } | null;
}

export function createGraphQLClient(token: string): GraphQLRequest {
  return async <T,>(query: string, variables: Readonly<Record<string, unknown>>): Promise<T> => {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'nelomr-profile-metrics',
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`GitHub GraphQL request failed with HTTP ${response.status}`);
    const payload = (await response.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new Error(`GitHub GraphQL errors: ${payload.errors.map((error) => error.message).join('; ')}`);
    }
    if (payload.data === undefined) throw new Error('GitHub GraphQL response has no data');
    return payload.data;
  };
}

function toOwnedRepo(node: RepoNode): OwnedRepo {
  return {
    isFork: node.isFork,
    stars: node.stargazerCount,
    languages: (node.languages?.edges ?? []).map((edge) => ({
      name: edge.node.name,
      color: edge.node.color,
      size: edge.size,
    })),
  };
}

async function fetchOwnedRepos(request: GraphQLRequest, login: string): Promise<OwnedRepo[]> {
  const repos: OwnedRepo[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_REPO_PAGES; page += 1) {
    const data: ReposQueryData = await request<ReposQueryData>(REPOS_QUERY, { login, after });
    const connection = data.user?.repositories;
    if (!connection) throw new Error(`GitHub user ${login} not found`);
    repos.push(...connection.nodes.map(toOwnedRepo));
    if (!connection.pageInfo.hasNextPage) return repos;
    after = connection.pageInfo.endCursor;
  }
  throw new Error(`More than ${MAX_REPO_PAGES * 100} repositories; raise MAX_REPO_PAGES`);
}

export async function fetchProfile(request: GraphQLRequest, login: string): Promise<ProfileData> {
  const [profile, repos] = await Promise.all([
    request<ProfileQueryData>(PROFILE_QUERY, { login }),
    fetchOwnedRepos(request, login),
  ]);
  const user = profile.user;
  if (!user) throw new Error(`GitHub user ${login} not found`);
  const contributions = user.contributionsCollection;
  const calendarWeeks: CalendarWeeks = contributions.contributionCalendar.weeks.map(
    (week) => week.contributionDays,
  );
  return {
    commitsLastYear: contributions.totalCommitContributions,
    pullRequests: user.pullRequests.totalCount,
    issues: user.openIssues.totalCount + user.closedIssues.totalCount,
    contributedTo: user.repositoriesContributedTo.totalCount,
    calendarWeeks,
    repos,
  };
}
