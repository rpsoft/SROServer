"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  "handlers": {
    // inserts a link inside <ptr> using the @target; the link in the
    // @href is piped through the rw (rewrite) function before insertion
    "ptr": ["<a href=\"$rw@target\">$@target</a>"],
    // wraps the content of the <ref> in an HTML link
    "ref": ["<a href=\"$rw@target\">", "</a>"],
    "graphic": function graphic() {
      var ceteicean = this;
      return function () {
        var shadow = this.createShadowRoot();
        var img = new Image();
        img.src = ceteicean.rw(this.getAttribute("url"));
        if (this.hasAttribute("width")) {
          img.width = this.getAttribute("width").replace(/[^.0-9]/g, "");
        }
        if (this.hasAttribute("height")) {
          img.height = this.getAttribute("height").replace(/[^.0-9]/g, "");
        }
        shadow.appendChild(img);
      };
    },
    "egXML": function egXML() {
      return function () {
        var shadow = this.createShadowRoot();
        shadow.innerHTML = "<pre>" + this.innerHTML.replace(/</g, "&lt;") + "</pre>";
      };
    }
  },
  "fallbacks": {
    "ref": function ref(elt) {
      var ceteicean = this;
      elt.addEventListener("click", function (event) {
        window.location = ceteicean.rw(elt.getAttribute("target"));
      });
    },
    "graphic": function graphic(elt) {
      var ceteicean = this;
      var content = new Image();
      content.src = ceteicean.rw(this.getAttribute("url"));
      if (elt.hasAttribute("width")) {
        content.width = elt.getAttribute("width").replace(/[^.0-9]/g, "");
      }
      if (elt.hasAttribute("height")) {
        content.height = elt.getAttribute("height").replace(/[^.0-9]/g, "");
      }
      elt.appendChild(content);
    },
    "egXML": function egXML(elt) {
      var content = elt.innerHTML;
      elt.innerHTML = "<span style=\"display:none\">" + elt.innerHTML + "</span>";
      elt.innerHTML += "<pre>" + content.replace(/</g, "&lt;") + "</pre>";
    }
  }
};
//# sourceMappingURL=behaviors.js.map
