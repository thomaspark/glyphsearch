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
  $filters = $("#filter a"),
  qs = $.url().param();

ZeroClipboard.setDefaults({
  moviePath: "bower_components/zeroclipboard/ZeroClipboard.swf",
  forceHandCursor: true
});

var clip = new ZeroClipboard(),
    flashEnabled = false;

function doFilter(filter){
  var qs = $.url().param();
  qs.library = filter;
  history.replaceState(null, "GlyphSearch", "?" + $.param(qs));
  var libraryItem = $("ul").find("[data-filter='" + filter + "']");
  $filters.removeClass("active");
  libraryItem.addClass("active");
  $("#filter-label").text(libraryItem.text());

  if (filter == "all") {
    $(".section").removeClass("hide");
    return;
  } else {
    $(".section").addClass("hide");
    $(".section-" + filter).removeClass("hide");
  }
}

function doQuery(){
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

  load(output);
}

function load(htmls) {
  $('.section.row').empty();

  for (var i in htmls) {
    $('#' + i).html(htmls[i]);
  }

  $(".entry").addClass("loaded");
  if (flashEnabled) clip.glue($(".entry"));
}

function handlers() {
  var $filters = $("#filter a");

  $('#search').change(function() {
    search($(this).val());
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

  $(".search-term").click(function(){
    $("#search").val($(this).text()).focus().change();
    doQuery();
  });

  $filters.click(function(e){
    e.preventDefault();
    var filter = $(this).attr("data-filter");
    doFilter(filter);
  });

  clip.on("load", function() {
    flashEnabled = true;

    clip.on("complete", function(client, args) {
      var messages = ["COPIED!", "GOT IT!", "PASTE ME!"];
      var colors = ["#1abc9c", "#2ecc71", "#9b59b6", "#3498db", "#34495e", "#e74c3c"];
      var randomTextNum = Math.floor(Math.random() * messages.length);
      var randomColorNum = Math.floor(Math.random() * colors.length);
      $(".copied div").html(messages[randomTextNum]);
      $("#big-icon").removeClass();
      $("#big-icon").addClass(args.text);
      $(".copied").css("background-color", colors[randomColorNum]).show().find("div").addClass("animateIn");
      setTimeout('$(".copied div").removeClass("animateIn").addClass("animateOut");$(".copied").fadeOut(function(){$(".copied div").removeClass("animateOut")})', 700);
    });

    clip.on("mouseout", function() {
      $(".entry").removeClass("zeroclipboard-is-hover");
    });

    clip.glue($(".entry"));
  });

  clip.on("noflash", function() {
    $(".section.row").on("click", ".entry", function(){
      var name = $(this).find(".description").text();
      window.prompt("Copy to clipboard:", name);
    });
  });
}

$.getJSON("./data/batch.json", function(data) {
  handlers();
  if(!qs.library && !qs.query) {
    generate(data, allTemplateCompiled, icons);
  }
  if(qs.library) {
    doFilter(qs.library);
  }
  if(qs.query) {
    $("#search").val(qs.query).change();
  }
});
