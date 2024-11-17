import "./HorizontalScroll.css";

function HorizontalScroll({
  children,
  className,
}: {
  children: any;
  className: string;
}) {
  return (
    <>
      <div className={`horizontal-scroll ${className}`}>{children}</div>
    </>
  );
}

export default HorizontalScroll;
