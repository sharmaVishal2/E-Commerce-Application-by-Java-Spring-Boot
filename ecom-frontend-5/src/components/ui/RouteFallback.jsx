const RouteFallback = ({ message = "Loading page..." }) => {
  return (
    <div className="route-fallback">
      <div className="route-fallback__shell">
        <div className="skeleton-line skeleton-line--sm" />
        <div className="skeleton-line skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--md" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default RouteFallback;
