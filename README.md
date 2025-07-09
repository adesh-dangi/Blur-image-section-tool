# Blur-image-section-tool
Tool prototype to let user upload, select sensitive areas and blur it and download it

Screen Privacy Prototype
This project is a web-based prototype demonstrating a concept for a screen privacy tool. It allows users to simulate blurring sensitive areas on a displayed image, mimicking how a real application might hide confidential information during screen sharing, live streaming, or presentations.

🌟 Features
Image Upload: Upload any image to serve as a simulated screen capture.

Define Sensitive Areas: Interactively draw rectangular regions on the uploaded image that you wish to blur.

Toggle Blur Effect: Easily switch the blur effect on and off to reveal or hide the sensitive content.

Clear Areas: Remove all defined sensitive regions with a single click.

Download Blurred Image: Save the currently displayed blurred image as a PNG file, retaining the applied blurs.

Responsive Design: The interface adapts to various screen sizes for a consistent user experience.

🚀 How to Use
To run this prototype, simply open the index.html file in your web browser. No server-side setup or complex dependencies are required, thanks to the use of CDN for Tailwind CSS.

Upload Image: Click the "Upload Image" button and select an image file from your computer. This image will be displayed on the canvas.

Define Sensitive Areas: Click the "Define Sensitive Areas" button. Your cursor will change to a crosshair. Click and drag your mouse on the image to draw rectangles over the areas you want to blur. You can define multiple areas. Click the "Define Sensitive Areas" button again to exit drawing mode.

Toggle Blur: Once sensitive areas are defined, click the "Toggle Blur" button to activate or deactivate the blurring effect.

Clear Areas: If you want to remove all defined sensitive regions, click the "Clear Areas" button.

Download Blurred Image: To save the image with the applied blurs, click the "Download Blurred Image" button. The image will be downloaded

🛠 Technologies Used
HTML5: For the basic structure of the web page.

CSS3 (Tailwind CSS): For modern, utility-first styling and responsive design. The Tailwind CDN is used for simplicity.

JavaScript: For all interactive functionalities, including image loading, canvas drawing, blur application, and event handling.
