/*
 t.kumpanenko@gmail.com
 JQuery Accordion Plugin v 1.1
 */

  $(document).ready(function(){

    $(".js-show-matrix").click(function(e){
      if(! $(e.target).hasClass('js-close-matrix')){

      $(".js-prices-matrix"). show();
      $(this).addClass("active");

      setTimeout(function(){
              /* matrix*/
            var direct_block = $(".js-d-block"),
                changes_block = $(".js-c-block"),
                direct_showmore = direct_block.find(".js-showmore"),
                changes_showmore = changes_block.find(".js-showmore");
                matrix_min_width = 7;
            if (direct_block.length == 0 || changes_block.length == 0) {
              $(".js-matrix-block").width("100%");
              var main_row = $(".js-matrix-row").first(),
                  items_quant = main_row.find(".js-matrix-item").length,
                  parent_width = main_row.parents(".js-matrix-block").width(),
                  item_width = parent_width/7;
                  $(".js-matrix-row").width(item_width*items_quant);
            } else {
              $(".prices-matrix").css('margin','0 -3px');
              $(".js-matrix-block").css({
                'float':'left',
                'margin':'0 3px'
              });
              var main_row1 = direct_block.find(".js-matrix-row").first(),
                  main_row2 = changes_block.find(".js-matrix-row").first(),
                  items_quant1 = main_row1.find(".js-matrix-item").length,
                  items_quant2 = main_row2.find(".js-matrix-item").length,
                  quant1 = main_row1.find(".js-matrix-item").length,
                  quant2 = main_row2.find(".js-matrix-item").length;

              if (quant1 == quant2) {
                $(".js-matrix-block").width($(".prices-matrix").width() / 2 - 6).css({
                  'float':'left',
                  'margin':'0 3px'
                });
                var main_row = $(".js-matrix-row").first(),
                    items_quant = main_row.find(".js-matrix-item").length,
                    parent_width = main_row.parents(".js-matrix-block").width(),
                    item_width = parent_width/4;
                    $(".js-matrix-row").width(item_width*items_quant);
              } else {
                if (quant1 > quant2) {
                    block_width1 = Math.floor($(".prices-matrix").width() * 60 / 100 - 6);
                    block_width2 = Math.floor($(".prices-matrix").width() * 40 / 100 - 6);
                    item_width1 = Math.floor(block_width1/4);
                    item_width2 = Math.floor(block_width2/3);
                    direct_block.width(block_width1);
                    direct_block.find(".js-matrix-item").width(item_width1);
                    direct_block.find(".js-matrix-row").width(item_width1*items_quant1);
                    changes_block.width(block_width2);
                    changes_block.find(".js-matrix-item").width(item_width2);
                    changes_block.find(".js-matrix-row").width(item_width2*items_quant2);
                } else {
                    block_width1 = Math.floor($(".prices-matrix").width() * 40 / 100 - 6);
                    block_width2 = Math.floor($(".prices-matrix").width() * 60 / 100 - 6);
                    item_width1 = Math.floor(block_width1/3);
                    item_width2 = Math.floor(block_width2/4);
                    direct_block.width(block_width1);
                    direct_block.find(".js-matrix-item").width(item_width1);
                    direct_block.find(".js-matrix-row").width(item_width1*items_quant1);
                    changes_block.width(block_width2);
                    changes_block.find(".js-matrix-item").width(item_width2);
                    changes_block.find(".js-matrix-row").width(item_width2*items_quant2);
                }
              }
            }
      }, 50);
      }

      setTimeout(function(){
        $(".js-showmore").each(function(){
          $(this).width($(this).parents(".matrix-block").find(".matrix-block__item").width() + 1);
        });
      }, 75);

    });

    $(".js-close-matrix").click(function(){
      $(".js-prices-matrix").hide();
      $(".js-show-matrix").removeClass("active");
    });


});
