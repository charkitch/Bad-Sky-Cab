import StartGameBox from './start_game_box';
import DirectionsBox from './directions_box';
import TitleBox from './title_box';
import WarningsBox from './warnings';

class HomeOverlay {
  constructor() {
    this.startGameBox = new StartGameBox();
    this.directionsBox = new DirectionsBox();
    this.titleBox = new TitleBox();
    this.warningsBox = new WarningsBox();
  }

  draw(cntx) {
    cntx.font = '20px Arial';
    cntx.strokeStyle = 'darkgrey';
    this.startGameBox.draw(cntx);
    this.directionsBox.draw(cntx);
    this.warningsBox.draw(cntx);
    this.titleBox.draw(cntx);
  }
}

export default HomeOverlay;
