'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { gameStateManager, GameState } from './game-state-manager';

interface GameCanvasProps {
    isConnecting?: boolean;
    hasActiveBet?: boolean;
    onCanvasReady?: (ctx: CanvasRenderingContext2D) => void;
}

const GameCanvas = memo(({ isConnecting = false, hasActiveBet = false, onCanvasReady }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const currentStateRef = useRef<GameState>(gameStateManager.getState());

    // console.log('🎨 GameCanvas state:', currentStateRef.current);

    useEffect(() => {
        console.log('🎨 GameCanvas useEffect running');
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.imageSmoothingEnabled = true;

        // Preload & cache images
        const planeImg = new Image();
        planeImg.src = '/game/aircraft1.svg';
        const crashImg = new Image();
        crashImg.src = '/game/crash-aircraft.svg';

        // Subscribe to global state changes
        const unsubscribe = gameStateManager.subscribe((state) => {
            console.log('🎨 GameCanvas received state update:', state);
            currentStateRef.current = state;
        });

        // Animation loop (60fps, device-optimized)
        const animate = () => {
            const state = currentStateRef.current;
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight);
            gradient.addColorStop(0, '#004B49');
            gradient.addColorStop(0.5, '#00695C');
            gradient.addColorStop(1, '#00796B');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            // Connecting overlay
            if (isConnecting) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                // Spinner
                const centerX = canvas.offsetWidth / 2;
                const centerY = canvas.offsetHeight / 2;
                const radius = 30;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, (Date.now() / 1000) % (Math.PI * 2), (Date.now() / 1000) % (Math.PI * 2) + Math.PI);
                ctx.stroke();

                // Text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Syncing live flight...', centerX, centerY + 60);
            }
            // Preparing state (before flight)
            else if (state.phase === 'preparing') {
                const centerX = canvas.offsetWidth / 2;
                const centerY = canvas.offsetHeight / 2;

                // Spinner
                const radius = 30;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, (Date.now() / 2000) % (Math.PI * 2), (Date.now() / 2000) % (Math.PI * 2) + Math.PI);
                ctx.stroke();

                // Text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Preparing Next Flight', centerX, centerY + 60);
                ctx.font = '16px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillText('Get ready to fly!', centerX, centerY + 85);
            }
            // Flying state
            else if (state.phase === 'flying') {
                // Use multiplier directly for stability
                const displayMultiplier = Math.max(1.00, state.multiplier);

                // Static plane position - center of screen
                const planeX = canvas.offsetWidth / 2;
                const planeY = canvas.offsetHeight / 2;

                // Draw plane (static, no movement)
                ctx.save();
                ctx.translate(planeX, planeY);

                // Draw plane image (scaled down for canvas)
                const planeWidth = 120;
                const planeHeight = 90;
                if (planeImg.complete) {
                    ctx.drawImage(planeImg, -planeWidth/2, -planeHeight/2, planeWidth, planeHeight);
                }

                ctx.restore();

                // Multiplier text (glow effect) - direct display for stability
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                ctx.font = 'bold 72px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${displayMultiplier.toFixed(2)}x`, canvas.offsetWidth / 2, canvas.offsetHeight - 50);
                ctx.shadowBlur = 0;

                // Subtitle
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '14px Arial';
                ctx.fillText('Current Multiplier', canvas.offsetWidth / 2, canvas.offsetHeight - 20);
            }
            // Crashed state
            else if (state.phase === 'crashed') {
                // Use the crash point directly - no lerping during crash
                const crashMultiplier = state.crashPoint || state.multiplier;

                // Plane position: Use crash multiplier for final position
                const baseY = canvas.offsetHeight - 120; // Start above the multiplier text
                const progress = Math.min((crashMultiplier - 1) / 9, 1); // Normalize 1x-10x to 0-1
                const planeY = baseY - (progress * (baseY - 50)); // Fly from above text to top
                const planeX = canvas.offsetWidth / 2; // No sway during crash

                // Draw plane
                ctx.save();
                ctx.translate(planeX, planeY);

                // Crash animation: rotate and shake
                const shakeX = Math.sin(Date.now() / 50) * 10;
                const shakeY = Math.cos(Date.now() / 50) * 5;
                ctx.translate(shakeX, shakeY);
                ctx.rotate(Math.PI / 4); // 45 degrees
                ctx.globalAlpha = 0.7;

                // Draw plane image (scaled down for canvas)
                const planeWidth = 120;
                const planeHeight = 90;
                if (crashImg.complete) {
                    ctx.drawImage(crashImg, -planeWidth/2, -planeHeight/2, planeWidth, planeHeight);
                } else if (planeImg.complete) {
                    ctx.drawImage(planeImg, -planeWidth/2, -planeHeight/2, planeWidth, planeHeight);
                }

                ctx.restore();

                // Multiplier text (glow effect) - show crash point
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                ctx.font = 'bold 72px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${crashMultiplier.toFixed(2)}x`, canvas.offsetWidth / 2, canvas.offsetHeight - 50);
                ctx.shadowBlur = 0;

                // Subtitle
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '14px Arial';
                ctx.fillText('Crash Multiplier', canvas.offsetWidth / 2, canvas.offsetHeight - 20);

                // Crash display overlay
                console.log('🎨 Rendering crash screen:', state.crashPoint);
                const centerX = canvas.offsetWidth / 2;
                const centerY = 100;

                // Show different message based on whether user had an active bet
                if (hasActiveBet) {
                    // User had a bet but didn't cash out - LOSS
                    ctx.fillStyle = '#FF0000';
                    ctx.shadowColor = '#FF0000';
                    ctx.shadowBlur = 20;
                    ctx.font = 'bold 60px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('YOU LOST!', centerX, centerY);
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = '#FF4444';
                    ctx.font = 'bold 20px Arial';
                    ctx.fillText(`Crashed at ${crashMultiplier.toFixed(2)}x`, centerX, centerY + 35);

                    ctx.fillStyle = '#FF6666';
                    ctx.font = 'bold 16px Arial';
                    ctx.fillText('Better luck next time!', centerX, centerY + 60);
                } else {
                    // No active bet - just show crash info
                    ctx.fillStyle = '#FF4444';
                    ctx.shadowColor = '#FF4444';
                    ctx.shadowBlur = 20;
                    ctx.font = 'bold 72px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('CRASHED!', centerX, centerY);
                    ctx.shadowBlur = 0;

                    ctx.fillStyle = '#FF6B6B';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(`at ${crashMultiplier.toFixed(2)}x`, centerX, centerY + 40);
                }
            }
            // Cashed out state
            else if (state.phase === 'cashed_out') {
                // Continue showing current multiplier (round continues for other players)
                const currentMultiplier = Math.max(1.00, state.multiplier);

                // Static plane position - center of screen
                const planeX = canvas.offsetWidth / 2;
                const planeY = canvas.offsetHeight / 2;

                // Draw plane (static)
                ctx.save();
                ctx.translate(planeX, planeY);

                // Draw plane image (scaled down for canvas)
                const planeWidth = 120;
                const planeHeight = 90;
                if (planeImg.complete) {
                    ctx.drawImage(planeImg, -planeWidth/2, -planeHeight/2, planeWidth, planeHeight);
                }

                ctx.restore();

                // Multiplier text (glow effect) - continue showing updates
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 20;
                ctx.font = 'bold 72px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${currentMultiplier.toFixed(2)}x`, canvas.offsetWidth / 2, canvas.offsetHeight - 50);
                ctx.shadowBlur = 0;

                // Subtitle
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '14px Arial';
                ctx.fillText('Current Multiplier', canvas.offsetWidth / 2, canvas.offsetHeight - 20);

                // Cash out display overlay
                const centerX = canvas.offsetWidth / 2;
                const centerY = 100;

                ctx.fillStyle = '#00FF00';
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 20;
                ctx.font = 'bold 60px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('CASHED OUT!', centerX, centerY);
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#00DD00';
                ctx.font = 'bold 20px Arial';
                ctx.fillText('Waiting for next round...', centerX, centerY + 35);
            }

            // Floating particles
            for (let i = 0; i < 15; i++) {
                const x = (i * 137) % canvas.offsetWidth; // Pseudo-random distribution
                const y = ((Date.now() / 3000 + i) % 1) * canvas.offsetHeight;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
            onCanvasReady?.(ctx);
        };

        animate();
        return () => {
            unsubscribe();
            cancelAnimationFrame(rafRef.current);
        };
    }, [isConnecting, onCanvasReady, hasActiveBet]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-xl" />;
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
