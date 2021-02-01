
class Util {
    static readonly instance: Util = new Util();

    eventBus: cc.EventTarget = new cc.EventTarget()
    pool: cc.NodePool = new cc.NodePool()
    /**
     * 随机一个整数
     * @param min 最小值
     * @param max 最大值
     * @returns 随机
     */
    rdnInt(min: number, max: number) {
        return Math.floor(min + Math.random() * (max - min))
    }

    repeat_do_safe(node: cc.Node, handler: Function, interval: number): cc.Tween {
        handler()
        if (interval <= 0.0) {
            interval = 1 / 60
        }
        return cc.tween(node).repeatForever(cc.tween(node).delay(interval).call(() => {
            handler()
        })).start()
        // const act = cc.repeatForever(cc.sequence(cc.delayTime(interval), cc.callFunc(handler)))
        // return node.runAction(act)
    }
    delay_call(node: cc.Node, delayTime: number, handler: Function) {
        return cc.tween(node).delay(delayTime).call(() => {
            handler()
        }).start()
    }
}

export const U = Util.instance;