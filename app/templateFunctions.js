var _ = require('underscore');

module.exports = function(app, env) {

  env.addFilter('aposArea', function(name, page, types) {
    // get an array of content for this area
    var contents = _.filter(page.content, function(c) {
      return c.area == name;
    });

    if(contents) {
      return env.render('area.partial.html', { contents: contents, name: name, slug: page.slug, types: types });
    } else {
      return env.render('newArea.partial.html', { name: name, slug: page.slug, types: types });
    }
  });

  env.addFilter('aposContent', function(type, content) {
    return env.render(type + '.partial.html', { content: content });
  });

}