# build-test-merge-publish

An all in one GitHub Action to install, build, test, and publish npm modules. Supports automatic approval & merging for dependabot PRs. It should be set to run on push events, as well as pull_request_target events (to ensure dependabot PRs can be tested and approved).

## Details

This is a single workflow step to perform a number of common CI actions without lots of boilerplate in your github actions workflow files. The following operations are performed:

* NPM Auth - (Optional) Authenticate with a private npm registry before trying to install dependencies
* NPM Install - Install dependencies
  For dependabot PRs, we first check out the PR head commit to do the npm install, then we go back to the PR base to run the workflow. 
* Compile - (Optional) Compile source js/ts/whatever into a build artifact
* Test - Run your unit/int/whatever tests
* Approve - (Optional) If the action is triggered by a dependabot PR, automatically approve the PR once the compile and test steps have completed
* Enable Auto Merge - (Optional) If the action is triggered by a dependabot PR, automatically enable the auto merge option on the PR so that GitHub will merge when all pre requisites are satisfied
* Publish - When a commit is pushed to the main branch and compile and test steps have completed, run an automated release (for example using semantic release)

**IMPORTANT** - When using the workflow to auto approve and merge dependabot PRs, you must pass the `fetch-depth: 0` argument to the checkout action in your workflow, and you must have the workflow run on the `pull_request_target` event. This causes a full fetch of the repo, which lets this action use the package.json and package-lock.json from the dependabot branch to do the install of dependencies. Actions on a dependabot branch are not able to access secrets, so in order to use your secrets to build and merge dependabot PRs, we need to use the `pull_request_target` event, this runs on the main branch, but with full credentials. In order to run the tests and merge using secrets, but using the module updates dependabot has created, we detect whether the event is a dependabot `pull_request_target`, if it is, we check out the HEAD commit from the dependabot PR, run npm install, then flip back to the main branch before running the tests. This way we keep the secrets secure, but are still able to build and test dependabot PRs.

## Options

| name                 | description                                       | required | default         |
|----------------------|---------------------------------------------------|----------|-----------------|
| install-command      | Command to install package dependencies           | false    | npm ci          |
| build-command        | Command to run to build the package               | false    |                 |
| release-command      | Command to publish the package                    | false    | npm run release |
| main-branch          | Branch to release from                            | false    | main            |
| merge-method         | Method to use to merge dependabot PRs             | false    | REBASE          |
| private-npm-registry | Private registry to auth with for install/publish | false    |                 |
| private-npm-token    | Auth token to use with private npm registry       | false    |                 |


## Required Environment Variables

* GITHUB_TOKEN - this can't be the built in token or the action will be unable to create releases, approve PRs, etc. You'll need to create a GitHub personal access token and save that as a repository secret
* NPM_TOKEN - this is set as an environment variable for use when running the release command, make sure your release command is expecting this env var and you should be good to go
  
## Example Workflow

```yaml
name: test-and-publish
on:
  push:
  pull_request_target:
    types: [opened, synchronize, edited]
  status: {}
jobs:
  build-test-merge-publish:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v2
        with:
          node-version: '14.17'
      - uses: bbeesley/build-test-merge-publish@main
        with:
          install-command: npm i
          build-command: npm run build
          release-command: npm run release
          main-branch: master
          merge-method: REBASE
          private-npm-registry: npm.example.com
          private-npm-token: ${{ secrets.PRIVATE_NPM_TOKEN }}
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PA_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
