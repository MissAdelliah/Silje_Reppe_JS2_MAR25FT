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

/**
 * Removes the logged-in user object from localStorage.
 * @returns {void}
 */
export function clearUser() {
  localStorage.removeItem('user');
}

/**
 * Checks whether a user is currently logged in.
 * @returns {boolean} True if a saved user has an accessToken.
 */
export function isLoggedIn() {
  return Boolean(getUser()?.accessToken);
}

/**
 * Redirects the user to login if they are not authenticated.
 * @param {string} [redirectPath='../account/login.html'] - Path to the login page.
 * @returns {void}
 */
export function requireLogin(redirectPath = '../account/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectPath;
  }
}

/**
 * Shows a message inside a DOM element.
 * @param {HTMLElement|null} element - Element where the message should appear.
 * @param {string} text - Message text.
 * @returns {void}
 */
export function showMessage(element, text) {
  if (!element) return;
  element.textContent = text;
}

/**
 * Checks if an email belongs to the Noroff student domain.
 * @param {string} email - Email address to validate.
 * @returns {boolean} True if the email ends with @stud.noroff.no.
 */
export function isValidNoroffEmail(email) {
  return /^[^\s@]+@stud\.noroff\.no$/.test(email);
}

/**
 * Adds password visibility toggle behavior to a password input.
 * @param {object} options - Toggle configuration.
 * @param {string} options.inputSelector - CSS selector for the password input.
 * @param {string} options.toggleSelector - CSS selector for the toggle button.
 * @param {string} options.iconSelector - CSS selector for the icon image.
 * @param {string} options.openIcon - Icon path used when password is visible.
 * @param {string} options.closedIcon - Icon path used when password is hidden.
 * @returns {void}
 */
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

    input.type = isHidden ? 'text' : 'password';
    icon.src = isHidden ? openIcon : closedIcon;
  });
}

/**
 * Validates a single form field and updates its visual validation classes.
 * @param {HTMLInputElement} field - Input field to validate.
 * @returns {boolean} True if the field is valid.
 */
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

/**
 * Validates all input fields inside a form.
 * @param {HTMLFormElement|null} form - Form element to validate.
 * @returns {boolean} True if all fields are valid.
 */
export function validateForm(form) {
  if (!form) return false;

  let isValid = true;

  form.querySelectorAll('input').forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Adds live validation events to all inputs inside a form.
 * @param {HTMLFormElement|null} form - Form element to attach validation to.
 * @returns {void}
 */
export function wireValidation(form) {
  if (!form) return;

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });
}

/**
 * Formats an ISO date string into a short time string.
 * @param {string} isoString - ISO date string from the API.
 * @returns {string} Formatted time, or fallback text if no date exists.
 */
export function formatPostTime(isoString) {
  if (!isoString) return 'time stamp';

  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Creates a reusable post card element from API post data.
 * @param {object} post - Post object from the Noroff Social API.
 * @param {number|string} post.id - Post ID.
 * @param {string} [post.title] - Post title.
 * @param {string} [post.body] - Post body text.
 * @param {string} [post.created] - Post creation date.
 * @param {{url?: string, alt?: string}} [post.media] - Post media object.
 * @param {{name?: string, avatar?: {url?: string, alt?: string}}} [post.author] - Post author object.
 * @param {object} [options] - Rendering options.
 * @param {boolean} [options.showEdit=false] - Whether to show edit link.
 * @param {boolean} [options.clickable=false] - Whether clicking the card opens the single post page.
 * @returns {HTMLElement} The created post card element.
 */
export function createPostCard(
  post,
  { showEdit = false, clickable = false } = {},
) {
  const article = document.createElement('article');
  article.className = 'post-card';

  const header = document.createElement('header');
  header.className = 'post-card__header';

  const avatar = document.createElement('img');
  avatar.className = 'post-card__avatar';
  avatar.src = post.author?.avatar?.url || 'https://placehold.co/40x40?text=U';
  avatar.alt = `${post.author?.name || 'User'} avatar`;

  const username = document.createElement('strong');
  username.className = 'post-card__username';
  username.textContent = `@${post.author?.name || 'profilename'}`;

  const time = document.createElement('time');
  time.className = 'post-card__time';
  time.textContent = formatPostTime(post.created);

  if (post.created) {
    time.dateTime = post.created;
  }

  header.append(avatar, username, time);

  if (showEdit) {
    const editLink = document.createElement('a');
    editLink.className = 'post-card__edit';
    editLink.href = `../post/edit.html?id=${post.id}`;
    editLink.textContent = 'Edit post';

    editLink.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    header.append(editLink);
  }

  const body = document.createElement('p');
  body.className = 'post-card__body';
  body.textContent = post.body || post.title || 'Text here';

  const image = document.createElement('img');
  image.className = 'post-card__image';
  image.src = post.media?.url || 'https://placehold.co/600x300?text=Post';
  image.alt = post.media?.alt || post.title || 'Post image';

  article.append(header, body, image);

  if (clickable) {
    article.classList.add('post-card--clickable');

    article.addEventListener('click', () => {
      if (!post.id) {
        console.error('Post is missing id:', post);
        return;
      }

      window.location.href = `./single.html?id=${post.id}`;
    });
  }

  return article;
}
