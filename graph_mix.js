
/*
* @preserve shorten.js v{{version}}
* (c) 2015 Pierre Reimertz
* may be freely distributed under the MIT license.
*/

(function(exports, body){
  'use strict';

  var hashids = new Hashids("shorten-github-io", 0, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"),
      checkUrl = new XMLHttpRequest(),
      timeRequest = new XMLHttpRequest(),
      ipRequest = new XMLHttpRequest(),
      regex = new RegExp("https?:.+"),
      form, iframe,
      ipNumberAsInt, epochDiff;

  function shortenUrl(url, callback, retries){
    if(retries && retries > 10) return callback(new Error('Error retrieving your ip-number or ms since epoch. :('), null);

    if(!ipNumberAsInt) return setTimeout(function(){ shortenUrl(url, callback, retries++ || 0); }, 500);
    if(!epochDiff) return setTimeout(function(){ shortenUrl(url, callback, retries++ || 0); }, 500);

    if(!regex.test(url)) return callback(new Error('Malformed url..'), null);

    var hashString = generateHash();

    form[0].value = 'https://shorten.github.io/r?u=' + url + '&_sid=' + hashString;
    form[1].value = hashString;

    form.submit();
    return callback(null, 'https://s10.li/' + hashString);
  };

  function generateHash(){
    var uniqueId = Math.abs(Date.now() - epochDiff);
        uniqueId += ipNumberAsInt;
        uniqueId += Math.floor(Math.random() * (12345 - 678)) + 678;

    return hashids.encode(uniqueId);
  }

  function gotTime(json){
    epochDiff = parseInt(json.dateString) - Date.now();
  }

  function injectTimeScript() {
    var timeScript = document.createElement('script');
        timeScript.setAttribute('type', 'text/javascript');
        timeScript.setAttribute('src', '//timeapi.herokuapp.com/utc/now.json?format=\\Q&callback=shortenGotTime');

        body.appendChild(timeScript);
  }

  function fetchIpNumber(){
    ipRequest.open('GET', '//api.ipify.org', true);

    ipRequest.onload = function() {
      if (ipRequest.status >= 200 && ipRequest.status < 400) {
        ipNumberAsInt = parseInt(ipRequest.responseText.split(".").join("")) //comes as xxx.xxx.xxx.xxx
      }
    };

    ipRequest.onerror = function() {
      // ;-;
    };

    ipRequest.send();
  }

  function injectIframe() {
    iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'shorten-iframe');
    iframe.setAttribute('src', '//git.io');
    iframe.style.cssText = 'display:none;';

    body.appendChild(iframe);
  }

  function injectForm() {
    form = document.createElement('form');
    form.setAttribute('id', 'shorten-form');
    form.setAttribute('action', '//git.io');
    form.setAttribute('method', 'POST');
    form.setAttribute('enctype', 'multipart/form-data');
    form.setAttribute('target', 'shorten-iframe');
    form.style.cssText = 'display:none;';

    var urlInput = document.createElement("input");
        urlInput.setAttribute('type', 'text');
        urlInput.setAttribute('name', 'url');

    var codeInput = document.createElement("input");
        codeInput.setAttribute('type', 'text');
        codeInput.setAttribute('name', 'code');

    form.appendChild(urlInput);
    form.appendChild(codeInput);
    body.appendChild(form);
  }

  function init(){
    injectTimeScript();
    injectForm();
    injectIframe();

    fetchIpNumber();
  }

  var shorten = {
    url: function (url, cb) {
      return shortenUrl(url, cb);
    }
  }

  init();

  exports.shorten = shorten;
  exports.shortenGotTime = gotTime;

})(window, document.getElementsByTagName('body')[0]);