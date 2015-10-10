var P = require('bluebird');
var glob = P.promisify(require('glob'));
var fs = P.promisifyAll(require('fs'));
var VError = require('verror');
var path = require('path');

function loadPluginsAndCollectErrors(pluginDir) {
  return glob(path.resolve(pluginDir, 'lib/node_modules/*/package.json')).then(function(plugins) {
    return plugins.map(function(plugin) {
      return fs.readFileAsync(plugin).then(JSON.parse).then(function(p) {
        p.module = requirePlugin(p.name);
        return p;
      }).catch(function(e) {
        return {
          name: path.basename(path.dirname(plugin)),
          error: new VError(e, "Plugin %s failed to load", path.basename(path.dirname(plugin)))
        };
      });
    });
  });

  function requirePlugin(p) {
    var module = require(path.resolve(pluginDir, 'lib/node_modules', p));
    if (typeof module != 'function') {
      throw new Error("This doesn't look like a plugin");
    }
    return module;
  }
}



module.exports = {
  loadPluginsAndCollectErrors: loadPluginsAndCollectErrors
};
