$.Controller("FooterController2", {
    init:function(){
        this.initDropdown();
    },
    initDropdown: function(){
      $('.js-dropdown').on('click', function(){
        $(this).toggleClass('active');
        $('.js-dropdown').not(this).removeClass('active');
        return false;
      });
      $(window).on('click', function(){
        $('.js-dropdown').removeClass('active')
      });
    }
});