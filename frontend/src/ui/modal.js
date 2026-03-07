export function showModal(title, placeholder, callback) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <input type="text" placeholder="${placeholder}" />
            <div class="modal-buttons">
                <button class="cancel">Cancel</button>
                <button class="primary">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const input = modal.querySelector('input');
    input.focus();
    
    modal.querySelector('.cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('.primary').addEventListener('click', () => {
        if (input.value.trim()) {
            callback(input.value.trim());
            modal.remove();
        }
    });
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (input.value.trim()) {
                callback(input.value.trim());
                modal.remove();
            }
        } else if (e.key === 'Escape') {
            modal.remove();
        }
    });
}

export function showConfirm(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="cancel">Cancel</button>
                <button class="primary">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.cancel').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });
    modal.querySelector('.primary').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

export default {
    showModal,
    showConfirm
};
