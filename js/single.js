import {
  getPost,
  getProfile,
  followProfile,
  unfollowProfile,
  deletePost,
} from './api.js';

import {
  getUser,
  clearUser,
  requireLogin,
  showMessage,
  formatPostTime,
} from './utils.js';

requireLogin('../account/login.html');

const loginLink = document.querySelector('#feed-login-link');
const menuBtn = document.querySelector('#feed-menu-btn');
const dropdown = document.querySelector('#feed-dropdown');
const logoutBtn = document.querySelector('#logout-btn');

const authorAvatarLink = document.querySelector(
  '.single-author-card__avatar-link',
);
const authorAvatar = document.querySelector('.single-author-card__avatar');
const authorName = document.querySelector('.single-author-card__name');
const authorBio = document.querySelector('.single-author-card__bio');
const authorStats = document.querySelector('.single-author-card__stats');
const followBtn = document.querySelector('#follow-btn');
const singlePost = document.querySelector('#single-post');

const user = getUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

let currentPost;
let currentAuthorProfile;
let isFollowing = false;

function getProfileUrl(name) {
  return `../account/profile.html?name=${encodeURIComponent(name)}`;
}

function isOwnProfile(profileName) {
  return profileName?.toLowerCase() === user?.name?.toLowerCase();
}

function checkIsFollowing(profile) {
  const followers = profile.followers || [];

  return followers.some(
    (follower) => follower.name?.toLowerCase() === user?.name?.toLowerCase(),
  );
}

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

function renderAuthorCard(profile) {
  const profileUrl = getProfileUrl(profile.name);

  authorAvatar.src = profile.avatar?.url || 'https://placehold.co/60x60?text=U';
  authorAvatar.alt = profile.avatar?.alt || `${profile.name} avatar`;

  authorAvatarLink.href = profileUrl;

  authorName.textContent = profile.name;
  authorName.href = profileUrl;

  authorBio.textContent = profile.bio || 'No bio';

  authorStats.textContent = `${profile._count?.followers || 0} followers · ${
    profile._count?.following || 0
  } following`;

  if (isOwnProfile(profile.name)) {
    followBtn.hidden = true;
    followBtn.disabled = true;
    return;
  }

  followBtn.hidden = false;
  followBtn.disabled = false;
  followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
}

function renderSinglePost(post) {
  const isOwner = isOwnProfile(post.author?.name);

  singlePost.innerHTML = '';

  const article = document.createElement('article');
  article.className = 'single-post-card';

  const header = document.createElement('header');
  header.className = 'single-post-card__header';

  const time = document.createElement('time');
  time.className = 'single-post-card__time';
  time.textContent = formatPostTime(post.created);

  if (post.created) {
    time.dateTime = post.created;
  }

  header.append(time);

  const title = document.createElement('h1');
  title.className = 'single-post-card__title';
  title.textContent = post.title || 'Untitled post';

  const body = document.createElement('p');
  body.className = 'single-post-card__body';
  body.textContent = post.body || 'No post text.';

  const image = document.createElement('img');
  image.className = 'single-post-card__image';
  image.src = post.media?.url || 'https://placehold.co/600x300?text=Post';
  image.alt = post.media?.alt || post.title || 'Post image';

  article.append(header, title, body, image);

  if (post.author?.name) {
    const profileLink = document.createElement('a');
    profileLink.className = 'single-post-card__author-link';
    profileLink.href = getProfileUrl(post.author.name);
    profileLink.textContent = `View ${post.author.name}'s profile`;

    article.append(profileLink);
  }

  if (isOwner) {
    const ownerActions = document.createElement('div');
    ownerActions.className = 'single-post-card__owner-actions';

    const editLink = document.createElement('a');
    editLink.className = 'btn btn--primary';
    editLink.href = `./edit.html?id=${post.id}`;
    editLink.textContent = 'Edit post';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--danger';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete post';

    deleteBtn.addEventListener('click', async () => {
      const shouldDelete = confirm('Sure you want to delete this post?');

      if (!shouldDelete) return;

      try {
        await deletePost(post.id);
        window.location.href = './index.html';
      } catch (error) {
        showMessage(singlePost, error.message);
      }
    });

    ownerActions.append(editLink, deleteBtn);
    article.append(ownerActions);
  }

  singlePost.append(article);
}

async function loadSinglePost() {
  if (!postId) {
    singlePost.innerHTML = '<p class="status">Missing post id.</p>';
    return;
  }

  try {
    singlePost.innerHTML = '<p class="status">Loading post...</p>';

    currentPost = await getPost(postId);

    const authorNameValue = currentPost.author?.name;

    if (authorNameValue) {
      currentAuthorProfile = await getProfile(authorNameValue);
      isFollowing = checkIsFollowing(currentAuthorProfile);
      renderAuthorCard(currentAuthorProfile);
    }

    renderSinglePost(currentPost);
  } catch (error) {
    singlePost.innerHTML = '<p class="status">Could not load post.</p>';
  }
}

followBtn?.addEventListener('click', async () => {
  if (!currentAuthorProfile || !user) return;

  if (isOwnProfile(currentAuthorProfile.name)) {
    followBtn.hidden = true;
    followBtn.disabled = true;
    return;
  }

  try {
    followBtn.disabled = true;

    if (isFollowing) {
      await unfollowProfile(currentAuthorProfile.name);
    } else {
      await followProfile(currentAuthorProfile.name);
    }

    currentAuthorProfile = await getProfile(currentAuthorProfile.name);
    isFollowing = checkIsFollowing(currentAuthorProfile);

    renderAuthorCard(currentAuthorProfile);
  } catch (error) {
    singlePost.innerHTML = `<p class="status">${error.message}</p>`;
  } finally {
    if (!isOwnProfile(currentAuthorProfile?.name)) {
      followBtn.disabled = false;
    }
  }
});

initHeader();
loadSinglePost();
