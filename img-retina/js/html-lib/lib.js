(function($) {
    var Prism = (function(Prism) {
        'use strict';
        var init = function() {
            $("._lib-code").each(function() {
                var $code = $(this),
                        html = $code.html(),
                        escapedHTML = html.replace(/<.*? style=".*?">(.*?)<\/.*?>/g, '$1').replace(/ style=".*?"/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                escapedHTML = '<div class="_code"><div class="_code-visible"><button type="button">Show code</button></div><div class="_code-hidden"><button type="button">Hide code</button><pre><code class="language-markup">' + escapedHTML + '</code></pre></div></div>';
                $(escapedHTML).insertAfter(this);
            });
        };
        return {
            init: function() {
                init();
            }
        };
    }(Prism || {}));
    Prism.init();

    $('._code-visible button').click(function() {
        var $code = $(this).parent().parent();
        $code.addClass('show');

        var codeHeight = $code.outerHeight() + 20;
        var codeOverflow = ($code.offset().top + codeHeight) - ($(document).scrollTop() + $(window).height());

        console.log($code.height(), $(window).height());

        if (codeOverflow > 0 && codeHeight < $(window).height()) {
            $(window).scrollTop($(document).scrollTop() + codeOverflow);
        }
    });

    $('._code-hidden button').click(function() {
        var $code = $(this).parent().parent();
        $code.removeClass('show');
    });
}(jQuery));

