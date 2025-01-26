import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <footer class="footer footer-center bg-base-300 text-base-content p-4">
      <aside>
        <p>
          Copyright {new Date().getFullYear()} - All right reserved by
          PlushTreats. Developed by Kuya Egg
        </p>
      </aside>
    </footer>
  );
});
