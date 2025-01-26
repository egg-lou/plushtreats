import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Hero from "~/components/landing/hero";
import ProductSection from "~/components/products/product-section";

export default component$(() => {
  return (
    <>
      <Hero />
      <div className="mx-10 my-20">


      <ProductSection />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "PlushTreats",
  meta: [
    {
      name: "PlushTreats",
      content: "PlushTreats is a website for buying plush toys",
    },
  ],
};
