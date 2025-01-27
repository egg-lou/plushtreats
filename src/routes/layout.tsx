import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import Navbar from '~/components/layout/navbar';
import Footer from '~/components/layout/footer';
export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 31536000,
    immutable: true,
    public:true
  });
};

export default component$(() => {
  return (
    <>
      <Navbar />
      <main class="mx-auto min-h-screen w-full">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
