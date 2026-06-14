/**
 * 🎵 独立音效管理模块 (soundManager.js)
 * 自带 Web Audio API 强力强力增益节点（GainNode），可自由将音量放大数倍
 */

const SoundManager = (() => {
    let audioCtx = null;
    let audioBuffer = null;

    // 清脆的物理撞击声 Base64 数据
    const BIT_HIT_SOUND_BASE64 = "data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgH9+fX18e3p5d3V0c3Fwb2xtbW1tcW9vbnBycnF0dXV2d3d4eHl5enp7e3x8fX1+fn5/f4CAgICAgA==";

    // 将 base64 解码为原生音频 Buffer
    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64.split(',')[1]);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    return {
        /**
         * 初始化音频上下文与解码
         */
        init: function (scene) {
            if (audioCtx) return;

            console.log("[SoundManager] 正在初始化强力音频增益上下文...");

            // 创建高级音频上下文
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = base64ToArrayBuffer(BIT_HIT_SOUND_BASE64);

            audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
                audioBuffer = buffer;
                console.log("🔊 [SoundManager] 强力音效解码就绪，增益放大器已连接！✅");
            }, (err) => {
                console.error("[SoundManager] 强力音频流解码失败:", err);
            });
        },

        /**
         * 触发播放音效的全局 API（支持音量多倍爆破放大）
         */
        playHitSound: function () {
            // 确保上下文状态正常
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            if (!audioCtx || !audioBuffer) return;

            // 采用 Web Audio 标准的“阅后即焚”并发节点架构
            const source = audioCtx.createBufferSource();
            const gainNode = audioCtx.createGain();

            source.buffer = audioBuffer;

            // 👇 【核心调音台】：在这里调节放大的倍数！
            // 1.0 是原始声音的最大值
            // 2.0 代表将音量强制放大 2 倍
            // 3.0 代表强制放大 3 倍（如果觉得还不够大，可以往上继续加，比如 4.0）
            gainNode.gain.setValueAtTime(3.0, audioCtx.currentTime);

            // 连接节点：音源 -> 放大器 -> 扬声器
            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // 播放
            source.start(0);
        }
    };
})();

// 暴露给全局 window 对象
window.SoundManager = SoundManager;