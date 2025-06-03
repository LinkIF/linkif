Реализация долгого (вызов меню быстрого доступа) тапа для сенсорных экранов

// touch.js — обработчик долгих тапов для панели быстрых действий

export function setupTouchMenu(element, { onTouchMenu, onContextMenu }) {
    let touchTimeout = null;
    let isTouch = false;

    // Touch devices (long tap = 3s)
    element.addEventListener('touchstart', (e) => {
        isTouch = true;
        touchTimeout = setTimeout(() => {
            onTouchMenu?.(e);
        }, 3000);
    });
    element.addEventListener('touchend', () => {
        clearTimeout(touchTimeout);
    });
    element.addEventListener('touchcancel', () => {
        clearTimeout(touchTimeout);
    });

    // Desktop (mouse hold = 10s)
    element.addEventListener('mousedown', (e) => {
        if (isTouch) return; // Ignore if touch previously detected
        touchTimeout = setTimeout(() => {
            onContextMenu?.(e);
        }, 10000);
    });
    element.addEventListener('mouseup', () => {
        clearTimeout(touchTimeout);
    });
    element.addEventListener('mouseleave', () => {
        clearTimeout(touchTimeout);
    });
}
