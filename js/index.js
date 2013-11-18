var index = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons'),
	innerTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4">' +
		'<div class="description">{{{class}}}</div>' +
		'<div class="thumb"><i class="{{{class}}}"></i></div>' +
		'<div class="name">{{{_highlightResult.name.value}}}</div>' +
		'<div class="tags hidden-xs">{{{_highlightResult.tags.value}}}</div>' +
		'<div class="clearfix"></div>' +
		'</div>',
	innerTemplateCompiled = Hogan.compile(innerTemplate),
	allTemplate = '<div class="entry col-lg-1 col-md-2 col-sm-3 col-xs-4">' +
		'<div class="description">{{{class}}}</div>' +
		'<div class="thumb"><i class="{{{class}}}"></i></div>' +
		'<div class="name">{{{name}}}</div>' +
		'<div class="tags hidden-xs">{{{tags}}}</div>' +
		'<div class="clearfix"></div>' +
		'</div>',
	allTemplateCompiled = Hogan.compile(allTemplate),
	icons = {};

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
}

$.getJSON("./data/batch.json", function(data) {
	generate(data, allTemplateCompiled, icons);
	handlers();
});
