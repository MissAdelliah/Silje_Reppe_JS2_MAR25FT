const API_BASE = 'https://v2.api.noroff.dev';
const API_KEY = 'bf402e1b-c33f-4200-b465-1ca81148cf87';

/**
 * Builds reusable headers for Noroff API requests.
 * Adds the API key to every request and adds a Bearer token when authentication is required.
 *
 * @param {boolean} [useAuth=false] - Whether the request needs a logged-in user's access token.
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
 * Handles API responses and returns parsed response data.
 * Throws readable errors for failed API requests.
 *
 * @param {Response} response - Fetch response object.
 * @returns {Promise<object|object[]|null>} Parsed API response data, or null for 204 responses.
 * @throws {Error} If the API request fails or the user is rate limited.
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
 *
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
 * Logs in a registered user.
 *
 * @param {{email: string, password: string}} userData - Login form data.
 * @returns {Promise<object>} Logged-in user object including accessToken.
 */
export async function loginUser(userData) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

/**
 * Fetches all social posts with author data, sorted newest first.
 *
 * @returns {Promise<object[]>} Array of social post objects.
 */
export async function getPosts() {
  const response = await fetch(
    `${API_BASE}/social/posts?_author=true&sort=created&sortOrder=desc`,
    {
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}

/**
 * Fetches a single social post by ID with author data.
 *
 * @param {string|number} id - Post ID.
 * @returns {Promise<object>} Single post object.
 */
export async function getPost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}?_author=true`, {
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Creates a new social post for the logged-in user.
 *
 * @param {{title: string, body?: string, tags?: string[], media?: {url: string, alt?: string}}} postData - New post data.
 * @returns {Promise<object>} Created post object.
 */
export async function createPost(postData) {
  const response = await fetch(`${API_BASE}/social/posts`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(postData),
  });

  return handleResponse(response);
}

/**
 * Updates an existing social post owned by the logged-in user.
 *
 * @param {string|number} id - Post ID.
 * @param {{title: string, body?: string, tags?: string[], media?: {url: string, alt?: string}}} postData - Updated post data.
 * @returns {Promise<object>} Updated post object.
 */
export async function updatePost(id, postData) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(postData),
  });

  return handleResponse(response);
}

/**
 * Deletes an existing social post owned by the logged-in user.
 *
 * @param {string|number} id - Post ID.
 * @returns {Promise<null>} Null when deletion succeeds with 204 No Content.
 */
export async function deletePost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Fetches a profile by username, including posts, followers, and following.
 *
 * @param {string} name - Profile username.
 * @returns {Promise<object>} Profile object.
 */
export async function getProfile(name) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${name}?_posts=true&_followers=true&_following=true`,
    {
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}

/**
 * Follows another profile as the logged-in user.
 *
 * @param {string} name - Username of the profile to follow.
 * @returns {Promise<object>} Updated follow response.
 */
export async function followProfile(name) {
  const response = await fetch(`${API_BASE}/social/profiles/${name}/follow`, {
    method: 'PUT',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Unfollows another profile as the logged-in user.
 *
 * @param {string} name - Username of the profile to unfollow.
 * @returns {Promise<object>} Updated unfollow response.
 */
export async function unfollowProfile(name) {
  const response = await fetch(`${API_BASE}/social/profiles/${name}/unfollow`, {
    method: 'PUT',
    headers: getHeaders(true),
  });

  return handleResponse(response);
}

/**
 * Searches social posts by title or body text.
 *
 * @param {string} query - Search text entered by the user.
 * @returns {Promise<object[]>} Array of matching post objects.
 */
export async function searchPosts(query) {
  const response = await fetch(
    `${API_BASE}/social/posts/search?q=${encodeURIComponent(query)}&_author=true`,
    {
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}

/**
 * Fetches posts from profiles that the logged-in user follows.
 *
 * @returns {Promise<object[]>} Array of posts from followed profiles.
 */
export async function getFollowingPosts() {
  const response = await fetch(
    `${API_BASE}/social/posts/following?_author=true`,
    {
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}

/**
 * Fetches posts filtered by one tag.
 *
 * @param {string} tag - Tag to filter posts by.
 * @returns {Promise<object[]>} Array of posts matching the tag.
 */
export async function getPostsByTag(tag) {
  const response = await fetch(
    `${API_BASE}/social/posts?_author=true&_tag=${encodeURIComponent(
      tag,
    )}&sort=created&sortOrder=desc`,
    {
      headers: getHeaders(true),
    },
  );

  return handleResponse(response);
}
