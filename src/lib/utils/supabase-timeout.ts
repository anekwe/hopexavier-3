export const supabaseTimeout = (ms = 8000) => new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase query timeout")), ms));

export const queryWithTimeout = async (queryPromise: Promise<any>, ms = 8000) => {
  return await Promise.race([queryPromise, supabaseTimeout(ms)]);
};
