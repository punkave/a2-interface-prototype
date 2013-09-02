$( function() {

  var templates = {
    richText: '#template-rich-text .rich-text-area'
  }

  function bindRichTextAreas(context) {

    // --------------- RICH TEXT AREA ----------------

    $(context).find('.edit-pane').click( function() {
      var self = this;
      var parentElement = $(this).parents('.rich-text-area');
      // hide the edit pane
      $(this).parents('.edit').hide();
      // get the editable area and turn ckeditor on
      var target = $(self).parent().siblings('.editable-area')[0];
      $(target).focus();
      var instance = CKEDITOR.inline(target);

      $(target).blur( function() {
        instance.destroy();
        $(self).parents('.edit').show();
        console.log('posting data...');
        $.ajax({
          type: 'POST',
          url: '/apos-content',
          data: {
            slug: $(parentElement).parents('.apos-area').data('slug'),
            area: $(parentElement).parents('.apos-area').data('name'),
            content: $(parentElement).find('[data-name="rich-text-content"]').html(),
            id: $(target).data('id')
          },
          success: function(data) {
            console.log('saved: ' + Date());
          }
        });
        $(this).off('blur');
      });
    });

    // add rich text button
    $(context).find('[data-action="add-rich-text"]').click( function() {
      // go to the parent container and add a clone of the template after it
      $(this).parents('.rich-text-area').after( $(templates.richText).clone(true, true) );
    });
  }

  function requestNewContent(slug, type, areaName, callback) {

  }

  $('[data-action="add-rich-text"]').click( function() {
    // get the container, remove it, and replace it
    var container = $(this).parents('[data-type="add-content"]');
    container.parent().append( $(templates.richText).clone(true, true) );
  });

  CKEDITOR.disableAutoInline = true;
  CKEDITOR.config.toolbar = [
    { name: 'basicstyles', items: [ 'Bold', 'Italic' ] }
  ];

  bindRichTextAreas('.rich-text-area')
  // bindRichTextAreas('#template-rich-text');

});