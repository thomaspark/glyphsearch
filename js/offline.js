$(".entry").click(function(){
	var name = $(this).find(".description").text();
	window.prompt ("Copy to clipboard:", name);
});

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

var filters = $("#filter a");

filters.click(function(e){
	e.preventDefault();
	var filter = $(this).attr("data-filter");

	filters.removeClass("active");
	$(this).addClass("active");
	$("#filter-label").text($(this).text());

	if (filter == "all"){
		$(".section").removeClass("hide");
		return;
	} else {
		$(".section").addClass("hide");
		$("." + filter).removeClass("hide");
	}
});