import { initPasswordToggle } from './utils.js';
// Hide / shows password
initPasswordToggle({
  inputSelector: 'input[name="password"]',
  toggleSelector: '.password-toggle',
  iconSelector: '.password-icon',
  openIcon: '../icons/openeye.png',
  closedIcon: '../icons/closedeye.png',
});
