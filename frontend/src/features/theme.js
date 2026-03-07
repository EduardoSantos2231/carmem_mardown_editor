import * as go from '../../wailsjs/go/main/App';
import { getConfig, setConfig } from '../core/state.js';
import { recreateEditor } from '../core/editor.js';
import { setPreviewButtonActive } from '../core/preview.js';

export function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
}

export async function toggleTheme() {
    const config = getConfig();
    const newTheme = config.theme === 'dark' ? 'light' : 'dark';
    
    try {
        await go.SetTheme(newTheme);
        config.theme = newTheme;
        setConfig(config);
        
        applyTheme(newTheme);
        recreateEditor();
        
        const previewEl = document.getElementById('preview');
        if (previewEl && !previewEl.classList.contains('hidden')) {
            setPreviewButtonActive(true);
        }
    } catch (err) {
        console.error('Error toggling theme:', err);
    }
}

export default {
    applyTheme,
    toggleTheme
};
