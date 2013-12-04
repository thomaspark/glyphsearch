var $filters = $("#filter a");

ZeroClipboard.setDefaults( { moviePath: "bower_components/zeroclipboard/ZeroClipboard.swf" } );
var clip = new ZeroClipboard();
//The complete event is fired when the text is successfully copied to the clipboard.
clip.on("load",function() {
	clip.on("complete", function(client, args) {
		var messages = ["COPIED!", "GOT IT!", "PASTE ME!"];
		var colors = ["#1abc9c", "#2ecc71", "#9b59b6", "#3498db", "#34495e", "#e74c3c"];
	    var randomTextNum = Math.floor(Math.random() * messages.length);
	    var randomColorNum = Math.floor(Math.random() * colors.length);
	    $(".copied div").html(messages[randomTextNum]);
	    $(".copied").css("background-color", colors[randomColorNum]).show().find("div").addClass("animateIn");
	    setTimeout('$(".copied div").removeClass("animateIn").addClass("animateOut");$(".copied").fadeOut(function(){$(".copied div").removeClass("animateOut")})', 700);
	});
	//The mouseout event is fired when the user's mouse pointer leaves the Flash movie.
	clip.on( "mouseout", function(client, args) {
	    $(".entry").removeClass("zeroclipboard-is-hover");
	});
	// glue the element with the flash movie for copying
	clip.glue( $(".entry") );
})
//The noflash event is fired when the user doesn't have flash installed on their system.
clip.on( "noflash", function ( client, args ) {
  	$(".section.row").on("click", ".entry", function(){
		var name = $(this).find(".description").text();
		window.prompt("Copy to clipboard:", name);
	});
} );

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
