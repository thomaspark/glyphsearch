var index = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons'),
	innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4">' +
		'<div class="description">{{{class}}}</div>' +
		'<div class="thumb"><i class="{{{class}}}"></i></div>' +
		'<div class="name">{{{_highlightResult.name.value}}}</div>' +
		'<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
		'<div class="clearfix"></div>' +
		'</div>',
	innerTemplateCompiled = Hogan.compile(innerTemplate),
	$filters = $("#filter a");

function search(v) {
	if ($('#search').data('q') == v) {
		// do not perform the same query twice, results will not change
		return;
	}
	$('#search').data('q', v);

	index.search(v, function(success, content) {
		if (!success) {
			return;
		}

		$('.section.row').empty();
		for (var i = 0; i < content.hits.length; ++i) {
			var hit = content.hits[i];
			if (hit.name) {
				$('#' + hit._tags[0]).append(innerTemplateCompiled.render(hit));
			}
		}
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

$(".section.row").on("click", ".entry", function(){
	var name = $(this).find(".description").text();
	window.prompt("Copy to clipboard:", name);
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

search('');
