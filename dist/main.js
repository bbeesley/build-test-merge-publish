"use strict";

var _core = require("@actions/core");

var _exec = require("@actions/exec");

var github = _interopRequireWildcard(require("@actions/github"));

var _utils = require("./utils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function main() {
  await (0, _utils.restoreCache)();
  await (0, _exec.exec)('npm', ['test']);

  if (github.context.eventName === 'push') {
    const mainBranch = (0, _core.getInput)('mainBranch');
    const pushPayload = github.context.payload;

    if (pushPayload.ref.split('/').pop() === mainBranch) {
      const releaseCommand = (0, _core.getInput)('releaseCommand');
      const releaseCommandComponents = releaseCommand.split(' ');
      const releaseBin = releaseCommandComponents.shift() || 'npm';
      await (0, _exec.exec)(releaseBin, releaseCommandComponents);
    }
  }
}

main();