
import { posix } from "path";
import Melon from "./Melon";
import { U } from "./utils/util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MelonLayer extends cc.Component {
    public static Instance: MelonLayer = null;

    is_ended: boolean = false;
    last_x: number = 0
    @property(cc.Prefab)
    prefab_ball: cc.Prefab = null;

    currentMelon: cc.Node = null;

    @property(cc.Node)
    check_line: cc.Node = null;
    @property(cc.Node)
    settlement_panel: cc.Node = null;

    @property(cc.Label)
    lbl_score: cc.Label = null
    score: number = 0
    @property(cc.Node)
    node_game: cc.Node = null

    add_act: cc.Tween = null


    onLoad() {
        if (MelonLayer.Instance != null) {
            MelonLayer.Instance.destroy();
            MelonLayer.Instance = null;
        }
        MelonLayer.Instance = this;
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickEvent, this)
        U.eventBus.on('generate_melon', this.generateMelon, this)
        U.eventBus.on('generate_bigger_melon', this.generateBiggerMelon, this)
        U.eventBus.on("score", this.setScore, this);
        U.eventBus.on('end_game', this.end, this);
        this.generateMelon()
        // this.schedule(() => {
        //     if (this.currentMelon != null) {
        //         const script = this.currentMelon.getComponent(Melon);

        //         cc.tween(this.currentMelon)
        //             .to(0.1, { position: cc.v3(U.rdnInt(-240, 240), 380, 0) }).call(() => {
        //                 script.setRigidBodyStatus(true);
        //                 script.setStarted(true);
        //                 script.setSpeed(cc.v2(0, -300));
        //                 script.setGravityScale(1);
        //                 this.currentMelon = null;
        //             })
        //             .start()
        //         // this.currentMelon.setPosition(U.rdnInt(-240, 240), 380);

        //         this.scheduleOnce(() => {
        //             const melon = this.generateMelon();

        //         }, 0.5)
        //     }
        // }, 0.6)
    }



    /**
     * 生成一个水果,并放在顶部
     */
    generateMelon(pos = { x: 0 }) {
        if (this.is_ended) return;

        let b: cc.Node;
        if (U.pool.size() > 0) {
            b = U.pool.get()
        } else {
            b = cc.instantiate(this.prefab_ball);
        }
        this.node.addChild(b);
        b.active = true;
        let melon = b.getComponent(Melon);
        melon.setRigidBodyStatus(false);
        melon.setStarted(false);
        melon.setGravityScale(0);
        melon.setSpeed(cc.v2(0, 0));
        melon.init(U.rdnInt(1, 5))
        melon.setRigidBody(0)
        b.setPosition(pos.x, 380);
        b.setScale(0);
        cc.tween(b).to(0.2, { scale: 1 }).call(() => {
            this.currentMelon = b;
        }).start();
        return b;
    }

    /**
    * 生成合成后的水果
    */
    generateBiggerMelon(evt) {
        let type = evt.type;
        let pos = evt.pos;
        if (this.is_ended) return;

        let b: cc.Node;
        if (U.pool.size() > 0) {
            b = U.pool.get()
        } else {
            b = cc.instantiate(this.prefab_ball);
        }
        this.node.addChild(b);
        b.active = true;
        let ball = b.getComponent(Melon);
        ball.setRigidBodyStatus(true);
        ball.setGravityScale(1);
        ball.setRigidBody(1);
        ball.setStarted(true);
        ball.init(type)
        b.setPosition(pos);
        b.setScale(0);
        cc.tween(b).to(0.2, { scale: 1 }).start()
    }


    clickEvent(e: cc.Event.EventTouch) {
        if (this.is_ended) return;
        const pos = this.node.convertToNodeSpaceAR(e.getLocation())
        if (this.currentMelon != null) {
            const script = this.currentMelon.getComponent(Melon);
            cc.tween(this.currentMelon)
                .to(0.1, { position: cc.v3(pos.x, 380, 0) }).call(() => {
                    script.setRigidBodyStatus(true);
                    script.setRigidBody(1)
                    script.setStarted(true);
                    script.setSpeed(cc.v2(0, -300));
                    script.setGravityScale(1);
                    this.currentMelon = null;
                })
                .start()
            // this.currentMelon.setPosition(U.rdnInt(-240, 240), 380);

            this.scheduleOnce(() => {
                this.generateMelon();
            }, 0.5)
        }

    }
    end() {
        this.is_ended = true;
        let delay_time = this.node.childrenCount * 0.2;
        for (let i = 0; i < this.node.childrenCount; i++) {
            const child = this.node.children[i];
            cc.tween(child).delay(i * 0.2).to(0.5, { scale: 0 }).call(() => {
                child.removeFromParent();
                child.active = false;
                U.pool.put(child)
            }).start()
        }
        U.delay_call(this.node, delay_time, () => {
            this.settlement_panel.active = true;
            this.settlement_panel.getChildByName("score").getComponent(cc.Label).string = `最终得分:${this.score}`
        })
    }

    restart() {
        this.is_ended = false;
        this.lbl_score.string = "0";
        this.score = 0;
        this.settlement_panel.active = false;
        this.generateMelon();
    }

    setScore(evt) {
        this.score += evt.delta;
        if (this.add_act == null) {
            this.add_act = U.repeat_do_safe(this.node, () => {
                this.lbl_score.string = Number(this.lbl_score.string) + 1 + '';
                if (Number(this.lbl_score.string) >= this.score) {
                    this.lbl_score.string = this.score + "";
                    this.node.stopAllActions()
                    this.add_act = null;
                }
            }, 0.05)
        }
    }
}
