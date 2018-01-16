(function(a) {
    if(a.fn.caret !== undefined) return !1;
    a.fn.extend({
        caret: function(a, b) {
            if (this.length != 0) {
                if (typeof a == "number") {
                    b = typeof b == "number" ? b : a;
                    return this.each(function() {
                        if (this.setSelectionRange)
                            this.setSelectionRange(a, b);
                        else if (this.createTextRange) {
                            var c = this.createTextRange();
                            c.collapse(!0),
                            c.moveEnd("character", b),
                            c.moveStart("character", a),
                            c.select()
                        }
                    })
                }
                if (this[0].setSelectionRange)
                    a = this[0].selectionStart,
                    b = this[0].selectionEnd;
                else if (document.selection && document.selection.createRange) {
                    var c = document.selection.createRange();
                    a = 0 - c.duplicate().moveStart("character", -1e5),
                    b = a + c.text.length
                }
                return {
                    begin: a,
                    end: b
                }
            }
        },
    })
})(jQuery)
