
export function randomNumber(limiter) {
  const rando = Math.random();
  const useful = rando * limiter;
  const usefulInt = Math.floor(useful);
  return usefulInt;
}

export function sample(array) {
  const randoInd = randomNumber(array.length);
  return array[randoInd];
}

function randomRange(max, min) {
  const rando = Math.random();
  const rangified = rando * (max - min) + min;
  const usefulInt = Math.floor(rangified);
  return usefulInt;
}
