import ClientEngine from 'lance-gg/ClientEngine';
import KeyboardControls from 'lance-gg/controls/KeyboardControls';
import MyRenderer from '../client/MyRenderer';

export default class MyClientEngine extends ClientEngine {

    constructor(gameEngine, options) {
        super(gameEngine, options, MyRenderer);

        this.controls = new KeyboardControls(this);
        this.controls.bindKey('up', 'up', { repeat: true } );
        this.controls.bindKey('down', 'down', { repeat: true } );
    }
}
