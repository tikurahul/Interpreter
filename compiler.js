/*
  A function that converts a pitch to a melody
*/
var convertPitch = function(pitch) {
  if(typeof(pitch) === 'string' && pitch.length === 2) {
    var octave = parseInt(pitch[1], 10);
    var letterPitch = "c d ef g a b".indexOf(pitch[0]);
    return 12 + 12 * octave + letterPitch;
  }
};

/*
  A function that computes the endTime for a musical expression, given its start time.
*/
var endTime = function (time, expr) {
  // repeat
  if(expr.tag === 'repeat') {
      var section = expr.section;
      var count = expr.count;
      return time + (count * endTime(section));
  }
  // regular note
  if(expr.tag === 'note') {
    return expr.dur + time;
  }
  // rest
  if(expr.tag === 'rest') {
    return expr.duration + time; 
  }
  var left, right;
  // parallel
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

/*
  A function that recursively computes parts of a musical expression to notes.
*/
var compilePart = function(notes, expr, startTime) {
  // repeat
  if(expr.tag === 'repeat') {
    var section = expr.section;
    var count = expr.count;
    for(var i=0; i<count; i++) {
      compilePart(notes, section, startTime);
      startTime = endTime(startTime, section);
    }
    return notes;
  }
  // regular note
  if(expr.tag === 'note') {
    notes.push({
        tag: 'note',
        pitch: convertPitch(expr.pitch),
        start: startTime,
        dur: expr.dur
    });
    return notes;
  }
  // rest note
  if(expr.tag === 'rest') {
    notes.push({
      tag: 'note',
      start: startTime,
      dur: expr.duration
    });
    return notes;
  }
  // parallel notes
  var left, right;
  if(expr.tag === 'par') {
    left = expr.left;
    right = expr.right;
    compilePart(notes, left, startTime);
    compilePart(notes, right, startTime);
    startTime = endTime(startTime, expr);
    return notes;
  }
  // notes in sequence
  left = expr.left;
  right = expr.right;
  notes = compilePart(notes, left, startTime);
  startTime = endTime(startTime, left);
  return compilePart(notes, right, startTime);
};

/*
  A funtion that compiles musical expressions to notes.
*/
var compile = function (musexpr) {
  var notes = [];
  var startTime = 0;
  return compilePart(notes, musexpr, startTime);
};

/*
  Test musical expression
*/
var melody = 
  { tag: 'seq',
    left: 
     { tag: 'seq',
       left: { tag: 'note', pitch: 'a4', dur: 250 },
       right: { tag: 'note', pitch: 'b4', dur: 250 } },
    right:
     { tag: 'seq',
       left: { tag: 'note', pitch: 'c4', dur: 500 },
       right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(compile(melody));