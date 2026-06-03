import { cn } from "@/lib/utils";

export interface CredentialColumnsProps {
  columns: {
    heading: string;
    items: string[];
  }[];
  className?: string;
}

/**
 * Server-rendered credential list with responsive editorial columns.
 * Uses rose dividers on large screens and compact mono credential rows.
 */
export function CredentialColumns({
  columns,
  className,
}: CredentialColumnsProps) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-3 lg:gap-0", className)}>
      {columns.map((column, index) => (
        <section
          key={column.heading}
          className={cn(
            "lg:px-8",
            index === 0 && "lg:pl-0",
            index > 0 &&
              "border-t border-line-rose pt-8 lg:border-l lg:border-t-0 lg:pt-0",
          )}
        >
          <h3 className="font-cormorant text-2xl font-medium leading-tight text-text-primary">
            {column.heading}
          </h3>
          <ul className="mt-5 space-y-3">
            {column.items.map((item) => (
              <li
                key={item}
                className="font-dm-mono text-[0.68rem] uppercase leading-5 tracking-[0.18em] text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default CredentialColumns;
