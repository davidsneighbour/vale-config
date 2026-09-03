import { createReleaseConfig } from '@dnbhq/release-config';
import type { Config } from 'release-it';

const config: Config = createReleaseConfig({
  githubTokenRef: 'GITHUB_TOKEN_CONTENT_PRIVATE',
  overrides: {
    git: {
      requireBranch: 'main',
      commitArgs: ['--signoff', '--no-verify'],
    },
    github: {
      assets: ['dist/DNB.zip'],
    },
    hooks: {
      'before:git:release': ['node scripts/update-version.ts ${version}'],
      'before:github:release': ['./scripts/build-release-zip.sh'],
    },
  },
});

export default config;
