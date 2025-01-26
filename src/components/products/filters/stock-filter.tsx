import { component$, PropFunction } from '@builder.io/qwik';

interface StockFilterProps {
  showInStock: boolean;
  onStockFilterChange$: PropFunction<(value: boolean) => void>;
}

export const StockFilter = component$<StockFilterProps>(
  ({ showInStock, onStockFilterChange$ }) => {
    return (
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            checked={showInStock}
            onChange$={e =>
              onStockFilterChange$((e.target as HTMLInputElement).checked)
            }
            class="checkbox checkbox-primary"
          />
          <span class="label-text">Show In-Stock Items Only</span>
        </label>
      </div>
    );
  }
);
