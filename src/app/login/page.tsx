"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import "./login.css";

const colors = ['#6c63ff', '#4facfe', '#ffffff'];

class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // UI State
    const [isLogin, setIsLogin] = useState(true);
    const [show2FA, setShow2FA] = useState(false);
    const [tempUserId, setTempUserId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // --- 3D Tilt Logic Removed ---

    // --- 2. Canvas Background Animation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            particles = [];
            for (let i = 0; i < 60; i++) {
                particles.push(new Particle(canvas));
            }
        };

        const connectParticles = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.strokeStyle = 'rgba(108, 99, 255, 0.1)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw(ctx);
            });
            connectParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener("resize", resize);
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --- 3. Ripple Effect ---
    const handleRipple = (e: MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";
        btn.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    };

    interface AuthUser {
        id: string;
        name: string;
        email: string;
        isTwoFactorEnabled: boolean;
        role?: string;
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            const { ApiService } = await import('@/lib/api');

            if (show2FA && tempUserId) {
                // Submit 2FA Code
                const res = await ApiService.verify2FA({ userId: tempUserId, token: twoFactorCode });
                if (res.token) {
                    localStorage.setItem("auth-token", res.token);
                    login(res.user as AuthUser);
                    router.push("/");
                }
                return;
            }

            if (isLogin) {
                const res = await ApiService.login({ email, password });
                if (res.requires2FA && res.userId) {
                    setTempUserId(res.userId);
                    setShow2FA(true);
                } else if (res.token) {
                    localStorage.setItem("auth-token", res.token);
                    login(res.user as AuthUser);
                    router.push("/");
                }
            } else {
                const res = await ApiService.signup({ name, email, password });
                if (res.token) {
                    localStorage.setItem("auth-token", res.token);
                    login(res.user as AuthUser);
                    router.push("/");
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message || "Authentication failed.");
            } else {
                setErrorMsg("Authentication failed.");
            }
        }
    };

    return (
        <div className="login-body">
            <canvas id="canvas-bg" ref={canvasRef} />

            <div className="scene-login">
                <div className="login-card">
                    {/* LOGO SECTION */}
                    <div className="logo-container">
                        <Image
                            src="/assets/chief360-removebg.png"
                            alt="Chief360 Logo"
                            width={100}
                            height={100}
                            className="object-contain mb-4"
                        />
                        <div className="brand-name">Chief360 Copilot</div>
                        <div className="brand-tagline">Command Your Legacy</div>
                    </div>

                    {errorMsg && <div className="text-red-400 text-sm text-center mb-4">{errorMsg}</div>}

                    {/* TOGGLE */}
                    {!show2FA && (
                        <div className="toggle-switch">
                            <div className={`toggle-slider ${!isLogin ? "right" : ""}`} id="t-slider" />
                            <div
                                className={`toggle-btn ${isLogin ? "active" : ""}`}
                                onClick={() => setIsLogin(true)}
                            >
                                LOGIN
                            </div>
                            <div
                                className={`toggle-btn ${!isLogin ? "active" : ""}`}
                                onClick={() => setIsLogin(false)}
                            >
                                SIGN UP
                            </div>
                        </div>
                    )}

                    {/* FORM */}
                    <form id="form-auth" onSubmit={handleAuth}>
                        {show2FA ? (
                            <>
                                <p className="text-center text-sm text-gray-300 mb-6">Enter the 6-digit code from your Authenticator app.</p>
                                <div className="input-group">
                                    <label className="input-label">6-Digit Code</label>
                                    <input type="text" className="input-field" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} maxLength={6} pattern="\d{6}" />
                                </div>
                                <button className="submit-btn" onMouseDown={handleRipple} type="submit">VERIFY CODE</button>
                                <button type="button" className="text-sm text-gray-400 mt-4 block mx-auto hover:text-white" onClick={() => setShow2FA(false)}>Back to Login</button>
                            </>
                        ) : isLogin ? (
                            <>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="input-group">



                                    <label className="input-label">Password</label><div style={{position:'relative'}}><input type={showPassword ? "text" : "password"} className="input-field" required value={password} onChange={(e) => setPassword(e.target.value)} style={{paddingRight:'40px'}} /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:'18px'}}>{showPassword ? (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)}</button>                                                       
                                </div>
                                </div>
                                <button className="submit-btn" onMouseDown={handleRipple} type="submit">ACCESS DASHBOARD</button>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <input type="text" className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Create Password</label>
                                    <input type="password" className="input-field" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <button className="submit-btn" onMouseDown={handleRipple} type="submit">CREATE ACCOUNT</button>
                            </>
                        )}
                    </form>

                </div>
            </div>
        </div>
    );
}
