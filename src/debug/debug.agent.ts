export function debugAgent(): void {
  require('@google-cloud/debug-agent').start({
    serviceContext: {
      service: process.env.BRAIN_SERVICE,
    },
  });
}
