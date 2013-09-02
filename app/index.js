var _ = require('underscore');

function renderError(message) {
  return "<div class='error'>" + message + "</div";
}

// check the route.
//  - look for a page?
//    (make a page)
// load the data for the page
// pass it to the template
// template renders the areas....
// done

module.exports = function(app, env, mongo) {
  var self = this;

  var contentTypes = require('./contentTypes');

  var AposPage = contentTypes.AposPage;
  var AposArea = contentTypes.AposArea;
  var AposContent = contentTypes.AposContent;

  // env.addFilters for rendering partial templates
  require('./templateFunctions')(app, env);

  // routes for saving go here

  app.post('/apos-content', function(req, res) {

    var slug = req.body.slug;
    var areaName = req.body.area;
    var content = req.body.content;
    var id = req.body.id;
    console.log(slug);
    console.log(areaName);
    console.log(content);
    console.log(id);

    AposPage.findOne({ slug: slug }, function(err, page) {
      if(err) {
        console.log('error finding aposPage while posting content');
        return res.send('error finding aposPage while posting content');
      }

      // if the page already has areas
      if(page.areas.length) {
        area = _.find(page.areas, function(a) {
          return a.name == areaName;
        });
        if(area) {
          aposContent = _.find(area.content, function(c) {
            return c.id == id;
          });
          if(aposContent) {
            aposContent.content = content;
          } else {
            var newContent = new AposContent({ type: 'RichText', content: content });
            area.content.push(newContent);
          }
          page.save( function(err) {
            if(err) {
              console.log('error saving existing area in page');
              console.log(err);
              return res.send('error saving existing area in page.');
            }
            return res.send(newContent || aposContent);
          });
        }
      }
      // if the page doesn't have any areas yet...
      else {
        // make a new area
        var newArea = new AposArea({ name: areaName, content: content });
        page.areas.push(newArea);
        page.save( function(err) {
          if(err) {
            console.log('error saving new area in page');
            console.log(err);
            return res.send('error saving new area in page.');
          }
          return res.json(newArea);
        });
      }
    });
  });

  app.post('/apos-content/new', function(req, res) {
    var slug = req.body.slug;
    var areaName = req.body.area;
    var type = req.body.type;
    console.log('new content requested...');
    AposPage.findOne({ slug: slug }, function(err, page) {
      if(err) {
        console.log('error finding page.');
        res.send('error finding page');
      }

      if(page.areas.length) {
        area = _.find(page.areas, function(a) {
          return a.name == areaName;
        });



        // stuck here!



      } else {
        // make a new piece of content and put it in a new area
        var newContent = new AposContent({ type: type });
        var newArea = new AposArea({ name: areaName, content: newContent });
        page.areas.push(newArea);
        page.save( function(err) {
          if(err) {
            console.log('error saving new area in page');
            console.log(err);
            return res.send('error saving new area in page.');
          }
          return res.json(newContent);
        });
      }
    });
  });

  // main page route

  app.get('/pages/:slug', function(req, res) {

    var url = req.params.slug;

    AposPage.findOne({ slug: url }, function(err, page) {
      if(err) {
        return res.send('there was an error finding apospage');
      }

      if(page) {
        // render the template
        console.log('found an existing page');
        res.render('index.html', { page: page });
      } else {
        // make the page, render the template
        console.log('making a new page...');
        var newPage = new AposPage({ slug: url });

        newPage.save( function(err) {
          if(err) {
            res.send('there was an error saving a new apospage');
          }

          res.render('index.html', { page: newPage });
        });
      }
    });
  });

}