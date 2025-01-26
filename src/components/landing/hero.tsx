import { component$, $ } from "@builder.io/qwik";

const Hero = component$(() => {
    const scrollToSection = $(() => {
        const section = document.getElementById('shop');

        if (section) {
            section.scrollIntoView({ behavior: 'smooth'})
        }
    })

    return (
        <div
            className="hero min-h-screen"
            style={{
                backgroundImage: "url(/store.jpg)",
            }}>
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-neutral-content text-center">
                <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Cuddle Up with PlushTreats</h1>
                    <p className="mb-5">
                        Discover an enchanting collection of stuffed toys designed to bring joy, comfort, and a touch of magic to your life. Perfect for every age and every occasion!
                    </p>
                    <button className="btn btn-primary" onClick$={scrollToSection}>Explore Our Collection</button>
                </div>
            </div>
        </div>
    );
});

export default Hero;