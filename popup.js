document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the message from chrome.storage if needed
  chrome.storage.local.get("alertMessage", function (data) {
    const messageElement = document.getElementById("message");
    if (data.alertMessage) {
      messageElement.textContent = data.alertMessage;
    } else {
      messageElement.textContent = "Nothing yet";
    }
  });

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "SHOW_ALERT") {
      const messageElement = document.getElementById("message");
      messageElement.textContent = request.message;
    }
  });

  // Close the popup when the button is clicked
  document.getElementById("close").addEventListener("click", function () {
    window.close();
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "COPY_TO_CLIPBOARD") {
      navigator.clipboard.writeText(request.data)
        .then(() => {
          console.log("Image data copied to clipboard.");
          document.getElementById("message").textContent = "Success!";
        })
        .catch((error) => {
          console.error("Failed to copy data to clipboard:", error);
          document.getElementById("message").textContent = "Failed to copy data to clipboard.";
        });
    } else if (request.type === "SHOW_ALERT") {
      document.getElementById("message").textContent = request.message;
    }
  });

  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === "COPY_IMAGE") {
      copyImageToClipboard(message.url);
    }
  });
  
  // Function to copy image to clipboard
  function copyImageToClipboard(imageUrl) {
    fetch(imageUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = function() {
          const dataUrl = reader.result;
  
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // element to draw on the canvas
          const image = new Image();
          image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
  
            canvas.toBlob((blob) => {
              if (navigator.clipboard) {
                const clipboardItem = new ClipboardItem({ 'image/png': blob });
  
                // copy to clpibaord
                navigator.clipboard.write([clipboardItem])
                  .then(() => {
                    document.getElementById('status').textContent = "Image copied to clipboard.";
                  })
                  .catch((error) => {
                    document.getElementById('status').textContent = "Failed to copy image.";
                    console.error("Failed to copy image to clipboard:", error);
                  });
              } else {
                console.error("Clipboard API not supported.");
              }
            }, 'image/png');
          };
          image.src = dataUrl; // set image source to data URL
        };
        reader.readAsDataURL(blob); // Blob => URL
      })
      .catch((error) => {
        document.getElementById('status').textContent = "Error fetching image.";
        console.error("Error fetching image:", error);
      });
  }
});
