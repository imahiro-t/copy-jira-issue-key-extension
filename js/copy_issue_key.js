window.addEventListener("urlChange", () => {
  setTimeout(() => {
    const node = targetNode();
    if (node) {
      node.addEventListener("mouseover", (event) => {
        changeColor(event);
      });
      node.addEventListener("mouseout", (event) => {
        changeColor(event);
      });
      node.addEventListener("mousemove", (event) => {
        changeColor(event);
      });
    }
  }, 1000);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Shift" || event.key === "Meta" || event.key === "Alt") {
    changeColor(event);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Shift" || event.key === "Meta" || event.key === "Alt") {
    changeColor(event);
  }
});

const targetNode = () => {
  return document
    .querySelector("#BreadcrumbCurrentIssue")
    ?.closest(".issue_view_permalink_button_wrapper");
};

const changeColor = (event) => {
  const colorMode = document
    .querySelector("html")
    .getAttribute("data-color-mode");
  const g = targetNode()?.querySelector("g");
  if (g) {
    if (event.shiftKey && (event.altKey || event.metaKey)) {
      g.style.color = colorMode === "dark" ? "crimson" : "red";
    } else if (event.shiftKey) {
      g.style.color = colorMode === "dark" ? "dodgerblue" : "blue";
    } else {
      g.style.color = "inherit";
    }
  } else {
    const path = targetNode()?.querySelector("path");
    if (path) {
      if (event.shiftKey && (event.altKey || event.metaKey)) {
        path.style.fill = colorMode === "dark" ? "crimson" : "red";
      } else if (event.shiftKey) {
        path.style.fill = colorMode === "dark" ? "dodgerblue" : "blue";
      } else {
        path.style.fill = "currentcolor";
      }
    }
  }
};

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
  setTimeout(() => {
    navigator.clipboard.writeText(text);
  }, 500);
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
