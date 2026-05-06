/**
 * Saves the logged-in user object to localStorage.
 * @param {object} user - User object returned from the login API.
 * @returns {void}
 */
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Gets the logged-in user object from localStorage.
 * @returns {object|null} The saved user object, or null if no user exists.
 */
export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function clearUser() {
  localStorage.removeItem('user');
}

export function isLoggedIn() {
  return Boolean(getUser()?.accessToken);
}

export function showMessage(element, text) {
  if (!element) return;
  element.textContent = text;
}

export function isValidNoroffEmail(email) {
  return /^[^\s@]+@stud\.noroff\.no$/.test(email);
}

//password visability toggle (reusable)
export function initPasswordToggle({
  inputSelector,
  toggleSelector,
  iconSelector,
  openIcon,
  closedIcon,
}) {
  const input = document.querySelector(inputSelector);
  const toggle = document.querySelector(toggleSelector);
  const icon = document.querySelector(iconSelector);

  if (!input || !toggle || !icon) return;

  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    //hide /show ps
    input.type = isHidden ? 'text' : 'password';
    //UI feedback
    icon.src = isHidden ? openIcon : closedIcon;
  });
}
export function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.required && !value) {
    valid = false;
  }

  if (valid && field.type === 'email') {
    valid = /^[^\s@]+@stud\.noroff\.no$/.test(value);
  }

  if (valid && field.type === 'password') {
    valid = value.length >= 8;
  }

  field.classList.remove('input--valid', 'input--invalid');

  if (value.length > 0 || field.required) {
    field.classList.add(valid ? 'input--valid' : 'input--invalid');
  }

  return valid;
}

export function validateForm(form) {
  let isValid = true;

  form.querySelectorAll('input').forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

export function wireValidation(form) {
  if (!form) return;

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });
}
export function formatPostTime(isoString) {
  if (!isoString) return 'time stamp';

  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';

  const header = document.createElement('header');
  header.className = 'post-card__header';

  const avatar = document.createElement('img');
  avatar.className = 'post-card__avatar';
  avatar.src = post.author?.avatar?.url || 'https://placehold.co/36x36?text=U';
  avatar.alt = `${post.author?.name || 'User'} avatar`;

  const username = document.createElement('strong');
  username.className = 'post-card__username';
  username.textContent = `@${post.author?.name || 'profilename'}`;

  const time = document.createElement('time');
  time.className = 'post-card__time';
  time.textContent = formatPostTime(post.created);
  if (post.created) time.dateTime = post.created;

  const body = document.createElement('p');
  body.className = 'post-card__body';
  body.textContent = post.body || post.title || 'Text here';

  const image = document.createElement('img');
  image.className = 'post-card__image';
  image.src = post.media?.url || 'https://placehold.co/600x300?text=Post';
  image.alt = post.media?.alt || post.title || 'Post image';

  header.append(avatar, username, time);
  article.append(header, body, image);

  article.addEventListener('click', () => {
    window.location.href = `./view.html?id=${post.id}`;
  });

  return article;
}
