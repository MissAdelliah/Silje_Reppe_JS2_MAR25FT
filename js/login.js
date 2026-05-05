import { loginUser } from './api.js';
import {
  saveUser,
  showMessage,
  initPasswordToggle,
  validateForm,
  wireValidation,
} from './utils.js';

const loginForm = document.querySelector('#login-form');
const messageBox = document.querySelector('#message');

initPasswordToggle({
  inputSelector: 'input[name="password"]',
  toggleSelector: '.password-toggle',
  iconSelector: '.password-icon',
  openIcon: '../icons/openeye.png',
  closedIcon: '../icons/closedeye.png',
});
wireValidation(loginForm);

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm(loginForm)) {
    showMessage(messageBox, 'Please fill in the highlighted fields.');
    return;
  }
  const formData = new FormData(loginForm);
  const userData = Object.fromEntries(formData);

  userData.email = userData.email.trim();
  userData.password = userData.password.trim();

  try {
    showMessage(messageBox, 'Logging in...');

    const user = await loginUser(userData);

    saveUser(user);

    showMessage(messageBox, 'Successful! Redirecting...');

    setTimeout(() => {
      window.location.href = '../post/index.html';
    }, 500);
  } catch (error) {
    showMessage(messageBox, error.message);
  }
});
