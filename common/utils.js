
export function getDisplayMonth(month) {
  const strMonth =["Jan", "Feb", "Mar", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  return strMonth[month];
}


// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}
