global.requireRoot = function(name) {
  return require(__dirname + "/" + name);
};

global.messages = requireRoot("installer/ui/messages.json");
