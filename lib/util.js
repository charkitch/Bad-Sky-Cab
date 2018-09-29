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
