var endTime = function (time, expr) {
  if(expr.tag === 'note') {
    return expr.dur + time;
  }

  var left, right;
  if(expr.tag === 'par') {
    left = expr.left;
    right = expr.right;
    return time + Math.max(endTime(time, left), endTime(time, right));
  }

  // sequence
  left = expr.left;
  var leftTime = endTime(time, left);
  right = expr.right;
  return endTime(leftTime, right);
};

var compile = function (musexpr) {
  var notes = [];
  var startTime = 0;
  return compilePart(notes, musexpr, startTime);
};

var compilePart = function(notes, expr, startTime) {
  if(expr.tag === 'note') {
    notes.push({
        tag: 'note',
        pitch: expr.pitch,
        start: startTime,
        dur: expr.dur
    });
    return notes;
  }
  // parallel
  var left, right;
  if(expr.tag === 'par') {
    left = expr.left;
    right = expr.right;
    compilePart(notes, left, startTime);
    compilePart(notes, right, startTime);
    startTime = endTime(startTime, expr);
    return notes;
  }
  // sequence
  left = expr.left;
  right = expr.right;
  notes = compilePart(notes, left, startTime);
  startTime = endTime(startTime, left);
  return compilePart(notes, right, startTime);
};