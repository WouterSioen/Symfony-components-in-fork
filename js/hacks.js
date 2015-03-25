$(document).on('ready', function(){
  $.ajaxSetup({async:false});

  // load the readme file. This makes it easier to read my presentation without setup
  $("#source").load("README.md");
  window.slideshow = remark.create();

  // replace emoji by font awesome icons.
  $('.remark-slides-area .remark-slide-content').each(function(i, item) {
    var matches = $(item).text().match(/:[a-zA-Z]{3,10}:/g);
    if (matches !== null) {
      var html = $(item).html();
      $.each(matches, function(i, match) {
        cleanedMatch = match.replace(/:/g, '');
        html = html.replace(match, '<i class="fa fa-' + cleanedMatch + '"></i>');
      });
      $(item).html(html);
    }
  });

  // add the classes here, so we don't mess up our markdown file
  $('.remark-slides-area .remark-slide-content:first').addClass('center middle');
  $('.remark-slides-area .remark-slide-content:eq(1)').addClass('sumo-wouter');
  $('.remark-slides-area .remark-slide-content:eq(2)').addClass('sumocoders image-replace');
  $('.remark-slides-area .remark-slide-content:eq(3)').addClass('symfony image-replace center middle');
  $('.remark-slides-area .remark-slide-content:eq(4)').addClass('fork image-replace');
  $('.remark-slides-area .remark-slide-content:eq(20)').addClass('dependency-inversion image-replace');
  $('.remark-slides-area .remark-slide-content:eq(27)').addClass('img-right-bottom');
  $('.remark-slides-area .remark-slide-content:eq(46)').addClass('questions image-replace');
  $('.remark-slides-area .remark-slide-content:eq(47)').addClass('center thanks');
});
