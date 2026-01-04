/**
 * Компонент Icons - минималистичные SVG иконки из sprite.svg
 *
 * Все иконки в едином стиле, минималистичные
 */

const Icon = ({ name, className = '', width = 24, height = 24 }) => (
  <svg className={className} width={width} height={height}>
    <use href={`/sprite.svg#icon-${name}`} />
  </svg>
);

export const HomeIcon = ({ className = '', width, height }) => (
  <Icon name="home" className={className} width={width} height={height} />
);

export const UsersIcon = ({ className = '', width, height }) => (
  <Icon name="users" className={className} width={width} height={height} />
);

export const ClockIcon = ({ className = '', width, height }) => (
  <Icon name="clock" className={className} width={width} height={height} />
);

export const ArchiveIcon = ({ className = '', width, height }) => (
  <Icon name="archive" className={className} width={width} height={height} />
);

export const FileTextIcon = ({ className = '', width, height }) => (
  <Icon name="file-text" className={className} width={width} height={height} />
);

export const PlusIcon = ({ className = '', width, height }) => (
  <Icon name="plus" className={className} width={width} height={height} />
);

export const SearchIcon = ({ className = '', width, height }) => (
  <Icon name="search" className={className} width={width} height={height} />
);

export const EditIcon = ({ className = '', width, height }) => (
  <Icon name="edit" className={className} width={width} height={height} />
);

export const TrashIcon = ({ className = '', width, height }) => (
  <Icon name="trash" className={className} width={width} height={height} />
);

export const ArrowLeftIcon = ({ className = '', width, height }) => (
  <Icon name="arrow-left" className={className} width={width} height={height} />
);

export const FilterIcon = ({ className = '', width, height }) => (
  <Icon name="filter" className={className} width={width} height={height} />
);

export const CalendarIcon = ({ className = '', width, height }) => (
  <Icon name="calendar" className={className} width={width} height={height} />
);

export const InfoIcon = ({ className = '', width, height }) => (
  <Icon name="info" className={className} width={width} height={height} />
);

