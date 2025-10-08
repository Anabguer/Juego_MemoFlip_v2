(function () {
  // 1) Config
  var cfg = (window.__MEMOFLIP_CONFIG__ = window.__MEMOFLIP_CONFIG__ || {});
  var basePath   = cfg.basePath   || '/sistema_apps_upload/memoflip_static';
  var baseCards  = cfg.cardsPath  || (basePath + '/cards');
  var baseSounds = cfg.soundsPath || (basePath + '/sounds');

  // 2) Reescritor
  function rewrite(url) {
    if (typeof url !== 'string') return url;
    if (url === '/logo.png') return basePath + '/logo.png';
    if (url.startsWith('/cards/'))  return url.replace('/cards',  baseCards);
    if (url.startsWith('/sounds/')) return url.replace('/sounds', baseSounds);
    return url;
  }

  // 3) Interceptar setAttribute('src', ...)
  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (name === 'src' && typeof value === 'string') {
      value = rewrite(value);
    }
    return origSetAttr.call(this, name, value);
  };

  // 4) Interceptar constructor Audio(url)
  var OrigAudio = window.Audio;
  window.Audio = function (src) {
    if (typeof src === 'string') src = rewrite(src);
    return new OrigAudio(src);
  };
  window.Audio.prototype = OrigAudio.prototype;

  // 5) Interceptar setters .src de <img> y <audio>
  function patchSrcSetter(Proto) {
    var desc = Object.getOwnPropertyDescriptor(Proto, 'src');
    // si el navegador no expone descriptor, salimos
    if (!desc || !desc.set || !desc.get) return;

    Object.defineProperty(Proto, 'src', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function () { return desc.get.call(this); },
      set: function (val) { desc.set.call(this, rewrite(val)); }
    });
  }
  patchSrcSetter(HTMLImageElement.prototype);
  patchSrcSetter(HTMLAudioElement.prototype);

  // 6) Reparar <link rel="icon" href="/logo.png"> si quedara alguno
  document.addEventListener('DOMContentLoaded', function(){
    Array.from(document.querySelectorAll('link[rel~="icon"]')).forEach(function(link){
      if (link.href.endsWith('/logo.png')) {
        link.href = basePath + '/logo.png';
      }
    });
  });

  // 7) Log
  console.log('[path-shim] PRO activo', { basePath, baseCards, baseSounds });
})();
