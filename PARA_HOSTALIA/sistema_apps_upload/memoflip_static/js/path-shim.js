(function () {
  var cfg = (window.__MEMOFLIP_CONFIG__ = window.__MEMOFLIP_CONFIG__ || {});
  var baseCards = cfg.cardsPath || '/cards';
  var baseSounds = cfg.soundsPath || '/sounds';
  var basePath = cfg.basePath || '';

  // Reescribe src de <img>/<audio> al asignar
  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (name === 'src' && typeof value === 'string') {
      if (value.startsWith('/cards/')) value = value.replace('/cards', baseCards);
      if (value.startsWith('/sounds/')) value = value.replace('/sounds', baseSounds);
      if (value === '/logo.png') value = basePath + '/logo.png';
    }
    return origSetAttr.call(this, name, value);
  };

  // Parche para new Audio('/sounds/...')
  var OrigAudio = window.Audio;
  window.Audio = function (src) {
    if (typeof src === 'string' && src.startsWith('/sounds/')) {
      src = src.replace('/sounds', baseSounds);
    }
    return new OrigAudio(src);
  };
  window.Audio.prototype = OrigAudio.prototype;

  console.log('[path-shim] activo', { baseCards, baseSounds, basePath });
})();

