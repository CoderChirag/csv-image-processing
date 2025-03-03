const apm = require('elastic-apm-node');

let isMainThread;
try {
  const workerThreads = require('worker_threads');
  isMainThread = workerThreads.isMainThread;
} catch (_importErr) {
  isMainThread = true;
}

if (isMainThread) {
  /** @type import("elastic-apm-node").AgentConfigOptions */
  const options = {
    serviceName: process.env.APM_SERVICE_NAME,
    apiKey: process.env.APM_API_KEY,
    serverUrl: process.env.APM_BASE_URI,
    environment: process.env.NODE_ENV,
    active: process.env.NODE_ENV !== 'local',
    captureBody: 'all',
    captureHeaders: true,
    logUncaughtExceptions: true,
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: 'always',
    usePathAsTransactionName: true,
    exitSpanMinDuration: '0ms',
    breakdownMetrics: true,
  };
  apm.start(options);
}

module.exports = apm;
