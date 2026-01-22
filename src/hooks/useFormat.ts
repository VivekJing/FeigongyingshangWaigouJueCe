export default function useFormat() {
  const percentFormat = <T>(_row: unknown, _column: unknown, cellValue: T) =>
    typeof cellValue === 'number' ? `${cellValue}%` : '';
  const priceFormat = (cellValue: unknown) =>
    typeof cellValue === 'number' ? cellValue.toLocaleString() : '';

  return { percentFormat, priceFormat };
}
