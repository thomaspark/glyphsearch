var index = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons');

var innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4">' +
		'<div class="description">{{{class}}}</div>' +
		'<div class="thumb"><i class="{{{class}}}"></i></div>' +
		'<div class="name">{{{_highlightResult.name.value}}}</div>' +
		'<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
		'<div class="clearfix"></div>' +
	'</div>';
var innerTemplateCompiled = Hogan.compile(innerTemplate);

function search(v) {
	index.search(v, function(success, content) {
		if (!success) {
			return;
		}

		$('#font-awesome').html('');
		$('#glyphicons').html('');
		$('#ionicons').html('');
		for (var i = 0; i < content.hits.length; ++i) {
			var hit = content.hits[i];
			if (hit.name) {
				$('#' + hit._tags[0]).append(innerTemplateCompiled.render(hit));
			}
		}

		$(".entry").click(function(){
			var name = $(this).find(".description").text();
			window.prompt("Copy to clipboard:", name);
		});
	}, { hitsPerPage: 1000 });
}

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

$(".search-term").click(function() {
	$("#search").val($(this).text()).change();
});

search('');

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
		$(".section-" + filter).removeClass("hide");
	}
});
