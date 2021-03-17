/*
  An easier way to add ans subtract hours
*/

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

Date.prototype.hrDiff = function(dt2) {
  const milliseconds = Math.abs(dt2 - this);
  return milliseconds / 36e5 // ms in an hr
}
