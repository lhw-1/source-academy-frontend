import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { IBaseScene, IGameUI } from '../commons/CommonTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { entryTweenProps, exitTweenProps } from '../effects/FlyEffect';
import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { createBitmapText } from '../utils/TextUtils';
import LogConstants, {
  headerTextStyle
  // logTextStyle
} from './GameLogConstants';

/**
 * Manager in charge of rendering and destroying the dialogue log in a scene
 */
class GameLogManager implements IGameUI {
  private scene: IBaseScene;
  private uiContainer: Phaser.GameObjects.Container | undefined;

  /**
   * Initialises the dialogue log UI
   *
   * @param scene - the scene to add dialogue log
   */
  public constructor(scene: IBaseScene) {
    this.scene = scene;
    this.scene.getPhaseManager().addPhaseToMap(GamePhaseType.Log, this);
  }

  /**
   * Create the container that encapsulate the 'Dialogue Log' UI,
   * i.e. the background, the header, and the texts.
   */
  private createUIContainer() {
    const logContainer = new Phaser.GameObjects.Container(this.scene, 0, 0);

    const logBg = new Phaser.GameObjects.Image(
      this.scene,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.logBackground.key
    )
      .setDisplaySize(screenSize.x, screenSize.y)
      .setInteractive({ pixelPerfect: true });
    logContainer.add(logBg);

    // Log header
    const settings = ['Cadet Log'];
    logContainer.add(
      settings.map((setting, index) =>
        createBitmapText(this.scene, setting, LogConstants.headerTextConfig, headerTextStyle)
      )
    );

    return logContainer;
  }

  /**
   * Activate the 'Dialogue Log' UI.
   *
   * Usually only called by the phase manager when 'Dialogue Log'
   * phase is pushed.
   */
  public async activateUI(): Promise<void> {
    this.uiContainer = this.createUIContainer();
    this.scene.getLayerManager().addToLayer(Layer.Log, this.uiContainer);
    this.getSoundManager().playSound(SoundAssets.menuEnter.key);
    this.uiContainer.setPosition(0, 0);
    this.scene.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps,
      y: 0
    });
  }

  /**
   * Deactivate the 'Log' UI.
   *
   * Usually only called by the phase manager when 'Dialogue Log'
   * phase is transitioned out.
   */
  public async deactivateUI(): Promise<void> {
    if (this.uiContainer) {
      this.uiContainer.setPosition(0, 0);
      this.scene.getLayerManager().clearSeveralLayers([Layer.Log]);
      this.getSoundManager().playSound(SoundAssets.menuExit.key);

      this.scene.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(exitTweenProps.duration);
      fadeAndDestroy(this.scene, this.uiContainer, { fadeDuration: 50 });
    }
  }

  private getSoundManager = () => SourceAcademyGame.getInstance().getSoundManager();
}

export default GameLogManager;