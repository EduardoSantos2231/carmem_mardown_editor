import { icons } from '../icons/index.js';

export { icons };

export function initToolbarIcons() {
    const buttons = {
        'btn-new-file': icons.filePlus,
        'btn-new-folder': icons.folderPlus,
        'btn-delete': icons.trash2,
        'btn-rename': icons.edit3,
        'btn-vim': icons.keyboard,
        'btn-preview': icons.eye,
        'btn-theme': icons.sun
    };

    Object.entries(buttons).forEach(([id, icon]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.innerHTML = icon;
        }
    });
}

export default {
    initToolbarIcons
};
