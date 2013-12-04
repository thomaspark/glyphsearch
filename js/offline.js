var $filters = $("#filter a");

$("#search")
  .keyup(function(e) {
    if (e.keyCode == 27) {
      $(this).val("").change();
    }
  })
  .focus(function(){
    $(this).attr("placeholder", "");
  })
  .blur(function(){
    $(this).attr("placeholder", "Search");
  })
  .fastLiveFilter("#entries .row");

$(".search-term").click(function(){
  $("#search").val($(this).text()).focus().change();
});

$filters.click(function(e){
  e.preventDefault();
  var filter = $(this).attr("data-filter");

  $filters.removeClass("active");
  $(this).addClass("active");
  $("#filter-label").text($(this).text());

  if (filter == "all"){
    $(".section").removeClass("hide");
    return;
  } else {
    $(".section").addClass("hide");
    $(".section-" + filter).removeClass("hide");
  }
});

ZeroClipboard.setDefaults({
  moviePath: "bower_components/zeroclipboard/ZeroClipboard.swf",
  forceHandCursor: true
});

var clip = new ZeroClipboard();

clip.on("load", function() {
  clip.on("complete", function() {
    var messages = ["COPIED!", "GOT IT!", "PASTE ME!"];
    var colors = ["#1abc9c", "#2ecc71", "#9b59b6", "#3498db", "#34495e", "#e74c3c"];
    var randomTextNum = Math.floor(Math.random() * messages.length);
    var randomColorNum = Math.floor(Math.random() * colors.length);
    $(".copied div").html(messages[randomTextNum]);
    $(".copied").css("background-color", colors[randomColorNum]).show().find("div").addClass("animateIn");
    setTimeout('$(".copied div").removeClass("animateIn").addClass("animateOut");$(".copied").fadeOut(function(){$(".copied div").removeClass("animateOut")})', 700);
  });

  clip.on("mouseout", function() {
    $(".entry").removeClass("zeroclipboard-is-hover");
  });

  clip.glue($(".entry"));
});

clip.on( "noflash", function() {
  $(".section.row").on("click", ".entry", function(){
    var name = $(this).find(".description").text();
    window.prompt("Copy to clipboard:", name);
  });
});
