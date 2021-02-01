
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    onLoad() {
        cc.director.getPhysicsManager().gravity = cc.v2(0, 2000);
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1
    }
    start() {

    }



}
