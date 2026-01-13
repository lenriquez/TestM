/**
 * Reusable Modal Service for confirmation dialogs
 */

export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export class ModalService {
  private static modalIdCounter = 0;

  /**
   * Show a confirmation modal
   * Returns a Promise that resolves when confirmed, rejects when cancelled
   */
  static showConfirmation(options: ModalOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const modalId = `confirmationModal_${++this.modalIdCounter}`;
      const container = document.body;

      // Create modal HTML
      const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content custom-modal">
              <div class="modal-body custom-modal-body">
                <div class="custom-modal-content">
                  <i class="fa-solid fa-triangle-exclamation fa-2xl my-fa-2xl"></i>
                  <div class="custom-modal-text">
                    <p class="custom-modal-message">${options.message}</p>
                  </div>
                </div>
                <div class="custom-modal-footer">
                  <button type="button" class="btn-cancel-link" data-bs-dismiss="modal">${this.escapeHtml(options.cancelText || 'Cancel')}</button>
                  <button type="button" class="btn-confirm-danger" id="${modalId}ConfirmBtn">${this.escapeHtml(options.confirmText || 'Confirm')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Create a temporary container and append modal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHTML;
      const modalElement = tempDiv.firstElementChild as HTMLElement;
      container.appendChild(modalElement);

      // Get Bootstrap modal instance
      const bootstrap = (window as any).bootstrap;
      if (!bootstrap || !bootstrap.Modal) {
        console.error('Bootstrap is not loaded');
        container.removeChild(modalElement);
        reject(new Error('Bootstrap is not loaded'));
        return;
      }

      const modal = new bootstrap.Modal(modalElement);

      // Track if modal was confirmed
      let wasConfirmed = false;

      // Handle confirm button
      const confirmBtn = modalElement.querySelector(`#${modalId}ConfirmBtn`) as HTMLButtonElement;
      if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
          wasConfirmed = true;
          try {
            if (options.onConfirm) {
              await options.onConfirm();
            }
            modal.hide();
            resolve();
          } catch (error) {
            console.error('Error in confirmation callback:', error);
            wasConfirmed = false; // Reset on error
            reject(error);
          }
        });
      }

      // Handle cancel/close
      const handleCancel = () => {
        if (!wasConfirmed) {
          if (options.onCancel) {
            options.onCancel();
          }
          reject(new Error('Cancelled'));
        }
      };

      // Clean up modal when hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        container.removeChild(modalElement);
      }, { once: true });

      // Handle backdrop click, escape key, or close button as cancellation
      modalElement.addEventListener('hidden.bs.modal', () => {
        if (!wasConfirmed) {
          handleCancel();
        }
      }, { once: true });

      // Show modal
      modal.show();
    });
  }

  /**
   * Show a delete confirmation modal
   */
  static showDeleteConfirmation(_itemName: string, onConfirm: () => void | Promise<void>): Promise<void> {
    return this.showConfirmation({
      title: 'Delete Employee',
      message: `Are you sure you want to remove this employee?`,
      confirmText: 'YES, REMOVE',
      cancelText: 'CANCEL',
      confirmButtonClass: 'btn-danger',
      onConfirm,
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
