import './styles.css';
import 'katex/dist/katex.min.css';

import * as go from '../wailsjs/go/main/App';
import { setConfig, getConfig } from './core/state.js';
import { initEditor, setContentChangeCallback, lockEditor } from './core/editor.js';
import { updatePreview, togglePreview } from './core/preview.js';
import { initToolbarIcons } from './ui/icons.js';
import { setupEventListeners, updateVimStatus } from './ui/events.js';
import { loadFileTree } from './features/fileTree.js';
import { loadZoomLevel, applyZoom } from './features/zoom.js';
import { loadPanelSizes, initResizers, updateEditorPreviewLayout } from './features/panels.js';
import { applyTheme } from './features/theme.js';
import { saveCurrentFile } from './features/fileOps.js';

async function init() {
    try {
        initToolbarIcons();
        loadZoomLevel();
        
        const config = await go.GetConfig();
        setConfig(config);
        
        applyTheme(config.theme);
        await loadFileTree();
        
        initEditor();
        lockEditor();
        
        setupEventListeners();
        
        setContentChangeCallback(() => {
            updatePreview();
        });
        
        updateVimStatus();
        
        initResizers();
        loadPanelSizes();
        applyZoom();
        
    } catch (err) {
        console.error('Init error:', err);
    }
}

init();
