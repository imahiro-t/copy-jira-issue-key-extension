document.addEventListener('mousedown', (event) => {
  if (event.shiftKey) {
    const issueKey = findIssueKey(event.target);    
    if (issueKey) {
      Promise.resolve()
      .then(() => new Promise((resolve, _reject) => {
        setTimeout(() => resolve(), 100);
      }))
      .then(() => {
        navigator.clipboard.writeText(issueKey);
      })
    }
  }
});

const findIssueKey = (node) => {
  return node?.closest('.issue_view_permalink_button_wrapper')?.previousElementSibling?.textContent;
}
