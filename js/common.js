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
