class sound {
  constructor(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.volume = .1;
    this.sound.style.display = "none";
    this.pausedCurrently = true;
    document.body.appendChild(this.sound);

  }

  play() {
    if (!this.pausedCurrently) {
      this.sound.play();
    }
  }

  stop() {
    this.sound.pause();
  }

}

export default sound;
