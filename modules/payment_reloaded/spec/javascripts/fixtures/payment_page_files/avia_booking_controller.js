$.Controller("AviaBookingController", "V2AviaBookingController", {

    PREBOOKING_PAGE_INTERACTION: 1,
    BOOKING_PAGE_INTERACTION: 2,
    PAYMENT_CARD_INTERACTION: 3,

    INTERACTION_LIMIT: 4,

    init: function () {
        window.enable_input_plugin = function () {
        };
        this.super_call("init");
        this.filed_chars = {}
        this.filed_chars[this.parent.PREBOOKING_PAGE_INTERACTION] = 0
        this.filed_chars[this.parent.BOOKING_PAGE_INTERACTION] = 0
        this.filed_chars[this.parent.PAYMENT_CARD_INTERACTION] = 0

        this.setup_validation();
        this.setup_submit();

        if (passengers_data) {
            this.fill_passengers_data();
        }

        if (user_data) {
            this.fill_user_data();
        }
        if (typeof(criteo_enabled) != 'undefined' && criteo_enabled) {
            this.add_criteo();
        }
        if (typeof(cityads_enabled) != 'undefined' && cityads_enabled) {
            this.add_cityads();
        }

        this.page_load_valid();
        this.payment_text_alignment();
        if (scroll_to_payment && $('.s7-recommendations-block').length == 0 && $('.fly-class:visible').length == 0) this.scroll_to('element', 500, $('.payment_block'), false);
        //fix card type label
        $('[id*="card-type"]').parents('.card-type-list__item').find('.iCheck-helper,img').click(function () {
            $('samp.error[for*="card-type"]').remove();
        })
        window.on_clicks_klog();
        var self = this;
        $(document).ready(function () {
            setTimeout(self.check_hide_ancillary_tabs, 50);
            setTimeout(function () {
                $('.nationality_my_class').hide();
            }, 5000);
        });
    },
    // EVENTS START
    "#accept_checkbox -> click": function (e) {
        $(e.target).removeClass('.error').parents('.i_accept:first').removeClass('error');
    },
    ".js-book-button -> click": function (e) {
        e.preventDefault();
        var card_link = $("#lcc_charge_data");
        if ($(".error:visible").length > 0 && this.element.find('samp.error:visible:first').length) {
            this.check_tabs_field();
            if (typeof this.element.find('samp.error:first').attr('for') != "undefined" && this.element.find('samp.error:first').attr('for').indexOf('card-type') > 0) this.scroll_to('first_error_label', 500, false, true, 140);
            // else this.scroll_to('first_error_field', 500);
        } else if (!this.element.find("#accept_checkbox").is(':checked') || (card_link.length && card_link.data('hide_charge_popup') !== true)) {
            return false;
        } else {
            window.show_globus_loader();
        }
    },

    ".js-visa-info-link -> click": function (e) {
        e.preventDefault();
        $('.js-timc-nationality-select').caret($('.js-timc-nationality-select').val().length);
    },
    "#additional_services input:checkbox, .insurance-block__item-package input:checkbox -> click": function (e) {
        var add_service_name = e.target.id.replace('checkbox-v-', '').replace('id_', '').replace(/-/g, "_") + ($(e.target).is(':checked') ? '_checked' : '_unchecked');
        ga('send', 'event', '3.2 Upsale', 'click', add_service_name);
    },
    ".sms-services #id_mobile-route -> change": function (ev) {
        if (document.getElementById('id_sms-ticket').checked) {
            document.getElementById('id_sms-ticket').checked = false;
            $("label[for='id_sms-ticket']").removeClass("ui-state-active");
        }
    },
    ".sms-services #id_sms-ticket -> change": function (ev) {
        if (document.getElementById('id_mobile-route').checked) {
            document.getElementById('id_mobile-route').checked = false;
            $("label[for='id_mobile-route']").removeClass("ui-state-active");
        }
    },
    // EVENTS END

    // FUNCTION START
    beforeunload_from_page: function () {
        return I18n.avia_leave_booking_msg;
    },
    check_tabs_field: function () {
        var block_err = this.element.find('samp.error:first'),
            parent_tab = block_err.closest('.tab-content.additional-service');
        if (parent_tab.length > 0) {
            block_err.closest('.js-tab-block').find('.tab-content.additional-service').removeClass('active')
            parent_tab.addClass('active')
        }
    },
    page_load_valid: function () {
        this.element.find(".js-users-data input:visible:not(:disabled)").valid();
        $('samp.error').addClass('hidden');
    },

    track_auto_cancel: function (native_xhr, ajaxOptions, native_thrownError, parse_response) {
        if (!parse_response) {
            if (typeof(session_id) != "undefined") {
                log_error((native_xhr.status ? native_xhr.status : '--') + ': ' + native_thrownError, session_id, '');
            }
        }
        $.ajax({
            url: "/" + window.lang_prefix + window.gds + "/search/cancel_booking_by_session_id",
            type: "POST",
            data: {
                session_id: session_id,
                recommendation_id: recommendation_id,
                msg: (native_xhr.status + ':' + native_thrownError)
            },
            dataType: "json",
            success: function (resp) {
                if (resp && resp.redirect) {
                    $(window).unbind('beforeunload');
                    window.location.href = resp.redirect;
                } else {
                    if (parse_response) {
                        $('.line_loader_bg').hide();
                        message('msg_title', I18n.server_error, 'continue_button', window.close_message);
                    }
                }
            },
            error: function () {
                message('msg_title', I18n.server_error, 'continue_button', window.close_message);
            }
        });
    },

    error_call_back: function (xhr, ajaxOptions, thrownError) {
        var self = this;
        self.track_auto_cancel(xhr, ajaxOptions, thrownError, false);
        setTimeout(function () {
            self.track_auto_cancel(xhr, ajaxOptions, thrownError, true)
        }, 15000);
    },

    add_criteo: function () {
        var s = document.createElement("script");
        s.async = true;
        s.src = "//static.criteo.net/js/ld/ld.js";
        var fs = document.getElementsByTagName("script")[0];
        fs.parentNode.insertBefore(s, fs);

        window.criteo_q = window.criteo_q || [];
        window.criteo_q.push(
            {event: "setAccount", account: criteo_id},
            {event: "setSiteType", type: (is_mobile ? 'm' : is_table ? 't' : 'd')},
            {event: "setHashedEmail", email: hashed_mail},
            {
                event: "viewBasket", item: [
                {id: window.criteoTripCities, price: window.criteoBasketPrice, quantity: 1}
            ]
            }
        );
    },
    add_cityads: function () {
        var s = document.createElement("script");
        s.id = "xcntmyAsync";
        var fs = document.getElementsByTagName("script")[0];
        fs.parentNode.insertBefore(s, fs);

        var xcnt_transport_from = window.cityAdsTripCities["from"],
            xcnt_transport_to = window.cityAdsTripCities["to"],
            xcnt_transport_currency = window.cityAdsBasketCurrency,
            xcnt_transport_price = window.cityAdsBasketPrice;

        (function (d) {
            var xscr = d.createElement('script');
            xscr.async = 1;
            xscr.src = '//x.cnt.my/async/track/?r=' + Math.random();
            var x = d.getElementById('xcntmyAsync');
            x.parentNode.insertBefore(xscr, x);
        })(document)
    },
    payment_text_alignment: function () {
        $(".js-price-column-html").each(function () {
            td_width = $(this).find(".js-price-column-width").width();
            $(this).width(td_width);
        });
    },
    before_show_errors_after_submit: function () {
        if ($('.js-page-need-separate').length > 0 && typeof $('.js-page-need-separate').controller() != "undefined" && $('.js-page-need-separate').controller().get_page_position() == 'after_book' && location.hash == '#sp') {
            history.back();
        }
        window.hide_globus_loader();
    },
    check_hide_ancillary_tabs: function () {
        var disable_tabs = $(".js-off-single-tab").data("disable_tabs");
        if (typeof(disable_tabs) != 'undefined' && disable_tabs) {
            $('[class^="tab-content additional-service tab-content_service"]').addClass("active");
            $('.js-off-single-tab').addClass("hidden");
        }
    },
    // FUNCTION END
});
