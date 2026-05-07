import { getPosts } from './api.js';

const postList = document.querySelector('#all-post-list');

function formatPostTime(isoString) {
  if (!isoString) return 'time stamp';

  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card post-card--clickable';

  const header = document.createElement('header');
  header.className = 'post-card__header';

  const avatar = document.createElement('img');
  avatar.className = 'post-card__avatar';
  avatar.src = post.author?.avatar?.url || 'https://placehold.co/40x40?text=U';
  avatar.alt = `${post.author?.name || 'User'} avatar`;

  const username = document.createElement('strong');
  username.className = 'post-card__username';
  username.textContent = `@${post.author?.name || 'Unknown'}`;

  const time = document.createElement('time');
  time.className = 'post-card__time';
  time.textContent = formatPostTime(post.created);

  const body = document.createElement('p');
  body.className = 'post-card__body';
  body.textContent = post.body || post.title || 'No post text.';

  const image = document.createElement('img');
  image.className = 'post-card__image';
  image.src = post.media?.url || 'https://placehold.co/600x300?text=Post';
  image.alt = post.media?.alt || post.title || 'Post image';

  header.append(avatar, username, time);
  card.append(header, body, image);

  card.addEventListener('click', () => {
    window.location.href = `./single.html?id=${post.id}`;
  });

  return card;
}

function renderPosts(posts) {
  postList.innerHTML = '';

  if (!posts.length) {
    postList.innerHTML = '<p class="status">No posts found.</p>';
    return;
  }

  posts.forEach((post) => {
    postList.append(createCard(post));
  });
}

async function loadPosts() {
  try {
    postList.innerHTML = '<p class="status">Loading posts...</p>';

    const posts = await getPosts();
    renderPosts(posts);
  } catch (error) {
    postList.innerHTML = `<p class="status">${error.message}</p>`;
  }
}

loadPosts();
