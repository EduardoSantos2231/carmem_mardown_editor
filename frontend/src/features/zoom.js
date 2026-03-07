const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.05;
const BASE_SIZE = 16;

let zoomLevel = 1.0;

export function loadZoomLevel() {
    const savedZoom = localStorage.getItem('carmem-zoom-level');
    if (savedZoom) {
        zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseFloat(savedZoom)));
    }
    return zoomLevel;
}

export function saveZoomLevel() {
    localStorage.setItem('carmem-zoom-level', zoomLevel.toString());
}

export function getZoomLevel() {
    return zoomLevel;
}

export function applyZoom() {
    document.documentElement.style.fontSize = (BASE_SIZE * zoomLevel) + 'px';
    
    const zoomPercent = Math.round(zoomLevel * 100);
    const zoomLevelEl = document.getElementById('zoom-level');
    if (zoomLevelEl) {
        zoomLevelEl.textContent = `${zoomPercent}%`;
    }
}

export function zoomIn() {
    if (zoomLevel < ZOOM_MAX) {
        zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
        applyZoom();
        saveZoomLevel();
    }
}

export function zoomOut() {
    if (zoomLevel > ZOOM_MIN) {
        zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
        applyZoom();
        saveZoomLevel();
    }
}

export function resetZoom() {
    zoomLevel = 1.0;
    applyZoom();
    saveZoomLevel();
}

export function setZoomLevel(level) {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
    applyZoom();
    saveZoomLevel();
}

export default {
    loadZoomLevel,
    saveZoomLevel,
    getZoomLevel,
    applyZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel
};
