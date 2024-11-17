interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  side?: "left" | "right";
}

const Section: React.FC<SectionProps> = ({
  id,
  title,
  children,
  side = "left",
}) => {
  return (
    <section id={id} className="py-20">
      <div className={`mb-14 ${side === "right" ? "text-right" : ""}`}>
        <>#{id}</>
        <h2 className="text-4xl text-blue-200 mb-2">{title}</h2>

        <hr className="h-1 border-blue-100 border-opacity-10" />
      </div>

      <div className={`${side === "right" ? "flex justify-end" : ""}`}>
        {children}
      </div>
    </section>
  );
};

interface LinkProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

const Link: React.FC<LinkProps> = ({ children, href, onClick, className }) => {
  return (
    <span className={`relative inline-block group ${className}`}>
      <a
        className="text-white hover:text-blue-100 cursor-pointer"
        target="_blank"
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-100 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
    </span>
  );
};
interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return (
    <div
      className={`text-blue-100 font-intervar text-opacity-70 text-[16px] mb-3 ${className}`}
    >
      {children}
    </div>
  );
};

interface ImageProps {
  src: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, className }) => {
  return (
    <div className={`${className} rounded-md image-container`}>
      <img className="filter-image" src={src} />
      <div className="blue-tint" />
    </div>
  );
};

interface ButtonProps {
  href?: string;
  onClick?: (e: Event) => void;
  children: React.ReactNode;
  className?: string;
  inNewTab?: boolean;
  reverse?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  className,
  inNewTab = true,
  reverse = false,
  disabled = false,
}) => {
  return (
    <a
      href={href}
      onClick={(target) => {
        if (onClick) {
          onClick(target.nativeEvent);
        }
      }}
      target={inNewTab ? "_blank" : ""}
      className={`cursor-pointer inline-block font-sfmono px-6 py-4 border ${
        disabled
          ? "border-gray-300 text-gray-300 hover:text-gray-300 hover:cursor-not-allowed"
          : reverse
          ? "border-gray-700 text-gray-700 hover:text-blue-700 hover:border-blue-700"
          : "border-white hover:text-blue-200 hover:border-blue-200"
      } rounded-md ${className}`}
    >
      {children}
    </a>
  );
};

export { Section, Link, Paragraph, Image, Button };
