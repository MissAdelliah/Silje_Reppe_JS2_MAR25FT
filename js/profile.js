import { getProfile, followProfile, unfollowProfile } from './api.js';
import { getUser, clearUser, createPostCard } from './utils.js';

const avatarLink = document.querySelector('.single-author-card__avatar-link');
const avatar = document.querySelector('.single-author-card__avatar');
const profileName = document.querySelector('.single-author-card__name');
const profileBio = document.querySelector('.single-author-card__bio');
const profileStats = document.querySelector('.single-author-card__stats');
const followBtn = document.querySelector('#follow-btn');
const profilePosts = document.querySelector('#profile-posts');
const createShortcut = document.querySelector('.create-shortcut');
const logoutBtn = document.querySelector('#logout-btn');
const loginLink = document.querySelector('#feed-login-link');
const menuBtn = document.querySelector('#feed-menu-btn');
const dropdown = document.querySelector('#feed-dropdown');

const loggedInUser = getUser();

const params = new URLSearchParams(window.location.search);
const profileNameFromUrl = params.get('name');

let currentProfile;
let isFollowing = false;

function getProfileToLoad() {
  if (profileNameFromUrl) return profileNameFromUrl;
  return loggedInUser?.name;
}

function getProfileUrl(name) {
  return `./profile.html?name=${encodeURIComponent(name)}`;
}

function isOwnProfile(profile) {
  return profile?.name?.toLowerCase() === loggedInUser?.name?.toLowerCase();
}

function checkIsFollowing(profile) {
  const followers = profile.followers || [];

  return followers.some(
    (follower) =>
      follower.name?.toLowerCase() === loggedInUser?.name?.toLowerCase(),
  );
}

function updateFollowButton() {
  if (!followBtn || !currentProfile) return;

  if (!loggedInUser?.name || isOwnProfile(currentProfile)) {
    followBtn.hidden = true;
    followBtn.disabled = true;
    return;
  }

  followBtn.hidden = false;
  followBtn.disabled = false;
  followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
}

function renderProfile(profile) {
  const profileUrl = getProfileUrl(profile.name);

  avatar.src = profile.avatar?.url || 'https://placehold.co/60x60?text=U';
  avatar.alt = profile.avatar?.alt || `${profile.name} avatar`;

  avatarLink.href = profileUrl;

  profileName.textContent = profile.name;
  profileName.href = profileUrl;

  profileBio.textContent = profile.bio || 'No bio yet.';

  profileStats.textContent = `${profile._count?.followers || 0} followers · ${
    profile._count?.following || 0
  } following`;

  if (createShortcut) {
    createShortcut.hidden = !isOwnProfile(profile);
  }

  updateFollowButton();
}

function renderProfilePosts(posts) {
  profilePosts.innerHTML = '';

  if (!posts.length) {
    profilePosts.innerHTML = '<p class="status">No posts yet.</p>';
    return;
  }

  posts.forEach((post) => {
    const postWithAuthor = {
      ...post,
      author: {
        name: currentProfile.name,
        avatar: currentProfile.avatar,
      },
    };

    profilePosts.append(
      createPostCard(postWithAuthor, {
        showEdit: isOwnProfile(currentProfile),
      }),
    );
  });
}
function initHeader() {
  if (!loginLink || !menuBtn) return;

  if (!loggedInUser?.accessToken) {
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
}
async function loadProfile() {
  const nameToLoad = getProfileToLoad();

  if (!nameToLoad) {
    window.location.href = './login.html';
    return;
  }

  try {
    profilePosts.innerHTML = '<p class="status">Loading profile...</p>';

    currentProfile = await getProfile(nameToLoad);
    isFollowing = checkIsFollowing(currentProfile);

    renderProfile(currentProfile);
    renderProfilePosts(currentProfile.posts || []);
  } catch (error) {
    profilePosts.innerHTML = '<p class="status">Could not load profile.</p>';
  }
}

followBtn?.addEventListener('click', async () => {
  if (!currentProfile || !loggedInUser) return;

  if (isOwnProfile(currentProfile)) {
    followBtn.hidden = true;
    followBtn.disabled = true;
    return;
  }

  try {
    followBtn.disabled = true;

    if (isFollowing) {
      await unfollowProfile(currentProfile.name);
    } else {
      await followProfile(currentProfile.name);
    }

    currentProfile = await getProfile(currentProfile.name);
    isFollowing = checkIsFollowing(currentProfile);

    renderProfile(currentProfile);
    renderProfilePosts(currentProfile.posts || []);
  } catch (error) {
    profilePosts.innerHTML = `<p class="status">${error.message}</p>`;
  } finally {
    updateFollowButton();
  }
});

logoutBtn?.addEventListener('click', () => {
  clearUser();
  window.location.href = './login.html';
});

initHeader();
loadProfile();
