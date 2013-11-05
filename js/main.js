var index = new AlgoliaSearch("9JQV0RIHU0", "2219d421236cba4cf37a98e7f97b3ec5").initIndex('icons');
var innerTemplate = '<div class="description">{{{class}}}</div>' +
		'<div class="thumb"><i class="{{{class}}}"></i></div>' +
		'<div class="provider">{{{_tags}}}</div>' +
		'<div class="name">{{{_highlightResult.name.value}}}</div>' +
		'<div class="tags">{{{_highlightResult.tags.value}}}</div>' +
		'<div class="clearfix"></div>';
var innerTemplateCompiled = Hogan.compile(innerTemplate);

function init(tag) {
	var options = { hitsPerPage: 5 };
	if (tag) {
		options.tags = tag;
	}

	$("#search").typeahead('destroy');
	$("#search").typeahead({
		name: 'icons',
		remote: index.getTypeaheadTransport(options),
		engine: Hogan,
		template: '<div class="hit">' + innerTemplate + '</div>',
		valueKey: 'name',
	}).focus().on('typeahead:selected', function(obj, datum, name) {
		search(datum.name);
	}).on('keyup.tt', function(e) {
		if (e.which == 13 || String.fromCharCode(e.which).match(/[a-zA-Z_-]/)) {
			search($(this).val());
			if (e.which != 13) {
				$("#search").focus();
			}
		}
		return true;
	});
}
init();

function search(v) {
	$("#search").trigger('blur');
	index.search(v, function(success, content) {
		if (!success) {
			return;
		}
		$('#font-awesome').html('');
		$('#glyphicons').html('');
		$('#ionicons').html('');
		var hit, html;
		for (var i = 0; i < content.hits.length; ++i) {
      hit = content.hits[i];
      if (hit.name) {
	      html = '<div class="entry">' + innerTemplateCompiled.render(hit) + '</div>';
	      $('#' + hit._tags[0]).append(html);
	    }
    }
		$(".entry").click(function(){
			var name = $(this).find(".description").text();
			window.prompt("Copy to clipboard:", name);
		});
	}, { hitsPerPage: 1000 });
}

$('#search').on('change', function() {
	search($(this).val());
});
$(".search-term").click(function(){
	$("#search").typeahead('setQuery', $(this).text()).focus();
});

search("");

var filters = $("#filter a");

filters.click(function(e){
	e.preventDefault();
	var filter = $(this).attr("data-filter");

	filters.removeClass("active");
	$(this).addClass("active");
	$("#filter-label").text($(this).text());

	if (filter == "all"){
		$(".section").removeClass("hide");
		init();
		return;
	} else {
		init(filter);
		$(".section").addClass("hide");
		$("." + filter).removeClass("hide");
	}
});
