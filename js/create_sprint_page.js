const setting = {
  host: "",
  email: "",
  apiToken: "",
  projectKey: "",
  spaceKey: "",
  templateId: "",
  parentId: "",
};
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
    setting.host = items.host;
    setting.email = items.email;
    setting.apiToken = items.apiToken;
    setting.projectKey = items.projectKey;
    setting.spaceKey = items.spaceKey;
    setting.templateId = items.templateId;
    setting.parentId = items.parentId;
  }
);

const TAG = Object.freeze({
  SPRINT_NAME: "{{SPRINT_NAME}}",
  SPRINT_GOAL: "{{SPRINT_GOAL}}",
  SPRINT_START_DATE: "{{SPRINT_START_DATE}}",
  SPRINT_END_DATE: "{{SPRINT_END_DATE}}",
  ISSUE: "{{ISSUE}}",
  EPIC: "{{EPIC}}",
});

window.addEventListener("urlChange", () => {
  initCreateSprintPageButton();
});

const initCreateSprintPageButton = () => {
  if (
    !location.pathname.endsWith("/backlog") ||
    !!document.querySelector("#CreateSprintPageButton") ||
    !setting.host ||
    !setting.email ||
    !setting.apiToken ||
    !setting.projectKey ||
    !setting.spaceKey ||
    !setting.templateId ||
    !setting.parentId
  ) {
    return;
  }
  chrome.runtime.sendMessage(
    {
      type: "get_sprint",
      email: setting.email,
      apiToken: setting.apiToken,
      host: setting.host,
      projectKey: setting.projectKey,
    },
    (response) => {
      const { sprint } = JSON.parse(response.result);
      if (!sprint) return;
      createSprintPageButton();
    }
  );
};

const createSprintPageButton = () => {
  const buttontDiv = Array.from(document.querySelector("main")?.querySelectorAll("div")).find(
    (el) => el.role === "presentation"
  );
  if (!buttontDiv) return;
  const newButtonDiv = buttontDiv.cloneNode(false);
  buttontDiv.parentNode?.insertBefore(newButtonDiv, buttontDiv);
  const newButton = document.createElement("button");
  newButton.classList = buttontDiv?.firstChild?.classList;
  newButton.setAttribute("id", "CreateSprintPageButton");
  newButton.addEventListener("click", () => {
    createSprintPage();
  });
  const newChildNode = document.createElement("span");
  newChildNode.classList = buttontDiv?.firstChild?.lastChild?.classList;
  const svgNode = htmlStringToNode(
    `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48752C" style="">
    <g fill="currentcolor">
    <path d="M320-160q-33 0-56.5-23.5T240-240v-120h120v-90q-35-2-66.5-15.5T236-506v-44h-46L60-680q36-46 89-65t107-19q27 0 52.5 4t51.5 15v-55h480v520q0 50-35 85t-85 35H320Zm120-200h240v80q0 17 11.5 28.5T720-240q17 0 28.5-11.5T760-280v-440H440v24l240 240v56h-56L510-514l-8 8q-14 14-29.5 25T440-464v104ZM224-630h92v86q12 8 25 11t27 3q23 0 41.5-7t36.5-25l8-8-56-56q-29-29-65-43.5T256-684q-20 0-38 3t-36 9l42 42Zm376 350H320v40h286q-3-9-4.5-19t-1.5-21Zm-280 40v-40 40Z"></path>
    </g>
    </svg>`
  );
  newChildNode.appendChild(svgNode);
  newButton.appendChild(newChildNode);
  newButtonDiv.appendChild(newButton);
}

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
};

