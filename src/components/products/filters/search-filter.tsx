import { component$, PropFunction } from '@builder.io/qwik';

interface SearchFilterProps {
  searchQuery: string;
  onSearch$: PropFunction<(query: string) => void>;
}

export const SearchFilter = component$<SearchFilterProps>(
  ({ searchQuery, onSearch$ }) => {
    return (
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Search Products</span>
        </label>
        <input
          type="text"
          value={searchQuery}
          onInput$={e => onSearch$((e.target as HTMLInputElement).value)}
          placeholder="Search by name or description..."
          class="input input-bordered w-full"
        />
      </div>
    );
  }
);
