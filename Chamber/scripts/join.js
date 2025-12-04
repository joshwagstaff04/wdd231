
const timestampInput = document.querySelector('#timestamp');

if (timestampInput) {
  
  timestampInput.value = new Date().toISOString();
}


const menuToggle = document.querySelector('#menu-toggle');
const primaryNav = document.querySelector('#primary-nav');

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    primaryNav.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });
}


const infoButtons = document.querySelectorAll('.membership-info');
const closeButtons = document.querySelectorAll('[data-close-modal]');
const dialogs = document.querySelectorAll('dialog.membership-modal');

infoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const modalId = button.getAttribute('data-modal-target');
    const dialog = document.getElementById(modalId);

    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = button.closest('dialog');
    if (dialog) {
      dialog.close();
    }
  });
});


dialogs.forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!clickedInDialog) {
      dialog.close();
    }
  });
});
