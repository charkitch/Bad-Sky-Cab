class SpeakerIcon {
  constructor(pauseStatus) {
    this.x = 10;
    this.y = 300;
    this.image = new Image();
  }

  statusIcon() {
    if (this.pausedCurrently) {
      return 'on';
    } else {
      return 'off';
    }
  }

  draw(cntx, pausedCurrently) {
    if (!pausedCurrently) {
      this.image.src = `./assets/images/backdrop/speaker_on.png`
    } else {
      this.image.src = `./assets/images/backdrop/speaker_off.png`
    }


    this.pausedCurrently = pausedCurrently;
    cntx.drawImage(
      this.image,
      this.x,
      this.y,
    )
  }
}

export default SpeakerIcon;
