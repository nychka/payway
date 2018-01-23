# Use this file to set/override Jasmine configuration options
# You can remove it if you don't need it.
# This file is loaded *after* jasmine.yml is interpreted.

# Example: using a different boot file.
# Jasmine.configure do |config|
#    config.boot_dir = '/absolute/path/to/boot_dir'
#    config.boot_files = lambda { ['/absolute/path/to/boot_dir/file.js'] }
# end
#
# Example: prevent PhantomJS auto install, uses PhantomJS already on your path.
# rake jasmine calls from front2/modules/payment_reloaded
# but root must be front2
root_path = '../../'

src_files = lambda { [
    'www/js/jquery-1.9.1.min.js',
    'www/js/jquery-ui-1.9.2.custom.js',
    'www/js/jquery.validate.js',
    'www/js/modules/payment_reloaded/price_component.js',
    'www/js/modules/payment/hub.js',
    'www/js/modules/payment_reloaded/cards_picker-1.0.0.js',
    'www/js/modules/payment_reloaded/payment_card.js',
    'www/js/modules/payment/service_interface.js',
    'www/js/modules/payment_reloaded/managers/payment_manager-1.0.0.js',
    'www/js/modules/payment_reloaded/managers/bonus_manager-1.0.0.js',
    'www/js/modules/payment_reloaded/payment_system-1.0.0.js',
    'www/js/modules/payment_reloaded/payment_group-1.0.0.js',
    #after all components
    'www/js/modules/payment_reloaded/component_configurator.js'
] }


Jasmine.configure do |config|
  config.src_dir = root_path
  config.src_files = src_files
  config.server_port = 5555
end
