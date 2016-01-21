var path = require("path");
var expandHomeDir = require("expand-home-dir");

module.exports = normalizeFolder;

function normalizeFolder (folder) {
  if (!folder) return folder;

  if (folder.charAt(0) == '.') {
    return path.join(process.cwd(), folder);
  }

  return expandHomeDir(folder);
}
