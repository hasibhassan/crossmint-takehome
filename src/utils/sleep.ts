/**
 * Utility function to delay between API calls
 * @param ms
 * @returns
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
