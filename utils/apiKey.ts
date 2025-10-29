export const getApiKey = (): string => {
    // The API key MUST be obtained exclusively from the environment variable.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This error will be caught by a top-level boundary or will halt execution,
        // which is the desired behavior if the environment is not configured correctly.
        throw new Error("API_KEY environment variable not set. The application cannot function.");
    }
    return apiKey;
};