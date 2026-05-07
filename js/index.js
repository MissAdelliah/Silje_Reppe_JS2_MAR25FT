import { getPosts, getFollowingPosts, searchPosts } from './api.js';
import { getUser, clearUser, createPostCard } from './utils.js';

const allPostList = document.querySelector('#all-post-list');
const followingPostList = document.querySelector('#following-post-list');
const followingMessage = document.querySelector('#following-message');
const searchInput = document.querySelector('#search-input');
const tagNavEl = document.querySelector('#tag-nav');

const loginLink = document.querySelector('#feed-login-link');
const menuBtn = document.querySelector('#feed-menu-btn');
const dropdown = document.querySelector('#feed-dropdown');
const logoutBtn = document.querySelector('#logout-btn');

const user = getUser();

let allPosts = [];
let activeTag = '';
let searchTimer;

function initHeader() {
  if (!loginLink || !menuBtn) return;

  if (!user?.accessToken) {
    loginLink.hidden = false;
    menuBtn.hidden = true;
    return;
  }

  loginLink.hidden = true;
  menuBtn.hidden = false;

  menuBtn.addEventListener('click', () => {
    if (!dropdown) return;

    const isOpen = !dropdown.hasAttribute('hidden');

    if (isOpen) {
      dropdown.setAttribute('hidden', '');
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.removeAttribute('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    clearUser();
    window.location.href = '../account/login.html';
  });
}

function sortNewestFirst(posts) {
  return posts.slice().sort((a, b) => {
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
}

function renderPosts(container, posts, emptyMessage = 'No posts found.') {
  if (!container) return;

  container.innerHTML = '';

  if (!posts || !posts.length) {
    container.innerHTML = `<p class="status">${emptyMessage}</p>`;
    return;
  }

  sortNewestFirst(posts).forEach((post) => {
    container.append(createPostCard(post, { clickable: true }));
  });
}

function buildTagNav(posts) {
  if (!tagNavEl) return;

  const tagSet = new Set();

  posts.forEach((post) => {
    (post?.tags || []).forEach((tagValue) => {
      const tag = String(tagValue || '').trim();
      if (tag) tagSet.add(tag);
    });
  });

  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  tagNavEl.innerHTML = '';

  function addTagButton(label, value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-btn';
    button.textContent = label;
    button.dataset.tag = value;

    if (value === activeTag) {
      button.classList.add('filter-btn--active');
    }

    button.addEventListener('click', () => {
      activeTag = button.dataset.tag || '';

      tagNavEl.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.classList.remove('filter-btn--active');
      });

      button.classList.add('filter-btn--active');

      renderFilteredPostList();
    });

    tagNavEl.append(button);
  }

  addTagButton('All', '');

  tags.forEach((tag) => {
    addTagButton(tag, tag);
  });

  if (!tagNavEl.querySelector('.filter-btn--active')) {
    tagNavEl.querySelector('.filter-btn')?.classList.add('filter-btn--active');
    activeTag = '';
  }
}

function getFilteredPostsSorted() {
  const sorted = sortNewestFirst(allPosts);

  if (!activeTag) return sorted;

  return sorted.filter((post) =>
    (post?.tags || []).some(
      (tag) => tag.toLowerCase() === activeTag.toLowerCase(),
    ),
  );
}

function renderFilteredPostList() {
  const filteredPosts = getFilteredPostsSorted();

  renderPosts(
    allPostList,
    filteredPosts,
    activeTag ? `No posts found for ${activeTag}.` : 'No posts found.',
  );
}

async function loadAllPosts() {
  try {
    allPostList.innerHTML = '<p class="status">Loading posts...</p>';

    allPosts = await getPosts();

    activeTag = '';
    buildTagNav(allPosts);
    renderFilteredPostList();
  } catch (error) {
    allPostList.innerHTML = '<p class="status">Could not load posts.</p>';
  }
}

async function loadFollowingPosts() {
  if (!user?.accessToken) {
    followingMessage.textContent =
      'Log in and follow users to see their posts.';
    followingPostList.innerHTML = '';
    return;
  }

  try {
    followingMessage.textContent = '';
    followingPostList.innerHTML =
      '<p class="status">Loading following posts...</p>';

    const posts = await getFollowingPosts();

    if (!posts.length) {
      followingMessage.textContent = 'No posts from followed users yet.';
      followingPostList.innerHTML = '';
      return;
    }

    renderPosts(followingPostList, posts);
  } catch (error) {
    followingMessage.textContent = 'No posts from followed users yet.';
    followingPostList.innerHTML = '';
  }
}

searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(async () => {
    const query = searchInput.value.trim();

    activeTag = '';
    buildTagNav(allPosts);

    if (!query) {
      renderFilteredPostList();
      return;
    }

    try {
      allPostList.innerHTML = '<p class="status">Searching...</p>';

      const results = await searchPosts(query);

      renderPosts(allPostList, results, 'No matching posts found.');
    } catch (error) {
      allPostList.innerHTML = '<p class="status">Search failed.</p>';
    }
  }, 400);
});

initHeader();
loadFollowingPosts();
loadAllPosts();
