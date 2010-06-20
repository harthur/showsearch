var tabs = require("tabs");
var prefs = require("preferences-service");

var historyService = Cc["@mozilla.org/browser/global-history;2"]
                     .getService(Ci.nsIGlobalHistory2);
var taggingService = Cc["@mozilla.org/browser/tagging-service;1"]
                     .getService(Ci.nsITaggingService);

function makeURI(url) {  
  var ioService = Cc["@mozilla.org/network/io-service;1"]
                  .getService(Ci.nsIIOService);  
  return ioService.newURI(url, null, null);  
}

function getSearchTerms(url) {
  var matches = /.*[\?&]q=([^&]*)/.exec(url);
  if (matches) {
    var query = decodeURIComponent(matches[1]);
    return query.replace("+", " ", "g");
  }
}

// listen for tab openings via property assignment
tabs.onLoad.add(function(tab) {
  var doc = tab.contentDocument;
  var terms = getSearchTerms(doc.referrer);
  if (terms) {
    var uri = makeURI(doc.location.href);
    var mod = prefs.get("extensions.showsearchterms.mod", "title");
    if (mod == "title") {
      historyService.setPageTitle(uri, doc.title + " [" + terms + "]");
    }
    else if (mod == "tags") {
      taggingService.tagURI(uri, [terms]);
    }
  }
});

exports.main = function (options, callbacks) {
  if(options.loadReason == "install")
    prefs.set("extensions.showsearchterms.mod", "title");
};
