var Url = {

  href: function(path, skip_domain) {
    skip_domain = skip_domain || false
    var domain = window.has_subdomais ? "" : (skip_domain ? "" : window.cur_domain );
    var lang = window.lang_prefix ? window.lang_prefix.replace(/\/$/, "") : "";

    var url = [window.location.origin, lang, domain, path.replace(/^\//, "")].clean("").join("/");
    return url;
  },
  encode: function (str) {

    str = (str + '').toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+')
      .replace(/"/g,"%22");
  },
  param: function(name) {
    var params = new RegExp('(\\?|&)' + name + '(\\[\\])?=([^&]*)').exec(window.location.search);
    return params ? decodeURIComponent(params[3]) : null;
  },
  params: function(params) {
    params = params || {};
    search = {};

    window.location.search.slice(1).split('&')
      .map(function(i) { return i.split('='); })
      .filter(function(i) { return i[0]; })
      .forEach(function(i) { search[i[0]] = i[1]; })

    Object.keys(params)
      .forEach(function(k) { search[k] = params[k]; })

    return Object.keys(search)
      .filter(function(k) { return search[k]; })
      .reduce(function(obj, i) { obj[i] = search[i]; return obj; }, {});
  },
  query: function(params) {
    params = this.params(params);
    search = Object.keys(params)
      .map(function(k) { return k + '=' + params[k]; })
      .join('&');

    return search.length ? '?' + search : '';
  },
  build: function(path, skip, params) {
    var lang = window.lang_prefix ? window.lang_prefix.replace(/\/$/, '') : '';
    path = path.replace(new RegExp('/'+lang+'|'+lang+'/'), '');
    return this.href(path, skip) + this.query(params);
  }
}
