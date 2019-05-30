export function debugAgent(): void {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
      '/var/www/html/gcp-credentials.json';
  }

  require('@google-cloud/debug-agent').start({
    serviceContext: {
      service: process.env.BRAIN_SERVICE,
    },
  });
}
