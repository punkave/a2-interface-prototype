var _ = require('underscore');

module.exports = function(app, env) {

  env.addFilter('aposArea', function(name, page) {
    area = _.find(page.areas, function(area) {
      return area.name == name;
    });

    if(area) {
      return env.render('area.partial.html', { area: area, slug: page.slug });
    } else {
      return env.render('newArea.partial.html', { name: name, slug: page.slug });
    }
  });

  env.addFilter('aposContent', function(type, content) {
    return env.render(type + '.partial.html', { content: content });
  });

}