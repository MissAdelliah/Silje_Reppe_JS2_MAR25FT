import { getPosts, searchPosts } from './api.js';
import { createPostCard } from './utils.js';

const postList = document.querySelector('#post-list');
const searchInput = document.querySelector('#search-input');

function renderPosts(posts) {
  postList.innerHTML = '';

  if (!posts.length) {
    postList.innerHTML = '<p class="status">No posts found.</p>';
    return;
  }

  posts.forEach((post) => {
    postList.append(createPostCard(post));
  });
}

async function loadPosts() {
  try {
    postList.innerHTML = '<p class="status">Loading posts...</p>';

    const posts = await getPosts();

    renderPosts(posts);
  } catch (error) {
    postList.innerHTML = '<p class="status">Could not load posts.</p>';
  }
}

let searchTimer;

searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(async () => {
    const query = searchInput.value.trim();

    if (!query) {
      loadPosts();
      return;
    }

    try {
      postList.innerHTML = '<p class="status">Searching...</p>';

      const results = await searchPosts(query);

      renderPosts(results);
    } catch (error) {
      postList.innerHTML = '<p class="status">Search failed.</p>';
    }
  }, 400);
});

loadPosts();
