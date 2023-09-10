const HTMLParser = require("./htmlparser.js");

function removeDOCTYPE(html) {
  return html
    .replace(/<\?xml.*\?>\n/, "")
    .replace(/<!doctype.*\>\n/, "")
    .replace(/<!DOCTYPE.*\>\n/, "");
}

function processStyle(styleValue = "", style = {}) {
  const styles = styleValue
    .split(";")
    .filter((d) => d)
    .map((d) => d.trim());
  styles.forEach((d) => {
    const stylePair = d.split(":").map((d) => d.trim());
    if (stylePair.length >= 2) {
      if (style[stylePair[0]])
        style[stylePair[0]] = [style[stylePair[0]], stylePair[1]];
      else style[stylePair[0]] = stylePair[1];
    }
  });
  return style;
}

function html2json(html) {
  html = removeDOCTYPE(html);
  const bufArray = [];
  const results = {
    node: "root",
    child: [],
    parent: null,
  };
  HTMLParser(html, {
    start: function (tag, attrs, unary) {
      const node = {
        node: "element",
        tag: tag,
      };
      if (attrs.length !== 0) {
        node.attr = attrs.reduce(function (pre, attr) {
          const name = attr.name.toLowerCase();
          let value = attr.value;

          if (value.match(/ /) && name !== "style") {
            value = value.split(" ");
          }

          if (name === "style") {
            if (!node.style) node.style = {};
            node.style = processStyle(value, node.style);
          } else if (pre[name]) {
            if (Array.isArray(pre[name])) {
              pre[name].push(value);
            } else {
              pre[name] = [pre[name], value];
            }
          } else {
            pre[name] = value;
          }

          return pre;
        }, {});
      }
      if (unary) {
        const parent = bufArray[0] || results;
        if (parent.child === undefined) {
          parent.child = [];
        }
        parent.child.push(node);
      } else {
        bufArray.unshift(node);
      }
    },
    end: function (tag) {
      const node = bufArray.shift();
      if (bufArray.length === 0) {
        results.child.push(node);
      } else {
        const parent = bufArray[0];
        if (parent.child === undefined) {
          parent.child = [];
        }
        parent.child.push(node);
      }
    },
    chars: function (text) {
      const node = {
        node: "text",
        text: text,
      };
      if (bufArray.length === 0) {
        results.child.push(node);
      } else {
        const parent = bufArray[0];
        if (parent.child === undefined) {
          parent.child = [];
        }
        parent.child.push(node);
      }
    },
    comment: function (text) {
      const node = {
        node: "comment",
        text: text,
      };
      const parent = bufArray[0];
      if (parent.child === undefined) {
        parent.child = [];
      }
      parent.child.push(node);
    },
  });

  return results;
}

module.exports = html2json;
