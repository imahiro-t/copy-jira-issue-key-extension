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
  Promise.resolve()
    .then(
      () =>
        new Promise((resolve, _reject) => {
          setTimeout(() => resolve(), 100);
        })
    )
    .then(() => {
      navigator.clipboard.writeText(text);
    });
};

const findIssueKey = (node) => {
  return node?.closest(".issue_view_permalink_button_wrapper")
    ?.previousElementSibling?.textContent;
};

const findIssueSummary = (node) => {
  return node
    ?.closest("#jira-issue-header")
    ?.nextElementSibling?.querySelector('[role="presentation"]')?.textContent;
};
