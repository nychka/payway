if (!Array.prototype.clean) {
  Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == deleteValue) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  }
}
if (!Array.prototype.unset) {
  Array.prototype.unset = function(value) {
      if(typeof(this.indexOf) == "function" && this.indexOf(value) != -1) {
          this.splice(this.indexOf(value), 1);
      }
      return this;
    }
}


if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
       for (var i = (start || 0), j = this.length; i < j; i++) {
           if (this[i] === obj) { return i; }
       }
       return -1;
  }
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(action, that ) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

if( !console ){
  var console = function(){
    return {
      log: function(){},
      info: function(){},
      warning: function(){},
    }
  }()
}

String.prototype.width = function(font) {
  var f = font || '12pt arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w;
};

String.prototype.replaceAt=function(index, character) {
  return this.substr(0, index) + character + this.substr(index+character.length);
};
String.prototype.replaceArray = function(find, replace) {
  string = this;
  for (var i = 0; i < find.length; i++) {
    string = string.replace(find[i], replace[i]);
  }
  return string;
};
Object.values = function (obj) {
  var vals = [];
  for( var key in obj ) {
      if ( obj.hasOwnProperty(key) ) {
          vals.push(obj[key]);
      }
  }
  return vals;
};
String.prototype.ltrim = function() {
  return this.replace(/^\s+/,"");
};

if (typeof String.prototype.capitalize !== 'function') {
    String.prototype.capitalize = function( lc, all, ignor_symbol ) {
        ignor_symbol = ignor_symbol || []
        if ( all ) {
            return this.split( " " ).map( function( currentValue, index, array ) {
                return currentValue.capitalize( lc, false,  ignor_symbol);
            }, this ).join( " " ).split( "-" ).map( function( currentValue, index, array ) {
                return currentValue.capitalize( false, false, ignor_symbol);
            }, this ).join( "-" );
        } else {
          return (ignor_symbol.indexOf(this.charAt( 0 )) == -1?this.charAt( 0 ).toUpperCase():this.charAt( 0 )) + (lc?this.slice( 1 ).toLowerCase():this.slice( 1 ));
        }
    };
};

String.prototype.ljust = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width )
    return this + padding.repeat( width - this.length );
  else
    return this;
}
String.prototype.rjust = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width )
    return padding.repeat( width - this.length ) + this;
  else
    return this;
}
String.prototype.center = function( width, padding ) {
  padding = padding || " ";
  padding = padding.substr( 0, 1 );
  if( this.length < width ) {
    var len   = width - this.length;
    var remain  = ( len % 2 == 0 ) ? "" : padding;
    var pads  = padding.repeat( parseInt( len / 2 ) );
    return pads + this + pads + remain;
  }
  else
    return this;
}
String.prototype.toUnderscore = function(){
  return this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};
String.prototype.ucFirst = function() {
  var str = this;
  if(str.length) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
};
