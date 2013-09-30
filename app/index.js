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
  var AposContent = contentTypes.AposContent;

  // env.addFilters for rendering partial templates
  require('./templateFunctions')(app, env);

  // routes for saving go here

  app.post('/content', function(req, res) {
    // incoming: id, area (name), type, content, slug
    console.log(req.body);
    var _id = req.body._id;
    var areaName = req.body.area;
    var type = req.body.type;
    var content = req.body.content;
    var slug = req.body.slug;

    // if the id is null, make a new AposContent
    if(!_id) {
      var aposContent = new AposContent({
        area: areaName,
        type: type,
        content: content,
      });
      aposContent.markModified('content');
      aposContent.save( function(err) {
        if(err) {
          res.statusCode = 500;
          return res.send('error saving new aposContent');
        }
        console.log('the aposcontent we just saved:');
        console.log(aposContent);
        // we need to get the page and add a content reference to it
        AposPage.findOne({ slug: slug }, function(err, page) {
          if(err) {
            res.statusCode = 500;
            return res.send('error getting page while saving new aposContent');
          }

          console.log('the page:');
          console.log(page);
          page.content.push(aposContent._id);
          page.save( function(err) {
            if(err) {
              res.statusCode = 500;
              console.log(err);
              return res.send('error saving aposPage');
            }
            // not returning the object for now
            return res.json(aposContent);
          })
        });
      });
    }
    // else get the AposContent by id
    else {
      AposContent.findOne({ _id: _id }, function(err, aposContent) {
        aposContent.content = content;
        aposContent.area = areaName;
        aposContent.markModified('content');
        aposContent.save( function(err) {
          if(err) {
            res.statusCode = 500;
            console.log(err);
            return res.send('error saving aposContent');
          }
          // we don't need to return the object for now.
          return res.send('saved');
        });
      });
    }
  });

  // main page route

  app.get('/pages/:slug', function(req, res) {

    var url = req.params.slug;

    // REFACTOR to join content

    AposPage.findOne({ slug: url }).populate('content').exec( function(err, page) {
      if(err) {
        return res.send('there was an error finding apospage');
        console.log(err);
      }

      if(page) {
        console.log('found a page after populate:');
        console.log(page);
        // render the template
        console.log('found an existing page');
        return res.render('index.html', { page: page });
      } else {
        // make the page, render the template
        console.log('making a new page...');
        var newPage = new AposPage({ slug: url });

        newPage.save( function(err) {
          if(err) {
            res.send('there was an error saving a new apospage');
          }

          return res.render('index.html', { page: newPage });
        });
      }
    });
  });

}