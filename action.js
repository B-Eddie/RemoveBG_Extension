// A generic onclick callback function.
function genericOnClick(info) {
  switch (info.menuItemId) {
    case "image":
      console.log("Image item clicked.");
      // Use chrome.notifications API to show a notification.
      chrome.notifications.create('ayo', {
        type: "basic",
        iconUrl: "icon.png",
        title: "Image Clicked",
        message: "You clicked the image option!",
        priority: 2
      });

      break;
    default:
      console.log("Standard context menu item clicked.");
  }
}

// Add the listener for context menu clicks.
chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for image context.
  let context = "image";
  let title = "image";
  chrome.contextMenus.create({
    title: title,
    contexts: [context],
    id: context,
  }, function() {
    if (chrome.runtime.lastError) {
      console.error("Error creating context menu:", chrome.runtime.lastError);
    } else {
      console.log("Context menu item created successfully.");
    }
  });
});