const createSprintPage = () => {
  document.querySelector("#CreateSprintPageButton").disabled = true;
  chrome.runtime.sendMessage(
    {
      type: "get_info_to_create",
      email: setting.email,
      apiToken: setting.apiToken,
      host: setting.host,
      projectKey: setting.projectKey,
      templateId: setting.templateId,
    },
    (response) => {
      const { issues, sprint, template } = JSON.parse(response.result);
      if (template) {
        const title = replaceTag(template.title ?? "", sprint);
        const content = replaceTag(
          createContent(template.body ?? "", issues, sprint),
          sprint
        );
        chrome.runtime.sendMessage(
          {
            type: "create_sprint_page",
            email: setting.email,
            apiToken: setting.apiToken,
            host: setting.host,
            spaceKey: setting.spaceKey,
            parentId: setting.parentId,
            title: title,
            content: content,
          },
          (response) => {
            document.querySelector("#CreateSprintPageButton").disabled = false;
            if (response.status === "success") {
              window.alert("Sprint page successfully created.");
            } else {
              if (response.message) {
                window.alert(response.message);
              } else {
                window.alert("Failed to create sprint page...");
              }
            }
          }
        );
      }
    }
  );
};

const replaceTag = (value, sprint) => {
  return value
    .replaceAll(TAG.SPRINT_NAME, sprint.name)
    .replaceAll(TAG.SPRINT_GOAL, sprint.goal)
    .replaceAll(
      TAG.SPRINT_START_DATE,
      `<time datetime="${formatDate(new Date(sprint.startDate))}"></time>`
    )
    .replaceAll(
      TAG.SPRINT_END_DATE,
      `<time datetime="${formatDate(new Date(sprint.endDate))}"></time>`
    );
};

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const createContent = (body, issues, sprint) => {
  var div = document.createElement("div");
  div.innerHTML = body;
  const acs = div.querySelectorAll(
    "ac\\:structured-macro[ac\\:name='info'],ac\\:structured-macro[ac\\:name='tip'],ac\\:structured-macro[ac\\:name='note'],ac\\:structured-macro[ac\\:name='warning'],ac\\:structured-macro[ac\\:name='panel']"
  );
  acs.forEach((ac) => {
    if (
      ac.firstChild?.nodeName === "AC:RICH-TEXT-BODY" &&
      ac.firstChild?.lastChild?.nodeName === "P" &&
      ac.firstChild?.lastChild?.textContent.includes(TAG.SPRINT_GOAL)
    ) {
      const goals = sprint.goal.split("\n");
      goals.forEach((goal) => {
        const clonedAc = ac.cloneNode(true);
        clonedAc.firstChild.lastChild.textContent =
          clonedAc.firstChild.lastChild.textContent.replaceAll(
            TAG.SPRINT_GOAL,
            goal
          );
        ac.parentNode.insertBefore(clonedAc, ac);
      });
      ac.parentNode.removeChild(ac);
    }
  });
  const tbodys = div.querySelectorAll("tbody");
  tbodys.forEach((tbody) => {
    let containedTr = null;
    const trElements = tbody.querySelectorAll("tr");
    trElements.forEach((tr) => {
      const tdElements = tr.querySelectorAll("td");
      tdElements.forEach((td) => {
        if (td.textContent.includes(TAG.ISSUE)) {
          containedTr = tr;
        }
      });
    });
    if (containedTr) {
      tbody.removeChild(containedTr);
      issues.forEach((issue) => {
        const clonedTr = containedTr.cloneNode(true);
        const tdElements = clonedTr.querySelectorAll("td");
        tdElements.forEach((td) => {
          if (td.innerHTML.includes(TAG.ISSUE)) {
            td.innerHTML = td.innerHTML.replaceAll(
              TAG.ISSUE,
              `<ac:structured-macro ac:name="jira" ac:schema-version="1"><ac:parameter ac:name="key">${issue.key}</ac:parameter><ac:parameter ac:name="server">System Jira</ac:parameter></ac:structured-macro>`
            );
          }
          if (td.innerHTML.includes(TAG.EPIC)) {
            td.innerHTML = td.innerHTML.replaceAll(
              TAG.EPIC,
              issue.fields?.parent?.key
                ? `<ac:structured-macro ac:name="jira" ac:schema-version="1"><ac:parameter ac:name="key">${issue.fields.parent.key}</ac:parameter><ac:parameter ac:name="server">System Jira</ac:parameter></ac:structured-macro>`
                : ""
            );
          }
        });
        tbody.appendChild(clonedTr);
      });
    }
  });
  return div.innerHTML;
};
