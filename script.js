
// Global variables for canvas and image manipulation
const imageUpload = document.getElementById('imageUpload');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const defineAreasBtn = document.getElementById('defineAreasBtn');
const toggleBlurBtn = document.getElementById('toggleBlurBtn');
const clearAreasBtn = document.getElementById('clearAreasBtn');
const downloadBlurredImageBtn = document.getElementById('downloadBlurredImageBtn');
const messageContainer = document.getElementById('messageContainer');

let originalImage = null; // Stores the uploaded image object
let sensitiveAreas = []; // Stores {x, y, width, height} of defined areas
let isDefiningAreas = false; // Flag to control drawing mode
let isBlurActive = true; // Flag to control blur state
let startX, startY; // Starting coordinates for drawing rectangle
let currentRect = null; // Stores the current rectangle being drawn
let originalFileName = 'blurred_image'; // To store the base name of the uploaded file

// Variables to handle canvas scaling for responsiveness
let scaleFactor = 1;

/**
 * Displays a message to the user in a styled box.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showMessage(message, type = 'info') {
    messageContainer.innerHTML = message;
    messageContainer.className = 'toast-message message-box'; // Base class for toast

    if (type === 'error') {
        messageContainer.classList.add('message-box-error');
    } else if (type === 'info') {
        messageContainer.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
    } else if (type === 'success') {
        messageContainer.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
    }

    // Show as toast
    messageContainer.classList.add('show');
    setTimeout(() => {
        messageContainer.classList.remove('show');
    }, 5000); // Hide after 5 seconds
}

/**
 * Resizes the canvas to fit its container while maintaining aspect ratio.
 * Also adjusts the internal canvas dimensions for high-resolution drawing.
 */
function resizeCanvas() {
    if (!originalImage) return;

    const containerWidth = imageCanvas.parentElement.clientWidth;
    const aspectRatio = originalImage.width / originalImage.height;

    // Calculate new canvas display dimensions
    let displayWidth = containerWidth;
    let displayHeight = displayWidth / aspectRatio;

    // Apply max-height constraint if needed (e.g., for very wide images on tall screens)
    const maxDisplayHeight = window.innerHeight * 0.6; // 60vh
    if (displayHeight > maxDisplayHeight) {
        displayHeight = maxDisplayHeight;
        displayWidth = displayHeight * aspectRatio;
    }

    imageCanvas.style.width = `${displayWidth}px`;
    imageCanvas.style.height = `${displayHeight}px`;

    // Set internal canvas resolution (for drawing)
    // Use device pixel ratio for sharper images on high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    imageCanvas.width = displayWidth * dpr;
    imageCanvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr); // Scale context to match device pixels

    // Calculate the scaling factor for mouse coordinates
    scaleFactor = originalImage.width / displayWidth;

    redrawCanvas(); // Redraw content after resizing
}

/**
 * Draws the image on the canvas and applies blur to sensitive areas if active.
 */
function redrawCanvas() {
    if (!originalImage) {
        ctx.clearRect(0, 0, imageCanvas.width / (window.devicePixelRatio || 1), imageCanvas.height / (window.devicePixelRatio || 1));
        return;
    }

    // Save the current state of the canvas context (before applying filters)
    ctx.save();

    // Clear the canvas
    ctx.clearRect(0, 0, imageCanvas.width / (window.devicePixelRatio || 1), imageCanvas.height / (window.devicePixelRatio || 1));

    // Draw the original image scaled to fit the canvas display dimensions
    const displayWidth = imageCanvas.width / (window.devicePixelRatio || 1);
    const displayHeight = imageCanvas.height / (window.devicePixelRatio || 1);
    ctx.drawImage(originalImage, 0, 0, displayWidth, displayHeight);

    if (isBlurActive) {
        sensitiveAreas.forEach(area => {
            // Calculate scaled coordinates for drawing on the display canvas
            const scaledX = area.x / scaleFactor;
            const scaledY = area.y / scaleFactor;
            const scaledWidth = area.width / scaleFactor;
            const scaledHeight = area.height / scaleFactor;

            // Apply blur filter to the context for the specific region
            ctx.filter = 'blur(10px)'; // Adjust blur strength as needed
            ctx.drawImage(originalImage,
                          area.x, area.y, area.width, area.height, // Source rectangle on original image
                          scaledX, scaledY, scaledWidth, scaledHeight); // Destination rectangle on canvas
            ctx.filter = 'none'; // Reset filter for subsequent drawings
        });
    }

    // Draw current rectangle if defining areas
    if (isDefiningAreas && currentRect) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }

    // Restore the canvas context to its state before this function was called
    ctx.restore();
}

