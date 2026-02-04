'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plane, DollarSign, Users, Clock, Shield, Zap } from "lucide-react";

interface BannerSlide {
    title: string;
    subtitle: string;
    bgColor: string;
    textColor: string;
    icon: React.ReactNode;
    accentColor: string;
}

const slides: BannerSlide[] = [
    {
        title: "Earn everyday by taking our daily flights",
        subtitle: "Risk Free, Unlimited Rewards",
        bgColor: "bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00897B]",
        textColor: "text-white",
        icon: <Plane className="w-6 h-6 md:w-8 md:h-8" />,
        accentColor: "bg-[#FFD700]"
    },
    {
        title: "Instant Deposit and Withdrawal",
        subtitle: "24/7 support",
        bgColor: "bg-gradient-to-br from-[#FFD700] via-[#FFC107] to-[#FF8F00]",
        textColor: "text-black",
        icon: <DollarSign className="w-6 h-6 md:w-8 md:h-8" />,
        accentColor: "bg-[#004B49]"
    },
    {
        title: "More Friends, More Flights, More Wins",
        subtitle: "No Limits, Earn more by referring your friends",
        bgColor: "bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00897B]",
        textColor: "text-white",
        icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
        accentColor: "bg-[#FFD700]"
    }
];

export default function BannerSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Main slide container */}
                <div
                    className="flex transition-transform duration-500 ease-in-out h-36 md:h-44"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`flex-shrink-0 w-full ${slide.bgColor} flex items-center justify-center px-4 md:px-8 relative overflow-hidden`}
                        >
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                            </div>

                            <div className="text-center relative z-10 max-w-xl">
                                {/* Icon */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full ${slide.accentColor} mb-2 shadow-md`}>
                                    <div className={slide.textColor === 'text-white' ? 'text-[#004B49]' : 'text-white'}>
                                        {slide.icon}
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className={`text-sm md:text-lg lg:text-xl font-bold mb-2 leading-tight ${slide.textColor}`}>
                                    {slide.title}
                                </h2>

                                {/* Subtitle */}
                                <p className={`text-xs md:text-sm lg:text-base font-medium ${slide.textColor} opacity-90`}>
                                    {slide.subtitle}
                                </p>

                                {/* CTA Button */}
                                <button className={`mt-2 px-4 py-1.5 rounded-full font-medium text-xs transition-all duration-200 ${
                                    slide.textColor === 'text-white'
                                        ? 'bg-[#FFD700] text-[#004B49] hover:bg-[#FFC107] shadow-md hover:shadow-lg'
                                        : 'bg-[#004B49] text-white hover:bg-[#00695C] shadow-md hover:shadow-lg'
                                }`}>
                                    Learn More
                                </button>
                            </div>

                            {/* Floating decorative elements */}
                            <div className="absolute top-6 right-6 opacity-20 animate-pulse">
                                <Shield className={`w-6 h-6 ${slide.textColor}`} />
                            </div>
                            <div className="absolute bottom-6 left-6 opacity-20 animate-pulse" style={{animationDelay: '1s'}}>
                                <Zap className={`w-5 h-5 ${slide.textColor}`} />
                            </div>
                            <div className="absolute top-1/2 left-8 opacity-10 animate-bounce" style={{animationDelay: '2s'}}>
                                <Clock className={`w-4 h-4 ${slide.textColor}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>


            </div>
        </section>
    );
}