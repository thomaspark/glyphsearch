var index = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons'),
  innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4" data-clipboard-text="{{{class}}}">' +
    '<div class="description">{{{class}}}</div>' +
    '<div class="thumb"><i class="{{{class}}}"></i></div>' +
    '<div class="name">{{{_highlightResult.name.value}}}</div>' +
    '<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
    '<div class="clearfix"></div>' +
    '</div>',
  innerTemplateCompiled = Hogan.compile(innerTemplate),
  allTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4" data-clipboard-text="{{{class}}}">' +
    '<div class="description">{{{class}}}</div>' +
    '<div class="thumb"><i class="{{{class}}}"></i></div>' +
    '<div class="name">{{{name}}}</div>' +
    '<div class="tags hidden-xs">{{{tags}}}</div>' +
    '<div class="clearfix"></div>' +
    '</div>',
  allTemplateCompiled = Hogan.compile(allTemplate),
  icons = {},
  $libraries = $("#libraries > button"),
  qs = $.url().param();

ZeroClipboard.config({
  moviePath: "bower_components/zeroclipboard/dist/ZeroClipboard.swf",
  forceHandCursor: true
});

var clip = new ZeroClipboard($(".entry")),
    flashEnabled = false;

function setLibrary(library) {
  var qs = $.url().param();
  qs.library = library;
  history.replaceState(null, "GlyphSearch", "?" + $.param(qs));
  $libraries.removeClass("active");
  $("[data-library='" + library + "']").addClass("active");

  if (library == "all") {
    $(".section").removeClass("hide");
    return;
  } else {
    $(".section").addClass("hide");
    $(".section#" + library).removeClass("hide");
  }
}

function doQuery() {
  var qs = $.url().param(),
      query = $("#search").val();

  if (query.length > 0) {
    qs.query = query;
  } else {
    delete qs.query;
  }

  history.replaceState(null, "GlyphSearch", "?" + $.param(qs));
}

function search(v) {
  v = $.trim(v);

  if ($('#search').data('q') == v) {
    // do not perform the same query twice, results will not change
    return;
  }

  $('#search').data('q', v);

  if (v.length === 0) {
    load(icons);
  } else {
    index.search(v, function(success, content) {
      if (!success) return;

      var result = {};
      generate(content.hits, innerTemplateCompiled, result);
      load(result);

    }, {hitsPerPage: 1000});
  }
  doQuery();
}

function generate(data, template, output) {
  data.forEach(function(v, i){
    var lib,
        html;

    if (v.name) {
      lib = v._tags[0];
      html = template.render(v);

      if (!output[lib]) {
        output[lib] = html;
      } else {
        output[lib] += html;
      }
    }
  });
}

function load(htmls) {
  $('.section').hide();
  $('.icons').empty();

  for (var i in htmls) {
    $('#' + i + ' .icons').html(htmls[i]).parent().show();
  }

  if (flashEnabled) clip.clip($(".entry"));
}

function handlers() {
  var $libraries = $("#libraries > button");

  $('#search').change(function() {
    search($(this).val());
  }).keydown(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      return;
    }
  }).keyup(function(e) {
    if (e.which == 27) {
      $(this).val('').change();
      return;
    }
    search($(this).val());
  }).focus(function(){
    $(this).attr("placeholder", "");
  }).blur(function(){
    $(this).attr("placeholder", "Search");
  });

  $libraries.click(function(e){
    e.preventDefault();
    var library = $(this).attr("data-library");
    setLibrary(library);
  });

  clip.on("ready", function() {
    flashEnabled = true;

    clip.on("copy", function(e) {
      console.log("copied", e);    });

    clip.on("aftercopy", function(e) {
      var c = e.data["text/plain"];
      $("#big-icon").removeClass().addClass(c);
      console.log("aftercopy", c);
      $(".copied").show().find("div").addClass("animateIn");
      setTimeout('$(".copied div").removeClass("animateIn").addClass("animateOut");$(".copied").fadeOut(function(){$(".copied div").removeClass("animateOut")})', 700);
    });

    clip.clip($(".entry"));
  });

  clip.on("error", function(e) {
    console.log(e);

    $(".icons").on("click", ".entry", function(){
      var name = $(this).find(".description").text();
      window.prompt("Copy to clipboard:", name);
    });
  });
}

$.getJSON("./data/batch.json", function(data) {
  generate(data, allTemplateCompiled, icons);
  handlers();

  if(qs.library) {
    setLibrary(qs.library);
  }
  if(qs.query) {
    $("#search").val(qs.query);
    search(qs.query);
  } else {
    load(icons);
  }
});
