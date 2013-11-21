var $filters = $("#filter a");

ZeroClipboard.setDefaults( { moviePath: 'bower_components/zeroclipboard/ZeroClipboard.swf' } );
var clip = new ZeroClipboard( );
clip.on( 'complete', function(client, args) {
        alert("Copied text to clipboard: " + args.text );
});
clip.on( 'mouseout', function(client, args) {
    $(".entry").removeClass("zeroclipboard-is-hover");
});
clip.on( 'noflash', function ( client, args ) {
  alert("You don't support flash");
} );
clip.glue( $(".entry") , $(".section") );

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
	.fastLiveFilter('#entries .row');

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
