import { getProfile, followProfile, unfollowProfile } from './api.js';
import { getUser, createPostCard } from './utils.js';

const profileAvatar = document.querySelector('.profile-card__avatar');
const profileName = document.querySelector('.profile-card__name');
const profileStats = document.querySelector('.profile-card__stats');
const profileBio = document.querySelector('.profile-card__bio');
const profilePosts = document.querySelector('#profile-posts');
const followBtn = document.querySelector('#follow-btn');
const createShortcut = document.querySelector('.create-shortcut');

const loggedInUser = getUser();
const params = new URLSearchParams(window.location.search);
const profileNameFromUrl = params.get('name');

let currentProfile;
let isFollowing = false;

function getProfileToLoad() {
  if (profileNameFromUrl) return profileNameFromUrl;
  return loggedInUser?.name;
}

function checkIsFollowing(profile) {
  const followers = profile.followers || [];
  return followers.some((follower) => follower.name === loggedInUser?.name);
}

function updateFollowButton() {
  if (!followBtn || !currentProfile || !loggedInUser) return;

  const isOwnProfile = currentProfile.name === loggedInUser.name;

  if (isOwnProfile) {
    followBtn.hidden = true;
    return;
  }

  followBtn.hidden = false;
  followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
}

function renderProfile(profile) {
  profileAvatar.src =
    profile.avatar?.url || 'https://placehold.co/60x60?text=U';
  profileAvatar.alt = profile.avatar?.alt || `${profile.name} avatar`;

  profileName.textContent = profile.name;

  profileStats.textContent = `${profile._count?.followers || 0} followers · ${
    profile._count?.following || 0
  } following`;

  profileBio.textContent = profile.bio || 'No bio yet.';

  const isOwnProfile = profile.name === loggedInUser?.name;

  if (createShortcut) {
    createShortcut.hidden = !isOwnProfile;
  }
}

function renderProfilePosts(posts) {
  profilePosts.innerHTML = '';

  if (!posts.length) {
    profilePosts.innerHTML = '<p class="status">No posts yet.</p>';
    return;
  }

  const isOwnProfile = currentProfile.name === loggedInUser?.name;

  posts.forEach((post) => {
    profilePosts.append(createPostCard(post, { showEdit: isOwnProfile }));
  });
}

async function loadProfile() {
  const nameToLoad = getProfileToLoad();

  if (!nameToLoad) {
    window.location.href = './account/login.html';
    return;
  }

  try {
    profilePosts.innerHTML = '<p class="status">Loading profile...</p>';

    currentProfile = await getProfile(nameToLoad);
    isFollowing = checkIsFollowing(currentProfile);

    renderProfile(currentProfile);
    renderProfilePosts(currentProfile.posts || []);
    updateFollowButton();
  } catch (error) {
    profilePosts.innerHTML = '<p class="status">Could not load profile.</p>';
  }
}

followBtn?.addEventListener('click', async () => {
  if (!currentProfile || !loggedInUser) return;

  try {
    followBtn.disabled = true;

    if (isFollowing) {
      await unfollowProfile(currentProfile.name);
    } else {
      await followProfile(currentProfile.name);
    }

    await loadProfile();
  } catch (error) {
    profilePosts.innerHTML = `<p class="status">${error.message}</p>`;
  } finally {
    followBtn.disabled = false;
  }
});

loadProfile();
