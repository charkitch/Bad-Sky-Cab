


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
  if (currentScoreMore(score)) {
    setScore(score);
    return true;
  } else {
    return false; 
  }
};

export const currentScoreMore = (score) => {
  if (!doesScoreExist()) {
    return true;
  }
  let currentHighScore = getCurrentScore();
  return score > currentHighScore;
}

export const doesScoreExist = () => {
  let status =  highScore in localStorage
  return status
}

const setScore = (score) => {
  return localStorage.setItem(highScore, score);
}

export const getCurrentScore = () => {
  let currentScore = parseInt(localStorage.getItem(highScore));
  return currentScore
}


export const drawStrokeText = (cntx, text, x, y) => {
  cntx.strokeText(
        text,
        x,
        y,
  )
}