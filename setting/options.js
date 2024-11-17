// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    {
      version: 1,
      host: "",
      email: "",
      apiToken: "",
      projectKey: "",
      spaceKey: "",
      templateId: "",
      parentId: "",
    },
    (items) => {
      document.getElementById(`host`).value = items.host;
      document.getElementById(`email`).value = items.email;
      document.getElementById(`apiToken`).value = items.apiToken;
      document.getElementById(`projectKey`).value = items.projectKey;
      document.getElementById(`spaceKey`).value = items.spaceKey;
      document.getElementById(`templateId`).value = items.templateId;
      document.getElementById(`parentId`).value = items.parentId;
    }
  );
};

// Saves options to chrome.storage
const saveOptions = () => {
  const host = document.getElementById(`host`).value;
  const email = document.getElementById(`email`).value;
  const apiToken = document.getElementById(`apiToken`).value;
  const projectKey = document.getElementById(`projectKey`).value;
  const spaceKey = document.getElementById(`spaceKey`).value;
  const templateId = document.getElementById(`templateId`).value;
  const parentId = document.getElementById(`parentId`).value;

  chrome.storage.sync.clear();
  chrome.storage.sync.set(
    {
      version: 1,
      host: host,
      email: email,
      apiToken: apiToken,
      projectKey: projectKey,
      spaceKey: spaceKey,
      templateId: templateId,
      parentId: parentId,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Saved successfully.";
      setTimeout(() => {
        status.textContent = "";
        restoreOptions();
      }, 750);
    }
  );
};

// Import options to chrome.storage
const importOptions = () => {
  const json = document.getElementById("json").value;
  const items = JSON.parse(json);
  chrome.storage.sync.clear();
  chrome.storage.sync.set(items, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Imported successfully.";
    setTimeout(() => {
      status.textContent = "";
      restoreOptions();
    }, 750);
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
