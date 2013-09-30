$( function() {

  var templates = {
    richText: '#template-rich-text .rich-text-area',
    slideshow: '#template-slideshow .slideshow-area',
    floatedImage: '#floated-image-text .floated-image-area'
  }

  var draggableSettings = {
    handle: '.drag-area',
    revert: 'invalid',
    refreshPositions: true,
    tolerance: 'pointer',
    start: function(event, ui) {
      $(event.target).next('.separator').droppable('disable');
      $(event.target).prev('.separator').droppable('disable');
    },
    stop: function(event, ui) {
      $('.separator').droppable('enable');
    }
  };

  function bindRichTextAreas(context) {

    // --------------- RICH TEXT AREA ----------------

    $(context).find('.edit-pane').click( function() {
      var self = this;
      var parentElement = $(this).parents('.rich-text-area');
      var area = $(parentElement).parents('.apos-area');
      // hide the edit pane
      $(this).parents('.edit').hide();
      // get the editable area and turn ckeditor on
      var target = $(self).parent().siblings('.text-area')[0];
      $(target).focus();
      var instance = CKEDITOR.inline(target);
      // console.log(instance);
      // var instance = CKEDITOR.replace( target, { extraPlugins: 'floating-tools' } );

      $(target).blur( function() {
        instance.destroy();
        $(self).parents('.edit').show();
        console.log('posting data...');

        data = $(parentElement).attr('data-object');
        if(data) {
          data = JSON.parse(data);
        }
        console.log('data from data-object is:');
        console.log(data);
        console.log(typeof data);

        var success = function(data) { 'saved: ' + Date() };

        // if there's no data then we are making a new piece of content
        if(!data) {
          data = {
            content: { text: $(parentElement).find('[data-name="rich-text-content"]').html() },
            area: $(area).data('name'),
            slug: $(area).data('slug'),
            type: 'RichText',
            _id: ""
          }

          success = function(data) {
            $(parentElement).attr('data-object', data);
            console.log('saved the data:');
            console.log(data);
          }

        } else {
          data.content.text = $(parentElement).find('[data-name="rich-text-content"]').html();
          data.area = $(area).data('name');
          data.slug = $(area).data('slug');
        }

        console.log(data);

        $.ajax({
          type: 'POST',
          url: '/content',
          data: data,
          success: success
        });
        $(this).off('blur');
      });
    });

    // add rich text button
    $(context).find('[data-action="add-RichText"]').click( function() {
      // go to the parent container and add a clone of the template after it
      $(this).parents(context).after( $(templates.richText).clone(true, true) );
    });
    $(context).find('[data-action="add-Slideshow"]').click( function() {
      // go to the parent container and add a clone of the template after it
      $(this).parents(context).after( $(templates.slideshow).clone(true, true) );
    });
    $(context).find('[data-action="trash"]').click( function() {
      $(this).parents(context).remove();
    });
  }

  function bindSlideshowAreas(context) {
    $(context).find('[data-action="add-RichText"]').click( function() {
      // go to the parent container and add a clone of the template after it
      $(context).after( $(templates.richText).clone(true, true) );
    });
    $(context).find('[data-action="add-Slideshow"]').click( function() {
      // go to the parent container and add a clone of the template after it
      $(context).after( $(templates.slideshow).clone(true, true) );
    });
    $(context).find('[data-action="trash"]').click( function() {
     $(this).parents(context).remove();
    });
  }

  $('.add-content [data-action="add-RichText"]').click( function() {
    addNewObject(templates.richText, this);
  });

  $('.add-content [data-action="add-Slideshow"]').click( function() {
    addNewObject(templates.slideshow, this);
  });

  function addNewObject(template, context) {
    var newClone = $(template).clone(true, true);
    $(context).parents('.apos-area').append( $(newClone) );
    newClone.draggable(draggableSettings);
    if(newClone.is('.rich-text-area')) {
      newClone.droppable(richTextDropSettings);
    }
    refreshSeparators();
  }

  // -------------------------------------------[]

  CKEDITOR.disableAutoInline = true;
  CKEDITOR.plugins.add('splitter', {
    init: function(editor) {
      editor.addCommand('split', {
        exec: function(editor) {
          // editor.getSelection().getRanges()[0].moveToElementEditEnd(editor.getSelection().getRanges()[0].root)
          console.log('?');
          var range = new CKEDITOR.dom.range( document );
          range.setStart( document.getBody(), 0 );
          range.setEndAt( hr, CKEDITOR.POSITION_AFTER_END );
          range.select();
        }
      });
      editor.ui.addButton('split', {
        label: 'split',
        command: 'split',
        toolbar: 'basicstyles'
      });
    }
  });

  // CKEDITOR.config.extraPlugins = 'splitter';

  CKEDITOR.config.toolbar = [
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'split' ] }
  ];



  // -------------------------------------------[]

  bindRichTextAreas('.rich-text-area');
  bindSlideshowAreas('.slideshow-area');

  $('.settings').click( function() {
    $('.white-overlay').toggleClass('show');
    $('.settings-menu').toggleClass('show');
  });

  $('.white-overlay').click( function() {
    $(this).toggleClass('show', false);
    $('.settings-menu').toggleClass('show', false);
  });

  $('.add-content-button').click( function() {
    $(this).parents('.editable-area').find('.add-drawer').toggleClass('open');
    $(this).parents('.editable-area').find('.edit-pane').toggleClass('drawer');
  });

  $('.editable-area').hover( function(){}, function() {
    $(this).find('.add-drawer').toggleClass('open', false);
    $(this).find('.edit-pane').toggleClass('drawer', false);
  });

  $('.move-up').click( function() {
    var parent = $(this).parents('.editable-area');
    if( !$.isEmptyObject($(parent).prevAll('.editable-area').eq(0)) ) {
      $(parent).insertBefore($(parent).prevAll('.editable-area').eq(0));
      refreshSeparators();
    }
  });

  $('.move-down').click( function() {
    var parent = $(this).parents('.editable-area');
    if( !$.isEmptyObject($(parent).nextAll('.editable-area').eq(0)) ) {
      $(parent).insertAfter($(parent).nextAll('.editable-area').eq(0));
      refreshSeparators();
    }
  });

  // draggadrop

  function refreshSeparators() {
    $('.separator').remove();

    var firstSeparator = $('<div class="separator"></div>');
    firstSeparator.droppable(separatorDropSettings);
    $('.editable-area').eq(0).before(firstSeparator);

    $('.editable-area').each( function() {
      var separator = $('<div class="separator"></div>');
      separator.droppable(separatorDropSettings);
      $(this).after(separator);
    });
  }

  var richTextDropSettings = {
    accept: '.rich-text-area, .slideshow-area',
    hoverClass: 'over',
    tolerance: 'pointer',

    drop: function(event, ui) {

      if(ui.draggable.hasClass('slideshow-area')) {
        var newElement = $(templates.floatedImage).clone(true, true);
        newElement.find('[data-name="rich-text-content"]').html($(event.target).find('[data-name="rich-text-content"]').html());
        newElement.draggable(draggableSettings);
        bindFloatedImageArea(newElement);
        $(event.target).after( newElement );
        $(event.target).remove();
        $(ui.draggable).remove();
      } else {
        var content = $(ui.draggable).find('[data-name="rich-text-content"]').html();
        $(ui.draggable).remove();
        $(event.target).find('[data-name="rich-text-content"]').append('<br>' + content);
      }

      refreshSeparators();
    }
  };

  $('.apos-area').find('.editable-area').draggable(draggableSettings);

  var separatorDropSettings = {
    accept: '.editable-area',
    activeClass: 'active',
    hoverClass: 'over',
    tolerance: 'pointer',

    drop: function(event, ui) {
      var area = $(ui.draggable);
      area.removeAttr('style');
      $(event.target).after(area);
      refreshSeparators();
    }
  }

  refreshSeparators();
  $('.apos-area').find('.rich-text-area').droppable( richTextDropSettings );


  function bindFloatedImageArea(element) {
    $(element).find('.editor').hide();
    $(element).find('.edit-pane').click( function() {
      $(element).find('.edit').hide();
      $(element).find('.viewer').hide();
      $(element).find('.editor').show();

      var target = $(element).find('[data-text-editor]')[0];
      console.log(target);
      $(target).focus();
      var instance = CKEDITOR.inline(target, { floatSpaceDockedOffsetX: -80, floatSpaceDockedOffsetY: -45 });
      $(target).one('blur', function(e) {
        console.log('blur');
        instance.destroy();
        $(element).find('.viewer .text-area').html( $(this).html() );
        $(element).find('.edit').show();
        $(element).find('.viewer').show();
        $(element).find('.editor').hide();
      });
    });
  }

});