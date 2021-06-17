"use strict";

var _core = require("@actions/core");

var _exec = require("@actions/exec");

var github = _interopRequireWildcard(require("@actions/github"));

var _utils = require("./utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function pre() {
  if (github.context.eventName === 'pull_request_target' && github.context.actor === 'dependabot[bot]') {
    const requestPayload = github.context.payload;
    const {
      ref
    } = requestPayload.pull_request.head;
    await (0, _exec.exec)('git', ['fetch']);
    await (0, _exec.exec)('git', ['checkout', ref]);
  } // install deps


  const installCommand = (0, _core.getInput)('installCommand');
  const installCommandComponents = installCommand.split(' ');
  const installBin = installCommandComponents.shift() || 'npm';
  await (0, _exec.exec)(installBin, installCommandComponents); // build (if needed)

  const buildCommand = (0, _core.getInput)('buildCommand');

  if (buildCommand && buildCommand.length > 0) {
    const buildCommandComponents = buildCommand.split(' ');
    const buildBin = buildCommandComponents.shift();
    if (buildBin) await (0, _exec.exec)(buildBin, buildCommandComponents);
  }

  await (0, _utils.saveCache)();
}

pre();