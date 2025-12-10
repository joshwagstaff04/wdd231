let modal;
let modalOverlay;
let modalClose;
let modalContent;

export function initModal() {
  modal = document.querySelector('.modal');
  if (!modal) return;

  modalOverlay = modal.querySelector('.modal-overlay');
  modalClose = modal.querySelector('.modal-close');
  modalContent = modal.querySelector('.modal-content');

  modalOverlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

export function openModal(html) {
  if (!modal) return;
  modalContent.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

export function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}
