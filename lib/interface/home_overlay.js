import StartGameBox from './start_game_box';
import DirectionsBox from './directions_box';
import TitleBox from './title_box';

class HomeOverlay {
  constructor() {
    this.startGameBox = new StartGameBox();
    this.directionsBox = new DirectionsBox();
    this.titleBox = new TitleBox();
  }

  draw(cntx) {
    cntx.font = '25px Arial';
    cntx.fillStyle = 'red';
    this.startGameBox.draw(cntx);
    this.directionsBox.draw(cntx);
    this.titleBox.draw(cntx);
  }
}

export default HomeOverlay;
