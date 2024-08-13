const apiKeys = ["api_key"];
const randomIndex = Math.floor(Math.random() * apiKeys.length);
const randomApiKey = apiKeys[randomIndex];


function removeImageBackground(imageUrl) {
  fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Api-Key": randomApiKey,
    },
    body: new URLSearchParams({
      image_url: imageUrl,
      size: "auto", 
    }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Convert the blob to Base64
      const reader = new FileReader();
      reader.onloadend = function() {
        const base64data = reader.result;
        console.log("Base64 Data URL:", base64data);
        chrome.runtime.sendMessage({ type: "COPY_IMAGE", url: base64data });

        // Base64 data send to popup
        chrome.runtime.sendMessage({
          type: "COPY_TO_CLIPBOARD",
          data: base64data,
        });
      };
      reader.readAsDataURL(blob); // to URL
    })
    .catch((error) => {
      console.error("Error:", error);
      chrome.runtime.sendMessage({
        type: "SHOW_ALERT",
        message: `Failed to process image.`,
      });
    });
}



function genericOnClick(info) {
  if (info.menuItemId === "image") {
    console.log("Image item clicked.");

    // Save message to chrome storage
    console.log(info.srcUrl);
    removeImageBackground(info.srcUrl);

    chrome.storage.local.set({ alertMessage: "You clicked nme!" }, function () {
      chrome.action.setPopup({ popup: "popup.html" });
      chrome.action.openPopup();
    });
  } else {
    console.log("Standard context menu item clicked.");
  }
}

chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function () {
  let context = "image";
  let title = "image";
  chrome.contextMenus.create(
    {
      title: title,
      contexts: [context],
      id: context,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError);
      } else {
        console.log("Context menu item created successfully.");
      }
    }
  );
});
