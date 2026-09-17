const RouteFallback = ({ message = "Loading page…" }) => (
  <div className="route-fallback">
    <div className="route-fallback__card">
      <div className="skel skel--line skel--line-sm" />
      <div className="skel skel--line skel--line-lg" />
      <div className="skel skel--line skel--line-md" />
      <p>{message}</p>
    </div>
  </div>
);

export default RouteFallback;
