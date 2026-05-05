import { registerUser } from './api.js';
import {
  showMessage,
  isValidNoroffEmail,
  initPasswordToggle,
  validateForm,
  wireValidation,
} from './utils.js';

const registerForm = document.querySelector('#register-form');
const messageBox = document.querySelector('#message');

initPasswordToggle({
  inputSelector: 'input[name="password"]',
  toggleSelector: '.password-toggle',
  iconSelector: '.password-icon',
  openIcon: '../icons/openeye.png',
  closedIcon: '../icons/closedeye.png',
});

wireValidation(registerForm);

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm(registerForm)) {
    showMessage(messageBox, 'Please fill in the highlighted fields.');
    return;
  }

  const formData = new FormData(registerForm);
  const userData = Object.fromEntries(formData);

  userData.name = userData.name.trim();
  userData.email = userData.email.trim();
  userData.password = userData.password.trim();

  if (!isValidNoroffEmail(userData.email)) {
    showMessage(messageBox, 'You must use a stud.noroff.no email address.');
    return;
  }

  try {
    showMessage(messageBox, 'Creating account...');

    await registerUser(userData);

    showMessage(messageBox, 'Successful! Redirecting...');

    setTimeout(() => {
      window.location.href = './login.html';
    }, 500);
  } catch (error) {
    showMessage(messageBox, error.message);
  }
});
