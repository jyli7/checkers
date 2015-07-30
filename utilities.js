function looseContains(a, obj) {
  var i = a.length;
  while (i--) {
     if (a[i].toString() == obj.toString()) {
         return true;
     }
  }
  return false;
}
