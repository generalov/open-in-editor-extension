// https://cs.chromium.org/chromium/src/third_party/WebKit/LayoutTests/http/tests/devtools/extensions/extensions-events-expected.txt
var gSelectionInfo = null;

function getLineFromSelection(url) {
  var res = false;
  if (gSelectionInfo && gSelectionInfo.url === url) {
    res = [gSelectionInfo.startLine + 1, gSelectionInfo.startColumn + 1].join(":");
  }
  gSelectionInfo = null;
  return res;
}

function onOpenResource(resource, line) {
  var bits = resource.url.split(/([?#])/);
  var resourceUrl = bits[0];
  var resourceLine = (line === 1 ? getLineFromSelection(resourceUrl) : line) || 1;
  var url = [resourceUrl, resourceLine].join(":");

  console.log("open %s", url);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.onerror = function(e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

function onSelectionChanged(selectionInfo) {
  gSelectionInfo = selectionInfo;
}

// https://developer.chrome.com/extensions/devtools_panels#method-setOpenResourceHandler
chrome.devtools.panels.setOpenResourceHandler(onOpenResource);
// https://developer.chrome.com/extensions/devtools_panels#event-SourcesPanel-onSelectionChanged
chrome.devtools.panels.sources.onSelectionChanged.addListener(onSelectionChanged);
