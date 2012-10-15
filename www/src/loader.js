/*
 * @require loader.css
 * @require jquery/jquery.js
 */
$('html').addClass('loading');
require.finish = function(){
    $('html').removeClass('loading');
};

