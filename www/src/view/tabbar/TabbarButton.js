(function(App){

    App.defineView('TabbarButton', {
      extend: 'Button',
      className: '',
      init: function(){
          this.parent().init.call(this);
      },
      doRender: function(){
        this.parent().doRender.call(this);
        this.$el.removeClass('dropdown-toggle');
      }
    });

})(App);