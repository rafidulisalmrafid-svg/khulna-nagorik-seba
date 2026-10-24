import React, { useState, useEffect, useRef } from 'react';

export default function HeroSlider({ sliders = [], setting = {}, children }) {
    const hasSlides = sliders && sliders.length > 0;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const autoplaySeconds = setting.autoplay_seconds || 5;
    const intervalMs = autoplaySeconds * 1000;
    const progressStepMs = 50;

    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // Auto-advance timer with progress bar
    useEffect(() => {
        if (!hasSlides || isPaused || sliders.length <= 1) return;

        setProgress(0);
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min((elapsed / intervalMs) * 100, 100);
            setProgress(pct);

            if (elapsed >= intervalMs) {
                setCurrentIndex((prev) => (prev + 1) % sliders.length);
                setProgress(0);
            }
        }, progressStepMs);

        return () => clearInterval(timer);
    }, [currentIndex, isPaused, sliders.length, intervalMs, hasSlides]);

    const goToSlide = (idx) => {
        setCurrentIndex(idx);
        setProgress(0);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % sliders.length);
        setProgress(0);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
        setProgress(0);
    };

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50) {
            nextSlide();
        } else if (diff < -50) {
            prevSlide();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    return (
        <section
            className="relative overflow-hidden bg-navy-950 text-white pt-14 pb-28 md:pb-32 select-none group min-h-[580px] md:min-h-[640px] flex flex-col justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Top Autoplay Progress Countdown Bar (Rims the top edge smoothly) */}
            {hasSlides && sliders.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* 1. Full-bleed Background Image Slider Layer (Edge-to-edge covering the entire blue section) */}
            {hasSlides ? (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {sliders.map((slide, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div
                                key={slide.id || idx}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            >
                                <img
                                    src={slide.image_url || slide.image_path}
                                    alt="খুলনা"
                                    className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                                        isActive ? 'scale-105' : 'scale-100'
                                    }`}
                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                        );
                    })}

                    {/* Clean Navy-Gov Gradient Overlays for maximum text clarity & visual elegance */}
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-900/55 to-navy-950/90 z-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-navy-950/75 z-20 pointer-events-none" />
                </div>
            ) : (
                /* Fallback pure gradient if no slides */
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-navy-950 via-gov-900 to-gov-800">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
                    </div>
                </div>
            )}

            {/* 2. Main Hero Content (Search bar, Headline, Tags) */}
            <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                {children}
            </div>

            {/* 3. Minimalist Centered Dot Indicators (No text labels, no arrows - clean & professional) */}
            {hasSlides && sliders.length > 1 && (
                <div className="relative z-30 flex justify-center items-center gap-2 pt-6 pb-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-950/40 backdrop-blur-md border border-white/10 shadow-sm">
                        {sliders.map((_, dotIdx) => (
                            <button
                                key={dotIdx}
                                type="button"
                                onClick={() => goToSlide(dotIdx)}
                                aria-label={`Slide ${dotIdx + 1}`}
                                className={`transition-all duration-300 rounded-full h-1.5 ${
                                    dotIdx === currentIndex
                                        ? 'w-7 bg-emerald-400 shadow-md shadow-emerald-400/50'
                                        : 'w-1.5 bg-white/40 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
