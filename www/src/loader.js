/*
 * @id 507c059137e68 - (!!!) Идентификатор добавляется автоматически. Запрещено ручное изменение и копирование идентификатора при создании новых файлов (!!!) 
 */
/*
 * @require loader.css
 * @require jquery/jquery.js
 */
$('html').addClass('loading');
require.finish = function(){
    $('html').removeClass('loading');
};

