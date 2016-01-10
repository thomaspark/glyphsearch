'use strict';

// Source (ES6): https://github.com/grimen/svg-fontglyphs2svg/blob/master/src/js/svgfont.js

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

if (typeof exports !== 'undefined') {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVGFont = (function () {
    function SVGFont(id, uri, options) {
        var _this = this;

        _classCallCheck(this, SVGFont);

        this.id = id;
        this.uri = uri;
        this.options = options || {};
        this.verbose = true;

        this.listeners = [];
        this.onload = function () {
            if (_this.verbose) console.log('[SVGFont]: LOAD', [_this.id, _this.uri]);
        };
        this.onerror = function () {
            if (_this.verbose) console.error('[SVGFont]: ERROR', [_this.id, _this.uri]);
        };

        this.embed();
    }

    _createClass(SVGFont, [{
        key: 'on',
        value: function on(name, callback) {
            if (this.complete) {
                callback();
            }
            this.listeners.push([name, callback]);
        }
    }, {
        key: 'embed',
        value: function embed() {
            var _this2 = this;

            if (!this.object) {
                (function () {
                    var _object = document.createElement('object');
                    _object.setAttribute('id', _this2.id);
                    _object.setAttribute('type', 'image/svg+xml');
                    _object.setAttribute('data', _this2.uri);

                    var _onLoad = function _onLoad() {
                        var _content = _object.contentDocument.querySelector('svg');

                        if (!_content) {
                            return _onError();
                        }

                        _this2.complete = true;

                        _object.setAttribute('data-complete', _this2.complete);

                        _this2.onload();

                        _this2.listeners.forEach(function (listener) {
                            var name = listener[0],
                                callback = listener[1];
                            if (name === 'load') callback();
                        });
                    };

                    var _onError = function _onError() {
                        _this2.complete = false;

                        _object.setAttribute('data-complete', _this2.complete);

                        _this2.onerror();

                        _this2.listeners.forEach(function (listener) {
                            var name = listener[0],
                                callback = listener[1];
                            if (name === 'error') callback();
                        });
                    };

                    _object.addEventListener('load', _onLoad, false);
                    _object.addEventListener('error', _onError, false);

                    document.body.appendChild(_object);
                })();
            }
        }
    }, {
        key: 'paths',
        value: function paths(options) {
            var _this3 = this;

            return this.glyphs.map(function (g) {
                return _this3.fontfaceGlyphToPath(g, options);
            }).filter(function (v) {
                return !!v;
            });
        }
    }, {
        key: 'pathByUnicode',
        value: function pathByUnicode(value, options) {
            var _this4 = this;

            options = options || {};

            return this.glyphs.filter(function (g) {
                var unicode = g.getAttribute('unicode');

                // DEBUG:
                // console.log(unicode, escape(unicode), value, `${value}$`, (new RegExp(`${value}$`, 'gmi').test(escape(unicode))))

                return new RegExp(value + '$', 'gmi').test(escape(unicode));
            }).map(function (g) {
                return _this4.fontfaceGlyphToPath(g, options);
            })[0];
        }
    }, {
        key: 'fontfaceGlyphToPath',
        value: function fontfaceGlyphToPath(glyph, options) {
            options = options || {};
            options.width = options.width || this.defaults.width;
            options.height = options.height || this.defaults.height;

            var _fontface = this.fontfaceProps;

            if (!glyph) return null;

            var _d = glyph.getAttribute('d');
            var _unicode = glyph.getAttribute('unicode');
            var _unicodeHex = escape(_unicode).toLowerCase().replace('%u', '');
            var _unicodeHTMLEntity = escape(_unicode).toLowerCase().replace('%u', '&#x') + ';';

            if (!_d) return null;
            if (_d === ' M0,0') return null;
            if (_d === 'M0 0 L0 0 Z') return null;

            var ns = 'http://www.w3.org/2000/svg';

            var _svg = document.createElementNS(ns, 'svg');
            // _svg.setAttribute('data-unicode', _unicode)
            _svg.setAttribute('data-unicode-hex', _unicodeHex);
            // _svg.setAttribute('data-unicode-htmlentity', _unicodeHTMLEntity)
            _svg.setAttribute('xmlns', ns);
            _svg.setAttribute('version', '1.1');
            _svg.setAttribute('width', options.width) / _svg.setAttribute('height', options.height);
            _svg.setAttribute('viewBox', '0 0 ' + _fontface.unitsPerEm + ' ' + _fontface.unitsPerEm);

            var _path = document.createElementNS(ns, 'path');
            _path.setAttribute('transform', 'scale(1, -1) translate(0, -' + _fontface.ascent + ')');
            _path.setAttribute('d', _d);
            _path.setAttribute('fill', 'black');
            _path.setAttribute('stroke', 'none');

            _svg.appendChild(_path);

            return _svg;
        }
    }, {
        key: 'defaults',
        get: function get() {
            return {
                width: 16,
                height: 16
            };
        }
    }, {
        key: 'object',
        get: function get() {
            var _object = document.querySelector('object[id="' + this.id + '"]');
            return _object;
        }
    }, {
        key: 'svg',
        get: function get() {
            if (!this.object) return null;

            var _svg = this.object.contentDocument.querySelector('svg');

            return _svg;
        }
    }, {
        key: 'fontface',
        get: function get() {
            if (!this.svg) return null;
            return this.svg.querySelector('font-face');
        }
    }, {
        key: 'fontfaceProps',
        get: function get() {
            if (!this.fontface) return null;

            var _props = {
                unitsPerEm: this.fontface.getAttribute('units-per-em'),
                ascent: this.fontface.getAttribute('ascent'),
                descent: this.fontface.getAttribute('descent')
            };

            return _props;
        }
    }, {
        key: 'glyphs',
        get: function get() {
            var glyphs = this.svg.querySelectorAll('glyph');
            return Array.prototype.slice.call(glyphs);
        }
    }]);

    return SVGFont;
})();

if (typeof exports !== 'undefined') {
    exports.default = SVGFont;
}