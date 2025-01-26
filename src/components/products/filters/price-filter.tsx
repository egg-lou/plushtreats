import { component$, PropFunction } from '@builder.io/qwik';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceFilterProps {
  priceRange: PriceRange;
  onPriceChange$: PropFunction<(range: PriceRange) => void>;
}

export const PriceFilter = component$<PriceFilterProps>(({ priceRange, onPriceChange$ }) => {
  return (
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Price Range</span>
      </label>
      <div class="flex flex-col gap-2">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-xs">Min Price (PHP)</span>
          </label>
          <input
            type="number"
            min="0"
            value={priceRange.min}
            onInput$={(e) => {
              const newMin = Math.max(0, Number((e.target as HTMLInputElement).value));
              onPriceChange$({
                min: newMin,
                max: Math.max(newMin, priceRange.max)
              });
            }}
            class="input input-bordered input-sm w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-xs">Max Price (PHP)</span>
          </label>
          <input
            type="number"
            min={priceRange.min}
            value={priceRange.max}
            onInput$={(e) => {
              const newMax = Math.max(priceRange.min, Number((e.target as HTMLInputElement).value));
              onPriceChange$({
                min: priceRange.min,
                max: newMax
              });
            }}
            class="input input-bordered input-sm w-full"
          />
        </div>
      </div>
    </div>
  );
});
