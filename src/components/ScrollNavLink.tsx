import { Button } from "@/components/ui/button";

interface ScrollNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const ScrollNavLink = ({ href, children, className }: ScrollNavLinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      asChild
      className={className}
    >
      <a href={href} onClick={handleClick}>
        {children}
      </a>
    </Button>
  );
};
