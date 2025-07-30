export const getLushaApiKey = (): string => {
  const apiKey = process.env.LUSHA_API_KEY;
  if (!apiKey) {
    throw new Error('LUSHA_API_KEY environment variable is required');
  }
  return apiKey;
};

export const getLushaBaseUrl = (): string => {
  return 'https://api.lusha.com';
}; 