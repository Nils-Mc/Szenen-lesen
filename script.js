const url = 'https://cdn.glitch.global/c96c6a97-8b8f-4e8a-8839-7d5560c0d205/Szene%202021.pdf?v=1740395715983';

let pdfDoc = null, currentPage = 1, totalPages = 0, scale = 1;
let isPinching = false, startDistance = 0, startScale = 1;
let isDragging = false, startX = 0, startY = 0;
let translateX = 0, translateY = 0;

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageContainer = document.getElementById('page-container');

pdfjsLib.getDocument(url).promise.then((pdf) => {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    renderPage(currentPage);
});

function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({ canvasContext: ctx, viewport });

        document.getElementById('page-num').textContent = `Seite ${currentPage} von ${totalPages}`;
        updateTransform();
    });
}

function updateTransform() {
    canvas.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        resetTransform();
        renderPage(currentPage);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        resetTransform();
        renderPage(currentPage);
    }
});

document.getElementById('zoom-in').addEventListener('click', () => {
    scale = Math.min(3, scale + 0.2);
    renderPage(currentPage);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (scale > 1) {
        scale = Math.max(1, scale - 0.2);
        renderPage(currentPage);
    }
});

// Touch-Gesten
pageContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        isPinching = true;
        startDistance = getDistance(e.touches);
        startScale = scale;
    } else if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
    }
});

pageContainer.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        let newDistance = getDistance(e.touches);
        let zoomFactor = newDistance / startDistance;
        scale = Math.min(3, Math.max(1, startScale * zoomFactor));
        updateTransform();
    } else if (isDragging && e.touches.length === 1) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        updateTransform();
    }
});

pageContainer.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) isPinching = false;
    if (e.touches.length === 0) isDragging = false;
});

// Maussteuerung
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

function getDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function resetTransform() {
    translateX = 0;
    translateY = 0;
}
