import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Hero from "~/components/landing/hero";
import ProductSection from "~/components/products/product-section";

export default component$(() => {
  return (
    <>
      <Hero 
        image_url="/store.jpg" 
        title="Cuddle Up with PlushTreats" 
        content="Discover an enchanting collection of stuffed toys designed to bring joy, comfort, and a touch of magic to your life. Perfect for every age and every occasion!"
        landing={true}
      />
      <div class="container mx-auto px-4 my-20" id="shop">
        <ProductSection />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "plushtreats",
  meta: [
    {
      name: "description",
      content: "shop for adorable plush toys and stuffed animals",
    },
  ],
};
