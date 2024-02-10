let srcNode;
const dummyNode = document
  .createRange()
  .createContextualFragment(
    '<div id="BreadcrumbCurrentIssue"></div>'
  ).firstChild;

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    const node = document.querySelector("#BreadcrumbCurrentIssue");
    if (node) {
      node.parentNode.replaceChild(dummyNode, node);
      srcNode = node;
    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift") {
    const node = document.querySelector("#BreadcrumbCurrentIssue");
    if (node) {
      node.parentNode.replaceChild(srcNode, node);
    }
  }
});

document.addEventListener("mousedown", (event) => {
  if (event.shiftKey && (event.altKey || event.metaKey)) {
    const issueKey = findIssueKey(event.target);
    const issueSummary = findIssueSummary(event.target);
    if (issueKey && issueSummary) {
      writeToClipboard(`${issueKey}: ${issueSummary}`);
    }
  } else if (event.shiftKey) {
    const issueKey = findIssueKey(event.target);
    if (issueKey) {
      writeToClipboard(issueKey);
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
    ?.nextElementSibling?.querySelector('[role="presentation"]')?.textContent;
};
