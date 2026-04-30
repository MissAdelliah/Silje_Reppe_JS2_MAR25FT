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
