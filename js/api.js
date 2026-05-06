const API_BASE = 'https://v2.api.noroff.dev';
const API_KEY = 'bf402e1b-c33f-4200-b465-1ca81148cf87';

/**
 * Builds reusable headers for Noroff API requests.
 * @param {boolean} useAuth - Whether the request needs a bearer token.
 * @returns {HeadersInit} Headers used for the API request.
 * @throws {Error} If authentication is required but no user token exists.
 */
function getHeaders(useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Noroff-API-Key': API_KEY,
  };

  if (useAuth) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user?.accessToken) {
      throw new Error('You must be logged in to do this.');
    }

    headers.Authorization = `Bearer ${user.accessToken}`;
  }

  return headers;
}

/**
 * Handles API responses and throws readable errors if a request fails.
 * @param {Response} response - Fetch response object.
 * @returns {Promise<object|null>} Parsed API response data.
 * @throws {Error} If the API request fails.
 */
async function handleResponse(response) {
  const json = response.status === 204 ? null : await response.json();

  if (response.status === 429) {
    throw new Error('You are doing this too often. Please wait and try again.');
  }

  if (!response.ok) {
    throw new Error(json?.errors?.[0]?.message || 'Something went wrong.');
  }

  return json?.data ?? json;
}

/**
 * Registers a new user with the Noroff API.
 * @param {{name: string, email: string, password: string}} userData - Register form data.
 * @returns {Promise<object>} Registered user profile.
 */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

/**
 * Logs in a registered user and returns the user object including accessToken.
 * @param {{email: string, password: string}} userData - Login form data.
 * @returns {Promise<object>} Logged-in user object.
 */
export async function loginUser(userData) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function getPosts() {
  const response = await fetch(`${API_BASE}/social/posts?_author=true`, {
    headers: getHeaders(false),
  });

  return handleResponse(response);
}

export async function getPost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}?_author=true`, {
    headers: getHeaders(false),
  });

  return handleResponse(response);
}

export async function createPost(postData) {
  const response = await fetch(`${API_BASE}/social/posts`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(postData),
  });

  return handleResponse(response);
}

export async function updatePost(id, postData) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(postData),
  });

  return handleResponse(response);
}

export async function deletePost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

export async function getProfile(name) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${name}?_posts=true`,
    {
      headers: getHeaders(false),
    },
  );

  return handleResponse(response);
}

export async function followProfile(name) {
  const response = await fetch(`${API_BASE}/social/profiles/${name}/follow`, {
    method: 'PUT',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

export async function unfollowProfile(name) {
  const response = await fetch(`${API_BASE}/social/profiles/${name}/unfollow`, {
    method: 'PUT',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Searches posts by title or body text.
 * @param {string} query - Search text entered by the user.
 * @returns {Promise<object[]>} Array of matching post objects.
 */
export async function searchPosts(query) {
  const response = await fetch(
    `${API_BASE}/social/posts/search?q=${encodeURIComponent(query)}&_author=true`,
    {
      headers: getHeaders(false),
    },
  );

  return handleResponse(response);
}
