export default function SortableTh({ label, field, sort, onSort }) {
  const active = sort.by === field;
  const arrow = active ? (sort.order === 'asc' ? '▲' : '▼') : '↕';
  return (
    <th className="sortable" onClick={() => onSort(field)}>
      {label}<span className="arrow">{arrow}</span>
    </th>
  );
}
