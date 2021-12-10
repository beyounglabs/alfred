export function getServiceUrl(service: string, isPreview: boolean) {
  const codeWithoutPreview = `${service.toUpperCase()}_URL`;
  const codeWithPreview = `${service.toUpperCase()}_URL_PREVIEW`;
  let url: string | undefined = process.env[codeWithoutPreview];
  if (isPreview && process.env[codeWithPreview]) {
    url = process.env[codeWithPreview];
  }

  if (!url) {
    throw new Error(`${codeWithoutPreview} not configured`);
  }

  return url;
}
