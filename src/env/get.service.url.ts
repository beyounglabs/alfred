export function getServiceUrl(service: string) {
  const codeWithoutPreview = `${service.toUpperCase()}_URL`;
  const codeWithPreview = `${service.toUpperCase()}_URL_PREVIEW`;
  let url: string | undefined = process.env[codeWithoutPreview];
  if (process.env.IS_PREVIEW === '1' && process.env[codeWithPreview]) {
    url = process.env[codeWithPreview];
  }

  if (!url) {
    throw new Error(`${codeWithoutPreview} not configured`);
  }

  return url;
}
