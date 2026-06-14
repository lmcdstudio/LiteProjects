import { _decorator, Component, Node, Vec3, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

enum GamePhase {
    WAITING_PLAYER, // 等待操作
    ANIMATING,      // 硬币飞行/物理运动中
    SETTLING        // 物理已静止，进行结算
}

@ccclass('GameLogic')
export class GameLogic extends Component {

    @property({ type: Node, tooltip: "所有硬币的父节点" })
    public coinGroup: Node = null!;

    @property({ tooltip: "桌面半径（超过此距离判定坠落）" })
    public tableRadius: number = 400;

    @property({ tooltip: "判定静止的速度阈值" })
    public speedThreshold: number = 0.05;

    private currentPhase: GamePhase = GamePhase.WAITING_PLAYER;

    update(deltaTime: number) {
        // 1. 持续监测坠落（在任意状态下均可坠落）
        this.checkCoinFalls();

        // 2. 监测物理静止，触发结算
        if (this.currentPhase === GamePhase.ANIMATING) {
            if (this.isAllCoinsStopped()) {
                this.currentPhase = GamePhase.SETTLING;
                this.processResult();
            }
        }
    }

    // 检查所有硬币是否都停下了
    private isAllCoinsStopped(): boolean {
        for (let coin of this.coinGroup.children) {
            let rb = coin.getComponent(RigidBody2D);
            if (rb && rb.linearVelocity.length() > this.speedThreshold) {
                return false; // 只要有一个还在动，就不算静止
            }
        }
        return true;
    }

    private checkCoinFalls() {
        for (let i = this.coinGroup.children.length - 1; i >= 0; i--) {
            let coin = this.coinGroup.children[i];
            if (Vec3.distance(coin.position, Vec3.ZERO) > this.tableRadius) {
                this.onCoinFall(coin);
            }
        }
    }

    private onCoinFall(coin: Node) {
        console.log("检测到硬币坠落，执行销毁...");
        coin.destroy();
        // TODO: 此处后续接入分数逻辑
    }

    private processResult() {
        console.log(">>> 物理静止，开始结算逻辑 <<<");
        // 这里就是你将来放“嵌套伪逻辑树”的地方

        // 结算完成后，重置回等待状态
        this.currentPhase = GamePhase.WAITING_PLAYER;
    }

    // 提供给外部调用的接口（比如弹射硬币后）
    public startSimulation() {
        this.currentPhase = GamePhase.ANIMATING;
    }
}