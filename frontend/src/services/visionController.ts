// A lightweight controller to open the device camera and return a captured image as a File
// Uses an invisible input element with capture to trigger the camera on mobile browsers.

export const visionController = {
  pickImageViaCamera(): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Prefer rear camera when available
        // @ts-ignore - not all TS libs know capture attr
        input.capture = 'environment';
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);

        const cleanup = () => {
          if (input && input.parentNode) input.parentNode.removeChild(input);
        };

        input.onchange = () => {
          const file = input.files && input.files[0];
          cleanup();
          if (file) resolve(file);
          else reject(new Error('No image selected'));
        };

        input.click();
      } catch (e) {
        reject(e as Error);
      }
    });
  }
};
