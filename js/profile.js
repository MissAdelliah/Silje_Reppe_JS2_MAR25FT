import { followProfile, unfollowProfile } from './api.js';

button.addEventListener('click', async () => {
  if (isFollowing) {
    await unfollowProfile(name);
  } else {
    await followProfile(name);
  }
});
