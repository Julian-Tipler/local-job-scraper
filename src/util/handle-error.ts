type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
};

export function handleSupabaseError(
  error: SupabaseError,
  context: string,
): never {
  console.error(
    `Error in ${context}:`,
    error.message,
    error.details ?? "",
    error.hint ?? "",
  );
  throw new Error(`Error in ${context}: ${error.message}`);
}
