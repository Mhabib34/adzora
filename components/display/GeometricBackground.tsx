export function GeometricBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-18L8 36V20l20-12 20 12v16L28 48z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "56px 100px",
      }}
    />
  );
}
