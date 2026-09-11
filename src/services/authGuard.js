let redirecting = false;

// Central 401 handling: clears the stale session stored in localStorage and
// bounces the user to the login page exactly once, instead of letting every
// home-page section toast "unauthorized invalid token" on its own.
export function handleUnauthorized() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');

  if (!redirecting) {
    redirecting = true;
    window.location.replace('/login?expired=1');
  }
}

// Shared fetch-response checker for admin services. Triggers the 401 flow and
// preserves the backend error message as the thrown Error.
export async function handleJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error(data.message || 'Session expired');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}