/*

  TextareaAutoResize

*/
(function(){
  if (!window.getComputedStyle || !document.documentElement.querySelector || !document.documentElement.setAttribute) {
    return;
  }

  (window.TextareaAutoResize = {}).init = function(el) {
    if (el.nodeName !== 'TEXTAREA' || el.getAttribute('textarea-auto-resize-initted-')) {
      return;
    }

    el.setAttribute('textarea-auto-resize-initted', true);
    el.style.overflow = 'hidden';
    el.style.overflowY = 'hidden';
    el.style.wordWrap = 'break-word';

    // force text reflow
    var text = el.value;
    el.value = '';
    el.value = text;

    var append = '';

    var mirrorStyle = (
      'position: absolute; top: -999px; right: auto; bottom: auto;' +
      'left: 0; overflow: hidden; -webkit-box-sizing: content-box;' +
      '-moz-box-sizing: content-box; box-sizing: content-box;' +
      'min-height: 0 !important; height: 0 !important; padding: 0;' +
      'word-wrap: break-word; border: 0;'
    );

    var mirror = document.createElement('textarea');
    mirror.setAttribute('tabindex', -1);
    mirror.setAttribute('style', mirrorStyle);

    var elStyle = getComputedStyle(el);

    var borderBox = elStyle.getPropertyValue('box-sizing') === 'border-box' || elStyle.getPropertyValue('-moz-box-sizing') === 'border-box' || elStyle.getPropertyValue('-webkit-box-sizing') === 'border-box';
    var boxOuter = !borderBox ? { width: 0, height: 0 } : {
      width: parseInt(elStyle.getPropertyValue('border-right-width'), 10) +
             parseInt(elStyle.getPropertyValue('padding-right'), 10) +
             parseInt(elStyle.getPropertyValue('padding-left'), 10) +
             parseInt(elStyle.getPropertyValue('border-left-width'), 10)
      ,
      height: parseInt(elStyle.getPropertyValue('border-top-width'), 10) +
              parseInt(elStyle.getPropertyValue('padding-top'), 10) +
              parseInt(elStyle.getPropertyValue('padding-bottom'), 10) +
              parseInt(elStyle.getPropertyValue('border-bottom-width'), 10)
    };

    var minHeightValue = parseInt(elStyle.getPropertyValue('min-height'), 10);
    var heightValue = parseInt(elStyle.getPropertyValue('height'), 10);
    var minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height;
    var maxHeight = parseInt(elStyle.getPropertyValue('max-height'), 10);

    // Opera returns max-height of -1 if not set
    maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

    // append mirror to the DOM
    if (mirror.parentNode !== document.body) {
      document.body.appendChild(mirror);
    }

    el.style.resize = 'none';

    var mirrored;
    var active;
    var copyStyle = ['font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-transform', 'word-spacing', 'text-indent'];

    var initMirror = function() {
      mirrored = el;
      // copy the essential styles from the textarea to the mirror
      elStyle = getComputedStyle(el);
      copyStyle.forEach(function(val) {
        mirrorStyle += val + ':' + elStyle.getPropertyValue(val) + ';';
      });
      mirror.setAttribute('style', mirrorStyle);
    };

    var adjust = function() {
      if (mirrored !== el) {
        initMirror();
      }

      // active flag prevents actions in function from calling adjust again
      if (!active) {
        active = true;

        mirror.value = el.value + append; // optional whitespace to improve animation
        mirror.style.overflowY = el.style.overflowY;

        var elHeight = el.style.height === '' ? 'auto' : parseInt(el.style.height, 10);

        var elComputedStyleWidth = getComputedStyle(el).getPropertyValue('width');

        // ensure getComputedStyle has returned a readable 'used value' pixel width
        if (elComputedStyleWidth.substr(elComputedStyleWidth.length - 2, 2) === 'px') {
          // update mirror width in case the textarea width has changed
          var width = parseInt(elComputedStyleWidth, 10) - boxOuter.width;
          mirror.style.width = width + 'px';
        }

        var mirrorHeight = mirror.scrollHeight;
        var overflow;

        if (mirrorHeight > maxHeight) {
          mirrorHeight = maxHeight;
          overflow = 'scroll';
        } else if (mirrorHeight < minHeight) {
          mirrorHeight = minHeight;
        }
        mirrorHeight += boxOuter.height;

        el.style.overflowY = overflow || 'hidden';

        if (elHeight !== mirrorHeight) {
          el.style.height = mirrorHeight + 'px';
        }

        setTimeout(function(){
          active = false;
        }, 1000 || 1); // TODO
      }
    }

    var forceAdjust = function() {
      active = false;
      adjust();
    };

    window.addEventListener('resize', forceAdjust);

    el.addEventListener('input', function() {
      forceAdjust();
    });

    setTimeout(adjust);
  };
})();


/*

  App

*/
(function(){
  if (!window.getComputedStyle || !document.documentElement.querySelector || !document.documentElement.setAttribute) {
    return;
  }

  var pitchPlaceholder = [
    'the evolving role of of technology in our society.',
    'whether or not Trump is actually serious about making America “great again”.',
    'ballroom dance.',
    'pencil sketching.',
    'the history of the Situationists.'
  ];

  var currentPitchPlaceholder = 0;
  var setPitchPlaceholder = function() {
    placeholder.innerHTML = pitchPlaceholder[currentPitchPlaceholder];
    currentPitchPlaceholder = (currentPitchPlaceholder + 1) % pitchPlaceholder.length;
  };

  setPitchPlaceholder();
  setInterval(setPitchPlaceholder, 3000);

  pitch.addEventListener('input', function(){
    if (pitch.value) {
      placeholder.setAttribute('hide', '');
    } else {
      placeholder.removeAttribute('hide');
    }
  });

  var dummyTextarea = document.querySelector('.lets-talk .textarea');
  pitch.addEventListener('focus', function(){
    dummyTextarea.setAttribute('focused', '');
  });
  pitch.addEventListener('blur', function(){
    dummyTextarea.removeAttribute('focused');
  });

  pitch.addEventListener('keydown', function(e){
    if (e.keyCode === 13) {
      console.log('asd');
      submit.setAttribute('active', '');
    }
  });
  pitch.addEventListener('keyup', function(e){
    if (e.keyCode === 13) {
      submit.removeAttribute('active');
    }
  });
  pitch.addEventListener('blur', function(){
    submit.removeAttribute('active');
  });

  TextareaAutoResize.init(pitch);

  var setTextareaIndent = function() {
    pitch.style.textIndent = document.querySelector('.lets-talk .prompt').getBoundingClientRect().width + 'px';
  };
  setTextareaIndent();
  window.addEventListener('resize', setTextareaIndent);

  pitch.focus();

  var form = document.querySelector('.lets-talk');

  var submitPitch = function() {
    form.setAttribute('submitted', '');
    url.value = location.protocol + '//' + location.host + '/' + Math.round(Math.random() * 9999999999);
  };

  form.addEventListener('submit', function(e){
    e.preventDefault();
    submitPitch();
  });

  pitch.addEventListener('keydown', function(e){
    if (e.keyCode === 13) {
      e.preventDefault();
      submitPitch();
    }
  });

  pitch.addEventListener('keydown', function(e){
    if (e.keyCode === 13) {
      e.preventDefault();
      submitPitch();
    }
  });

  url.addEventListener('click', function(){
    url.focus();
    url.select();

    document.querySelector('.share').classList.add('focused-once');
  });
})();