// Event listener for image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Store the original file name (without extension)
        originalFileName = file.name.split('.').slice(0, -1).join('.') || 'image';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                sensitiveAreas = []; // Clear previous areas
                isBlurActive = true; // Reset blur state
                toggleBlurBtn.textContent = 'Toggle Blur (Active)';
                resizeCanvas(); // Set canvas dimensions and draw image
                defineAreasBtn.disabled = false;
                toggleBlurBtn.disabled = false;
                clearAreasBtn.disabled = false;
                downloadBlurredImageBtn.disabled = false; // Enable download button
                showMessage('Image loaded successfully! Now define sensitive areas.', 'success');
            };
            img.onerror = () => {
                showMessage('Could not load image. Please try a different file.', 'error');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for "Define Sensitive Areas" button
defineAreasBtn.addEventListener('click', () => {
    if (!originalImage) {
        showMessage('Please upload an image first.', 'info');
        return;
    }
    isDefiningAreas = !isDefiningAreas;
    if (isDefiningAreas) {
        defineAreasBtn.textContent = 'Stop Defining Areas';
        imageCanvas.style.cursor = 'crosshair';
        showMessage('Click and drag on the image to define sensitive areas.', 'info');
    } else {
        defineAreasBtn.textContent = 'Define Sensitive Areas';
        imageCanvas.style.cursor = 'default';
        showMessage('Defining areas stopped. You can now toggle blur.', 'success');
    }
    redrawCanvas(); // Redraw to remove any temporary drawing if stopped
});

// Mouse events for drawing rectangles
imageCanvas.addEventListener('mousedown', (e) => {
    if (!isDefiningAreas || !originalImage) return;

    const rect = imageCanvas.getBoundingClientRect();
    // Get mouse coordinates relative to the canvas display area
    startX = (e.clientX - rect.left);
    startY = (e.clientY - rect.top);

    currentRect = { x: startX, y: startY, width: 0, height: 0 };
});

imageCanvas.addEventListener('mousemove', (e) => {
    if (!isDefiningAreas || !originalImage || !currentRect) return;

    const rect = imageCanvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left);
    const currentY = (e.clientY - rect.top);

    currentRect.width = currentX - startX;
    currentRect.height = currentY - startY;

    redrawCanvas(); // Redraw to show the rectangle being drawn
});

imageCanvas.addEventListener('mouseup', () => {
    if (!isDefiningAreas || !originalImage || !currentRect) return;

    // Ensure width and height are positive
    const finalX = Math.min(startX, startX + currentRect.width);
    const finalY = Math.min(startY, startY + currentRect.height);
    const finalWidth = Math.abs(currentRect.width);
    const finalHeight = Math.abs(currentRect.height);

    // Only add if a valid size rectangle was drawn
    if (finalWidth > 5 && finalHeight > 5) { // Minimum size to avoid tiny clicks
        // Store coordinates scaled to the original image dimensions
        sensitiveAreas.push({
            x: finalX * scaleFactor,
            y: finalY * scaleFactor,
            width: finalWidth * scaleFactor,
            height: finalHeight * scaleFactor
        });
        showMessage(`Area defined: (${finalX.toFixed(0)}, ${finalY.toFixed(0)}) size ${finalWidth.toFixed(0)}x${finalHeight.toFixed(0)}`, 'info');
    } else {
        showMessage('Area too small, not saved.', 'info');
    }

    currentRect = null; // Reset current rectangle
    redrawCanvas(); // Redraw with the new area blurred (if blur is active)
});

// Event listener for "Toggle Blur" button
toggleBlurBtn.addEventListener('click', () => {
    if (!originalImage) {
        showMessage('Please upload an image first.', 'info');
        return;
    }
    if (sensitiveAreas.length === 0) {
        showMessage('No sensitive areas defined yet. Please define some first.', 'info');
        return;
    }
    isBlurActive = !isBlurActive;
    toggleBlurBtn.textContent = isBlurActive ? 'Toggle Blur (Active)' : 'Toggle Blur (Inactive)';
    redrawCanvas();
    showMessage(`Blur is now ${isBlurActive ? 'active' : 'inactive'}.`, 'info');
});

// Event listener for "Clear Areas" button
clearAreasBtn.addEventListener('click', () => {
    if (!originalImage) {
        showMessage('No image loaded to clear areas from.', 'info');
        return;
    }
    if (sensitiveAreas.length === 0) {
        showMessage('No sensitive areas to clear.', 'info');
        return;
    }
    sensitiveAreas = [];
    redrawCanvas();
    showMessage('All sensitive areas cleared.', 'success');
});
// Event listener for "Download Blurred Image" button (NEW)
downloadBlurredImageBtn.addEventListener('click', () => {
    if (!originalImage) {
        showMessage('Please upload an image first.', 'info');
        return;
    }
    if (sensitiveAreas.length === 0) {
        showMessage('No sensitive areas defined to blur for download. Please define some first.', 'info');
        return;
    }

    // Temporarily ensure blur is active for download
    const wasBlurActive = isBlurActive;
    if (!wasBlurActive) {
        isBlurActive = true;
        redrawCanvas(); // Redraw to apply blur before capturing
    }

    // Get the image data from the canvas
    // Use image/png as it's widely supported and handles transparency well.
    // The quality argument (0 to 1) is for JPEG/WebP, not PNG.
    const imageDataURL = imageCanvas.toDataURL('image/png');

    // Create a temporary link element
    const a = document.createElement('a');
    a.href = imageDataURL;
    // Suggest a filename based on the original, appending '_blurred'
    a.download = `${originalFileName}_blurred.png`;

    // Programmatically click the link to trigger the download
    document.body.appendChild(a); // Append to body is good practice for programmatic clicks
    a.click();
    document.body.removeChild(a); // Clean up the temporary link

    // Revert blur state if it was changed for download
    if (!wasBlurActive) {
        isBlurActive = false;
        redrawCanvas(); // Revert to original blur state
    }
    showMessage('Blurred image downloaded!', 'success');
});

// Initial canvas setup and responsiveness
window.addEventListener('resize', resizeCanvas);
// Initial call to set up canvas dimensions if an image is already loaded (e.g., on refresh)
// This will be called after image load, but good for initial state.
resizeCanvas();
