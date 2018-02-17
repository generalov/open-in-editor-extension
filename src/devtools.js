// https://cs.chromium.org/chromium/src/third_party/WebKit/LayoutTests/http/tests/devtools/extensions/extensions-events-expected.txt
let gSelectionInfo = null;

async function process(url, line) {
  const urlToOpen = url.startsWith("webpack://") ? new URL(url.substr(11), await getInspectedWindowUrl()).href : url;
  const position = isFromSourcesPanel(url, line) ? getPositionInSourcesPanel() : line;

  return openInEditor(urlToOpen, position);
}

function isFromSourcesPanel(url, line) {
  // FIXME: how to really detect what the Sources Panel calls that?
  return line === 1 && gSelectionInfo && gSelectionInfo.url === url;
}

function getPositionInSourcesPanel() {
  const res = [gSelectionInfo.startLine + 1, gSelectionInfo.startColumn + 1].join(":");
  gSelectionInfo = null;

  return res;
}

async function getInspectedWindowUrl(callback) {
  return new Promise((resolve, reject) => {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.tabs.get(tabId, tab => resolve(tab.url));
  });
}

async function openInEditor(url, position) {
  const openInEditorUrl = [url.split(/([?#])/)[0], position || 1].join(":");
  const xhr = new XMLHttpRequest();

  console.log("open %s", openInEditorUrl);

  xhr.open("POST", openInEditorUrl, true);
  xhr.onerror = function(e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

function onOpenResource(resource, line) {
  process(resource.url, line);
}

function onSelectionChanged(selectionInfo) {
  gSelectionInfo = selectionInfo;
}

// https://developer.chrome.com/extensions/devtools_panels#method-setOpenResourceHandler
chrome.devtools.panels.setOpenResourceHandler(onOpenResource);
// https://developer.chrome.com/extensions/devtools_panels#event-SourcesPanel-onSelectionChanged
chrome.devtools.panels.sources.onSelectionChanged.addListener(onSelectionChanged);
