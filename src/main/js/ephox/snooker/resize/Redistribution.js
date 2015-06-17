define(
  'ephox.snooker.resize.Redistribution',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'ephox.violin.Strings',
    'global!parseFloat',
    'global!parseInt'
  ],

  function (Arr, Fun, Adt, Strings, parseFloat, parseInt) {
    var form = Adt.generate([
      { invalid: [ 'raw' ] },
      { pixels: [ 'value' ] },
      { percent: [ 'value' ] }
    ]);

    var toStr = function (f) {
      return f.fold(function (raw) {
        return 'invalid[' + raw + ']';
      }, function (pixels) {
        return 'pixels[' + pixels + ']';
      }, function (percent) {
        return 'percent[' + percent + ']';
      });
    };

    var validateFor = function (suffix, type, value) {
      var rawAmount = value.substring(0, value.length - suffix.length);
      var amount = parseFloat(rawAmount);
      return rawAmount === amount.toString() ? type(amount) : form.invalid(value);
    };

    var validate = function (value) {
      if (Strings.endsWith(value, '%')) return validateFor('%', form.percent, value);
      if (Strings.endsWith(value, 'px')) return validateFor('px', form.pixels, value);
      return form.invalid(value);
    };

    var redistribute = function (widths, totalWidth, newWidth) {
      return Arr.map(widths, function (w) {
        return toStr(validate(w));
      });
    };

    return {
      validate: validate,
      redistribute: redistribute,
      toStr: toStr
    };
  }
);