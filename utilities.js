function containsArray(arrayOfArrays, array) {
  var i = arrayOfArrays.length;
  while (i--) {
     if (arrayOfArrays[i].toString() == array.toString()) {
         return true;
     }
  }
  return false;
}
