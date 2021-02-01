import MelonLayer from "./MelonLayer";
import { U } from "./utils/util";

const { ccclass, property } = cc._decorator;
let id = 0


//图集中图片的名称和类型对应
const rules = {
    1: 1,
    2: 2,
    3: 4,
    4: 3,
    5: 5,
    6: 7,
    7: 6,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
}



@ccclass
export default class Melon extends cc.Component {


    num: number = 1;//水果类型
    sprite: cc.Sprite = null;
    canTrigger: boolean = true;//是否可触发合并
    isStarted: boolean = false;//开始计时
    rigidBodyCollider: cc.PhysicsCircleCollider = null;//碰撞器
    rigidBody: cc.RigidBody = null;//刚体

    end_timer: number = 0;//检测是否高度超过顶部检测线line
    times: number = 0;//确保是第一次检测
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        this.rigidBodyCollider = this.node.getComponent(cc.PhysicsCircleCollider);
        this.rigidBody = this.node.getComponent(cc.RigidBody);
    }
    init(t: number) {
        this.num = t;
        id++;
        this.node.setScale(1)
        this.setImg(t);
        this.canTrigger = true;
        this.end_timer = 0;
        this.times = 0;
    }


    setImg(t: number) {
        this.sprite.spriteFrame = this.atlas.getSpriteFrame('melon_' + rules[t]);
        let size = this.sprite.spriteFrame.getOriginalSize()
        this.node.setContentSize(size)
        this.setRigidBody(1);
    }
    setRigidBody(scale: number) {
        if (scale <= 0) {
            this.rigidBodyCollider.radius = 0;
            this.rigidBodyCollider.apply()
        } else {
            let size = this.sprite.spriteFrame.getOriginalSize()
            this.rigidBodyCollider.radius = size.width / 2;
            this.rigidBodyCollider.apply()
        }
    }
    start() {

    }
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.node.group == "wall") {
            return
        }

        if (selfCollider.node.y < otherCollider.node.y) {
            return;
        }
        // return;
        const other = otherCollider.getComponent(Melon)


        if (other != null && other.canTrigger && this.canTrigger && other.num == this.num) {
            let score = this.num
            // this.num++;
            other.canTrigger = false
            this.canTrigger = false
            this.setRigidBody(0);
            other.setRigidBody(0);
            cc.tween(selfCollider.node).to(0.2, { position: otherCollider.node.position }).call(() => {
                U.eventBus.emit("score", { delta: score })
                U.eventBus.emit("generate_bigger_melon", { type: this.num + 1, pos: selfCollider.node.position })
                otherCollider.node.active = false;
                selfCollider.node.active = false;
                otherCollider.node.removeFromParent();
                selfCollider.node.removeFromParent();
                U.pool.put(otherCollider.node)
                U.pool.put(selfCollider.node)
            }).start()
        }
    }


    setSpeed(s: cc.Vec2) {
        this.rigidBody.linearVelocity = s;
    }
    setGravityScale(g: number) {
        this.rigidBody.gravityScale = g;
    }
    setRigidBodyStatus(s: boolean) {
        this.rigidBody.awake = s;
    }
    setStarted(s: boolean) {
        this.isStarted = s;
    }



    update(dt) {
        if (this.node.parent.name == "melons" && this.isStarted) {
            this.end_timer += dt;
        }

        if (this.times == 0 && this.end_timer > 3 && this.node.y + this.node.height / 2 > MelonLayer.Instance.check_line.y) {
            this.times++;
            U.eventBus.emit("end_game")
            cc.error(`"游戏结束"melonY:${this.node.y + this.node.height / 2},lineY:${MelonLayer.Instance.check_line.y}`)
        }
    }
}
