(function() {
  var iconsIndex = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons'),
    innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-3" data-name={{{name}}} data-unicode="{{{unicode}}}">' +
      '<div class="description">{{{class}}}</div>' +
      '<div class="thumb">{{{html}}}</div>' +
      '<div class="name">{{{_highlightResult.name.value}}}</div>' +
      '<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
      '</div>',
    allTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-3" data-name={{{name}}} data-unicode="{{{unicode}}}">' +
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
    $('#loader').hide();

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

    clip = new Clipboard(".entry", {
      text: function(trigger) {
        return copyText($(trigger));
      }
    });

    clip.on("success", function(e) {
      var c = $(e.trigger).find(".thumb").html();
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

      e.clearSelection();
    });

    clip.on("error", function(e) {
      $(".icons").on("click", ".entry", function() {
        var text = copyText($(this));
        window.prompt("Copy to clipboard:", text);
      });
    });
  }

  function copyText(target) {
    var text;

    if (state.copy === "markup") {
      text = target.find(".thumb").html();
    } else if (state.copy === "class") {
      text = target.find(".description").html();
    } else if (state.copy === "name") {
      text = target.attr("data-name");
    } else if (state.copy === "unicode-hexadecimal") {
      // "Hex": `f12a` => `f12a`
      var unicodeHex = target.attr("data-unicode");
      text = unicodeHex;
    } else if (state.copy === "htmlentity") {
      // "HTMLEntity": `f123` => `&#xf123;`
      var unicode = target.attr("data-unicode");
      text = ['&#x', unicode, ';'].join('');
    } else if (state.copy === "unicode") {
      // "Unicode": `f12a` => <UnicodeChar>
      var hex = target.attr("data-unicode");
      text = String.fromCharCode(parseInt(hex, 16));
    }

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
}());
