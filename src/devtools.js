chrome.devtools.panels.setOpenResourceHandler(function (resource, line) {
  var bits = resource.url.split(/([?#])/);
  bits[0] += ':' + (line || 1);
  var url = bits.join('');

  console.log('open %s', url);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onerror = function (e) { console.error(xhr.statusText); };
  xhr.send(null);
});
