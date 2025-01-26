import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Hero from "~/components/landing/hero";

export default component$(() => {
  return (
    <>
      <Hero 
        image_url="/store2.jpg" 
        title="About PlushTreats" 
        content="We're passionate about bringing joy and comfort through our carefully curated collection of plush toys. Each item in our store is selected with love and attention to quality."
        landing={false}
      />
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-3xl mx-auto space-y-8">
          <section class="prose prose-lg">
            <h2 class="text-3xl font-bold">Our Story</h2>
            <p>
              PlushTreats began with a simple idea: to create a space where people of all ages could find 
              the perfect plush companion. We believe that stuffed toys aren't just for children – they bring 
              comfort, joy, and a touch of whimsy to people of all ages.
            </p>
          </section>

          <section class="prose prose-lg">
            <h2 class="text-3xl font-bold">Our Mission</h2>
            <p>
              Our mission is to provide high-quality, adorable plush toys that bring smiles to faces and 
              warmth to hearts. We carefully select each item in our collection, ensuring that it meets 
              our standards for quality, safety, and charm.
            </p>
          </section>

          <section class="prose prose-lg">
            <h2 class="text-3xl font-bold">Quality Promise</h2>
            <p>
              Every plush toy in our collection is carefully inspected to ensure it meets our high standards. 
              We work with trusted manufacturers who share our commitment to quality and safety, so you can 
              shop with confidence.
            </p>
          </section>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "About PlushTreats - Our Story",
  meta: [
    {
      name: "description",
      content: "Learn about PlushTreats, your premier destination for quality plush toys and stuffed animals.",
    },
  ],
};