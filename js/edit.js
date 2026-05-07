import { getPost, updatePost, deletePost } from './api.js';
import { getUser, clearUser, requireLogin, showMessage } from './utils.js';

requireLogin('../account/login.html');

const form = document.querySelector('#edit-form');
const messageBox = document.querySelector('#message');
const mediaUrlInput = document.querySelector('#mediaUrl');
const mediaPreview = document.querySelector('#media-preview');
const deleteBtn = document.querySelector('#delete-btn');
const headerAvatar = document.querySelector('#header-avatar');

const loginLink = document.querySelector('#feed-login-link');
const menuBtn = document.querySelector('#feed-menu-btn');
const dropdown = document.querySelector('#feed-dropdown');
const logoutBtn = document.querySelector('#logout-btn');

const user = getUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

let currentPost;

/**
 * Converts a comma-separated tag string into an array of clean tags.
 * @param {string} tagsString - Tags written by the user, separated by commas.
 * @returns {string[]} Array of cleaned tag strings.
 */
function parseTags(tagsString) {
  if (!tagsString) return [];

  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
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

function renderHeaderAvatar() {
  if (!headerAvatar || !user) return;

  headerAvatar.src = user.avatar?.url || 'https://placehold.co/40x40?text=U';
  headerAvatar.alt = user.avatar?.alt || `${user.name} avatar`;
}

function updateMediaPreview() {
  if (!mediaPreview || !mediaUrlInput) return;

  const imageUrl = mediaUrlInput.value.trim();

  mediaPreview.src = imageUrl || 'https://placehold.co/600x300?text=Post+image';
}

function buildPostData(formElement) {
  const formData = new FormData(formElement);
  const values = Object.fromEntries(formData);

  const postData = {
    title: values.title?.trim() || '',
    body: values.body?.trim() || '',
    tags: parseTags(values.tags || ''),
  };

  const imageUrl = values.mediaUrl?.trim() || '';

  if (imageUrl) {
    postData.media = {
      url: imageUrl,
      alt: postData.title || 'Post image',
    };
  }

  return postData;
}

function fillForm(post) {
  form.title.value = post.title || '';
  form.body.value = post.body || '';
  form.tags.value = (post.tags || []).join(', ');
  form.mediaUrl.value = post.media?.url || '';

  updateMediaPreview();
}

function isPostOwner(post) {
  return post.author?.name?.toLowerCase() === user?.name?.toLowerCase();
}

function disableForm() {
  form.querySelectorAll('input, textarea, button').forEach((element) => {
    element.disabled = true;
  });
}

async function loadPostForEditing() {
  if (!postId) {
    showMessage(messageBox, 'Missing post id.');
    disableForm();
    return;
  }

  try {
    showMessage(messageBox, 'Loading post...');

    currentPost = await getPost(postId);

    fillForm(currentPost);

    if (!isPostOwner(currentPost)) {
      showMessage(messageBox, 'You can only edit your own posts.');
      disableForm();
      return;
    }

    showMessage(messageBox, '');
  } catch (error) {
    showMessage(messageBox, error.message);
    disableForm();
  }
}

mediaPreview?.addEventListener('error', () => {
  mediaPreview.src = 'https://placehold.co/600x300?text=Invalid+image';
});

mediaUrlInput?.addEventListener('input', updateMediaPreview);

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!currentPost || !isPostOwner(currentPost)) {
    showMessage(messageBox, 'You can only edit your own posts.');
    return;
  }

  const postData = buildPostData(form);

  if (!postData.title) {
    showMessage(messageBox, 'Topic is required.');
    return;
  }

  if (postData.title.length > 280) {
    showMessage(messageBox, 'Topic must be 280 characters or less.');
    return;
  }

  if (postData.body.length > 280) {
    showMessage(messageBox, 'Post text must be 280 characters or less.');
    return;
  }

  try {
    showMessage(messageBox, 'Saving changes...');

    await updatePost(postId, postData);

    showMessage(messageBox, 'Post updated. Redirecting...');

    setTimeout(() => {
      window.location.href = `./single.html?id=${postId}`;
    }, 500);
  } catch (error) {
    showMessage(messageBox, error.message);
  }
});

deleteBtn?.addEventListener('click', async () => {
  if (!currentPost || !isPostOwner(currentPost)) {
    showMessage(messageBox, 'You can only delete your own posts.');
    return;
  }

  const shouldDelete = confirm('Sure you want to delete this post?');

  if (!shouldDelete) return;

  try {
    showMessage(messageBox, 'Deleting post...');

    await deletePost(postId);

    showMessage(messageBox, 'Post deleted. Redirecting...');

    setTimeout(() => {
      window.location.href = './index.html';
    }, 500);
  } catch (error) {
    showMessage(messageBox, error.message);
  }
});

initHeader();
renderHeaderAvatar();
loadPostForEditing();
