export function drawCab() {
  cntx.beginPath();
  cntx.rect(cabX, canvas.height-cabY, cabWidth, cabHeight);
  cntx.fillStyle = 'blue';
  cntx.fill();
}
