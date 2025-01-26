import { component$, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

interface HeroProps {
  image_url: string;
  title: string;
  content: string;
  landing?: boolean;
}

const Hero = component$<HeroProps>(
  ({ image_url, title, content, landing = false }) => {
    const nav = useNavigate();

    const handleAction = $(() => {
      if (landing) {
        const section = document.getElementById('shop');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        nav('/');
      }
    });

    return (
      <div
        class="hero min-h-[70vh] bg-base-200 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image_url})`,
        }}
      >
        <div class="hero-overlay bg-opacity-60"></div>
        <div class="hero-content text-neutral-content text-center">
          <div class="max-w-md">
            <h1 class="mb-5 text-5xl font-bold">{title}</h1>
            <p class="mb-5">{content}</p>
            <button class="btn btn-primary" onClick$={handleAction}>
              {landing ? 'Explore Our Collection' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Hero;
