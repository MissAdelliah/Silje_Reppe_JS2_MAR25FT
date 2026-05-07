import { createPost } from './api.js';
import { getUser, requireLogin, showMessage } from './utils.js';

requireLogin('../account/login.html');

const form = document.querySelector('#create-form');
const messageBox = document.querySelector('#message');
const mediaUrlInput = document.querySelector('#mediaUrl');
const mediaPreview = document.querySelector('#media-preview');
const headerAvatar = document.querySelector('#header-avatar');

const user = getUser();

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
    title: values.title.trim(),
    body: values.body.trim(),
    tags: parseTags(values.tags),
  };

  const imageUrl = values.mediaUrl.trim();

  if (imageUrl) {
    postData.media = {
      url: imageUrl,
      alt: postData.title || 'Post image',
    };
  }

  return postData;
}

mediaPreview?.addEventListener('error', () => {
  mediaPreview.src = 'https://placehold.co/600x300?text=Invalid+image';
});

mediaUrlInput?.addEventListener('input', updateMediaPreview);

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

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
    showMessage(messageBox, 'Publishing...');

    await createPost(postData);

    showMessage(messageBox, 'Post published. Redirecting...');

    setTimeout(() => {
      window.location.href = './index.html';
    }, 500);
  } catch (error) {
    showMessage(messageBox, error.message);
  }
});

renderHeaderAvatar();
