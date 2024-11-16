let oldUrl = "";

const urlChangeObserver = new MutationObserver(() => {
  setTimeout(() => {
    if (oldUrl !== location.href) {
      window.dispatchEvent(new CustomEvent("urlChange"));
      oldUrl = location.href;
    }
  }, 500);
});

urlChangeObserver.observe(document.body, {
  subtree: true,
  childList: true,
});

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
  const g = targetNode()?.querySelector("g");
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
