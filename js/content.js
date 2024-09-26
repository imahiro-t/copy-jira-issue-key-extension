let srcNode;
const dummyNode = document
  .createRange()
  .createContextualFragment(
    '<div id="BreadcrumbCurrentIssue"></div>'
  ).firstChild;

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift" || event.key === "Meta" || event.key === "Alt") {
    const node = document.querySelector("#BreadcrumbCurrentIssue");
    if (node) {
      changeColor(
        event,
        node.closest(".issue_view_permalink_button_wrapper")?.querySelector("g")
      );
      if (event.key === "Shift") {
        node.parentNode.replaceChild(dummyNode, node);
        srcNode = node;
      }
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift" || event.key === "Meta" || event.key === "Alt") {
    const node = document.querySelector("#BreadcrumbCurrentIssue");
    if (node && srcNode) {
      changeColor(
        event,
        node.closest(".issue_view_permalink_button_wrapper")?.querySelector("g")
      );
      if (event.key === "Shift") {
        node.parentNode.replaceChild(srcNode, node);
      }
    }
  }
});

const changeColor = (event, g) => {
  if (g) {
    const colorMode = document
      .querySelector("html")
      .getAttribute("data-color-mode");
    if (event.shiftKey && (event.altKey || event.metaKey)) {
      g.style.color = colorMode === "dark" ? "crimson" : "red";
    } else if (event.shiftKey) {
      g.style.color = colorMode === "dark" ? "dodgerblue" : "blue";
    } else {
      g.style.color = "inherit";
    }
  }
};

document.addEventListener("mousedown", (event) => {
  if (event.shiftKey && (event.altKey || event.metaKey)) {
    const issueKey = findIssueKey(event.target);
    const issueSummary = findIssueSummary(event.target);
    if (issueKey && issueSummary) {
      writeToClipboard(`${issueKey}: ${issueSummary}`);
      event.preventPropagation();
    }
  } else if (event.shiftKey) {
    const issueKey = findIssueKey(event.target);
    if (issueKey) {
      writeToClipboard(issueKey);
      event.preventPropagation();
    }
  }
});

const writeToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

const findIssueKey = (node) => {
  return node.closest(".issue_view_permalink_button_wrapper")
    ?.previousElementSibling?.textContent;
};

const findIssueSummary = (node) => {
  return node
    .closest("#jira-issue-header")
    ?.nextElementSibling?.querySelector("form")
    ?.querySelector('[role="presentation"]')?.textContent;
};
