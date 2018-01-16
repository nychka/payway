Hub.subscribe('payment_manager_activated', function(obj){
  var decodartor = Hub.dispatcher.getManager('payment').getDecorator();

});