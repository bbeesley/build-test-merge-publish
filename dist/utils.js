"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCachePaths = getCachePaths;
exports.getCacheKey = getCacheKey;
exports.saveCache = saveCache;
exports.restoreCache = restoreCache;
exports.approvePR = approvePR;
exports.mergePR = mergePR;

var _core = require("@actions/core");

var github = _interopRequireWildcard(require("@actions/github"));

var cache = _interopRequireWildcard(require("@actions/cache"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const defaultCachePaths = ['node_modules', 'packages/*/node_modules/', 'dist', 'packages/*/dist'];

function getCachePaths() {
  var _getInput;

  const cachePaths = ((_getInput = (0, _core.getInput)('cache-paths')) !== null && _getInput !== void 0 ? _getInput : '').split(',').filter(e => e.length > 0);
  return [...defaultCachePaths, ...cachePaths];
}

function getCacheKey() {
  return `btmp-pre-${github.context.runId}`;
}

async function saveCache() {
  await cache.saveCache(getCachePaths(), getCacheKey());
}

async function restoreCache() {
  await cache.restoreCache(getCachePaths(), getCacheKey());
}

async function approvePR() {
  var _process$env$GITHUB_T;

  const ok = github.getOctokit((_process$env$GITHUB_T = process.env.GITHUB_TOKEN) !== null && _process$env$GITHUB_T !== void 0 ? _process$env$GITHUB_T : process.env.GH_TOKEN);
  const requestPayload = github.context.payload;
  await ok.rest.pulls.createReview({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: requestPayload.pull_request.number,
    event: 'APPROVE'
  });
}

async function mergePR() {
  var _process$env$GITHUB_T2;

  const ok = github.getOctokit((_process$env$GITHUB_T2 = process.env.GITHUB_TOKEN) !== null && _process$env$GITHUB_T2 !== void 0 ? _process$env$GITHUB_T2 : process.env.GH_TOKEN);
  const requestPayload = github.context.payload;
  await ok.rest.pulls.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: requestPayload.pull_request.number
  });
}