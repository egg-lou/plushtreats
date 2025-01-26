import { component$, PropFunction } from '@builder.io/qwik';

interface SortFilterProps {
  sortBy: string;
  onSortChange$: PropFunction<(value: string) => void>;
}

export const SortFilter = component$<SortFilterProps>(
  ({ sortBy, onSortChange$ }) => {
    return (
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Sort By</span>
        </label>
        <select
          value={sortBy}
          onChange$={e => onSortChange$((e.target as HTMLSelectElement).value)}
          class="select select-bordered w-full"
        >
          <optgroup label="Popularity">
            <option value="popularity-high">Most Popular</option>
            <option value="popularity-low">Least Popular</option>
          </optgroup>
          <optgroup label="Rating">
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </optgroup>
          <optgroup label="Price">
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </optgroup>
        </select>
      </div>
    );
  }
);
