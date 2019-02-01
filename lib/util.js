


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
};


const highScore = 'highScore'

export const checkAndSetNewHighScore = (score) => {
  if (currentScoreMore) {
    setScore(score);
    return true;
  } else {
    return false; 
  }
};

const currentScoreMore = (score) => {
  if (!doesScoreExist) {
    return true;
  }
  let currentHighScore = getCurrentScore();
  return score > currentHighScore;
}

const doesScoreExist = () => {
  return highScore in localStorage
}

const setScore = (score) => {
  return localeStorage.setItem(highScore, score);
}

const getCurrentScore = () => {
  return localStorage.getItem(highScore)
}