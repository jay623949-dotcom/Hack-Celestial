/**
 * Shared frontend API and backend communication client.
 * Base URL configured via NEXT_PUBLIC_API_URL environment variable.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error connecting to backend health check:', error);
    return null;
  }
}
