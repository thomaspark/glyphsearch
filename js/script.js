(function() {
  var iconsIndex = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons'),
    innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-3" data-library="{{{library}}}" data-name="{{{name}}}" data-unicode="{{{unicode}}}">' +
      '<div class="description">{{{class}}}</div>' +
      '<div class="thumb">{{{html}}}</div>' +
      '<div class="name">{{{_highlightResult.name.value}}}</div>' +
      '<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
      '</div>',
    allTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-3" data-library="{{{library}}}" data-name="{{{name}}}" data-unicode="{{{unicode}}}">' +
      '<div class="description">{{{class}}}</div>' +
      '<div class="thumb">{{{html}}}</i></div>' +
      '<div class="name">{{{name}}}</div>' +
      '<div class="tags hidden-xs">{{{tags}}}</div>' +
      '</div>',
    innerTemplateCompiled = Hogan.compile(innerTemplate),
    allTemplateCompiled = Hogan.compile(allTemplate),
    icons = {},
    clip,
    flashEnabled = false;

  var state = {
    library: "all",
    query: "",
    copy: "markup"
  };

  var qs = $.url().param();
  setState("library", qs.library || "all");
  setState("copy", qs.copy || "markup");

  $.getJSON("./data/batch.json", function(data) {
    generate(data, allTemplateCompiled, icons);
    handlers();

    setState("query", qs.query || "");
  });

  function setLibrary(library) {
    var qs = $.url().param();

    $("#libraries > .btn").removeClass("active");
    $("[data-library='" + library + "']").addClass("active");

    if (library == "all") {
      delete qs.library;
      $("body").addClass("all");
      $(".section").removeClass("hide");
      refreshSticky();
    } else {
      qs.library = library;
      $("body").removeClass("all");
      $(".section").addClass("hide");
      $(".section#" + library).removeClass("hide");
    }

    updateURL(qs);
  }

  function setCopy(copy) {
    var qs = $.url().param();

    $("#copy > .btn").removeClass("active");
    $("[data-copy='" + copy + "']").addClass("active");

    if (copy == "markup") {
      delete qs.copy;
    } else {
      qs.copy = copy;
    }

    updateURL(qs);
  }

  function search(v) {
    v = v || "";
    v = $.trim(v);

    if ($('#search').data('q') == v) {
      // do not perform the same query twice, results will not change
      return;
    }

    $('#search').val(v).data('q', v);

    if (v.length === 0) {
      loadAll(icons);
    } else {
      iconsIndex.search(v, function(success, content) {
        if (!success) return;

        var result = {};
        generate(content.hits, innerTemplateCompiled, result);
        loadAll(result);

      }, {hitsPerPage: 1000});
    }

    var qs = $.url().param();

    if (v.length > 0) {
      qs.query = v;
    } else {
      delete qs.query;
    }

    updateURL(qs);
  }

  function generate(data, template, output) {
    data.forEach(function(v){
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

  function loadAll(htmls) {
    $('.section').hide();
    $('.icons').empty();

    for (var i in htmls) {
      $('#' + i + ' .icons').html(htmls[i]).parent().show();
    }

    if (flashEnabled) {
      clip.clip($(".entry"));
    }

    refreshSticky();
  }

  function refreshSticky() {
    $(".header").fixedsticky("destroy").fixedsticky();
  }

  function updateURL(qs) {
    qs = $.param(qs);

    if (qs.length === 0) {
      history.replaceState(null, "GlyphSearch", "./");
    } else {
      history.replaceState(null, "GlyphSearch", "?" + qs);
    }

    window.scrollTo(0, 0);
  }

  function handlers() {
    $(window).on("resize", debounce(function() {
      refreshSticky();
    }, 250));

    $('#search').keydown(function(e) {
      if (e.which == 13) {
        e.preventDefault();
        return;
      }
    })
    .keyup(function(e) {
      if (e.which == 27) {
        setState("query", "");
        return;
      }

      setState("query", $(this).val());
    })
    .on("change", function() {
      setState("query", $(this).val());
    })
    .on("input", function() {
      var val = $(this).val();
      if (val.length === 0) {
        setState("query", "");
      }
    });

    $("#libraries .btn").click(function(e) {
      e.preventDefault();
      var library = $(this).attr("data-library");
      setState("library", library);
    });

    $("#copy .btn").click(function(e) {
      e.preventDefault();
      $("#copy > .btn").removeClass("active");
      $(this).addClass("active");

      var copy = $(this).attr("data-copy");
      setState("copy", copy);
    });

    FixedSticky.tests.sticky = false; // force firefox to use polyfill
    $(".header").fixedsticky();

    ZeroClipboard.config({
      moviePath: "bower_components/zeroclipboard/dist/ZeroClipboard.swf",
      forceHandCursor: true
    });

    clip = new ZeroClipboard($(".entry"));

    clip.on("ready", function() {
      flashEnabled = true;

      clip.on("copy", function(e) {
        var text = copyText($(e.target));
        e.clipboardData.setData("text/plain", text);
      });

      clip.on("aftercopy", function(e) {
        var c = $(e.target).find(".thumb").html();
        $("#big-icon").empty().html(c);

        $(".copied").show().find("div")
          .addClass("animateIn").delay(700).queue(function(next) {
            var that = $(this);
            that.removeClass("animateIn").addClass("animateOut");
            that.parent().fadeOut(function() {
              that.removeClass("animateOut");
            });
            next();
          });
      });

      clip.clip($(".entry"));
    });

    clip.on("error", function(e) {
      $(".icons").on("click", ".entry", function() {
        var text = copyText($(this));
        window.prompt("Copy to clipboard:", text);
      });
    });
  }

  function copyText(target) {
    var text, object;
    var library = target.attr("data-library");

    if (state.copy === "markup") {
      // "Name": `f35f` => `<i class="ionicons ion-android-arrow-dropdown"></i>`
      text = target.find(".thumb").html();
    } else if (state.copy === "class") {
      // "Name": `f35f` => `ionicons ion-android-arrow-dropdown`
      text = target.find(".description").html();
    } else if (state.copy === "name") {
      // "Name": `f35f` => `android-arrow-dropdown`
      text = target.attr("data-name");
    } else if (state.copy === "unicode") {
      // "Unicode": `f12a` => <UnicodeChar>
      if (target.find("i").hasClass("material-icons")) {
        text = target.attr("data-unicode");
      } else {
        var hex = target.attr("data-unicode");
        text = String.fromCharCode(parseInt(hex, 16));
      }
    } else if (state.copy === "svg") {
      // "SVG Markup": `f12a` => `<svg ...><path ... d="..."></path></svg>`
      var unicodeHex = target.attr("data-unicode")
      var svgFont = svgFonts.filter(function(f) { return f.id === library })[0]
      object = svgFont.pathByUnicode(unicodeHex, {width: 24, height: 24})
      text = object.outerHTML
    }

    console.log("[" + library + "]: COPY `" + state.copy + "`\n---\n", text, "\n---\n", object, "\n\n")

    return text;
  }

  function setState(prop, val) {
    if (prop == "library") {
      setLibrary(val);
    } else if (prop == "copy") {
      setCopy(val);
    } else if (prop == "query") {
      search(val);
    }

    state[prop] = val;
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  var svgFontRoot = '/bower_components'
  var svgFonts = []

  setTimeout(function() {
    svgFonts = [
      new SVGFont('font-awesome', svgFontRoot + '/font-awesome/fonts/fontawesome-webfont.svg'),
      new SVGFont('foundation', svgFontRoot + '/foundation-icon-fonts/foundation-icons.svg'),
      new SVGFont('glyphicons', svgFontRoot + '/bootstrap/dist/fonts/glyphicons-halflings-regular.svg'),
      new SVGFont('icomoon', svgFontRoot + '/icomoon/dist/fonts/icomoon.svg'),
      new SVGFont('ionicons', svgFontRoot + '/ionicons/fonts/ionicons.svg'),
      new SVGFont('material', svgFontRoot + '/material-design-icons/iconfont/MaterialIcons-Regular.svg'),
      new SVGFont('octicons', svgFontRoot + '/octicons/octicons/octicons.svg'),
    ]
  }, 0)

}());
