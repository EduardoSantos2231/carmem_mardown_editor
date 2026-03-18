import { icons } from '../icons/index.js';

export { icons };

export function initToolbarIcons() {
    const buttons = {
        'btn-sidebar-toggle': { icon: icons.panelLeft, tooltip: 'Alternar barra lateral' },
        'btn-new-file': { icon: icons.filePlus, tooltip: 'Novo arquivo' },
        'btn-new-folder': { icon: icons.folderPlus, tooltip: 'Nova pasta' },
        'btn-delete': { icon: icons.trash2, tooltip: 'Excluir item' },
        'btn-rename': { icon: icons.edit3, tooltip: 'Renomear item' },
        'btn-vim': { icon: icons.keyboard, tooltip: 'Modo Vim' },
        'btn-preview': { icon: icons.eye, tooltip: 'Alternar preview' },
        'btn-theme': { icon: icons.sun, tooltip: 'Alternar tema' }
    };

    Object.entries(buttons).forEach(([id, { icon, tooltip }]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.innerHTML = icon;
            btn.setAttribute('data-tooltip', tooltip);
            btn.classList.add('has-tooltip');
        }
    });
}

export function updateVimButton(isActive) {
    const btn = document.getElementById('btn-vim');
    if (btn) {
        btn.classList.toggle('active', isActive);
    }
}

export function updatePreviewButton(isActive) {
    const btn = document.getElementById('btn-preview');
    if (btn) {
        btn.classList.toggle('active', isActive);
    }
}

export default {
    initToolbarIcons,
    updateVimButton,
    updatePreviewButton
};
