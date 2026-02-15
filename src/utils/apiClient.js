import { supabase } from '../services/supabase';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Invokes a Supabase Edge Function with exponential backoff retry logic.
 * @param {string} functionName - The name of the function to invoke.
 * @param {object} options - Options for the invocation (body, headers, etc.).
 * @returns {Promise<any>} - The data returned from the function.
 */
export const invokeEdgeFunction = async (functionName, options = {}) => {
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const { data, error } = await supabase.functions.invoke(functionName, options);

            if (error) {
                // Supabase puts status in context for FunctionsHttpError
                const statusCode = error.status || (error.context && error.context.status);

                console.error(`[apiClient] Edge Function ${functionName} error:`, {
                    status: statusCode,
                    message: error.message
                });

                // Check for rate limiting (429) or server errors (5xx)
                if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
                    throw error; // Throw to trigger retry
                }
                // For other errors (4xx / 404), throw immediately without retry
                throw error;
            }

            return data;

        } catch (error) {
            attempt++;
            const statusCode = error.status || (error.context && error.context.status);

            // Don't retry client errors (except 429)
            if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
                throw error;
            }

            if (attempt >= MAX_RETRIES) {
                console.error(`Edge Function ${functionName} failed after ${MAX_RETRIES} attempts:`, error);
                throw error;
            }

            const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
            console.warn(`Retrying ${functionName} (attempt ${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
            await wait(delay);
        }
    }
};
