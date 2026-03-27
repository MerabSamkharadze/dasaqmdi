import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  /** Extra query params to preserve (e.g. ?category=it-software) */
  searchParams?: Record<string, string>;
};

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string>,
): string {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-1 pt-10 pb-2">
      {/* Previous */}
      {currentPage > 1 ? (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
          <Link href={buildHref(basePath, currentPage - 1, searchParams)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* First page + ellipsis */}
      {start > 1 && (
        <>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-[13px]" asChild>
            <Link href={buildHref(basePath, 1, searchParams)}>1</Link>
          </Button>
          {start > 2 && (
            <span className="px-1 text-muted-foreground/40 text-xs select-none">...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "ghost"}
          size="icon"
          className={`h-8 w-8 rounded-xl text-[13px] ${
            p === currentPage ? "shadow-sm" : ""
          }`}
          asChild={p !== currentPage}
        >
          {p === currentPage ? (
            <span>{p}</span>
          ) : (
            <Link href={buildHref(basePath, p, searchParams)}>{p}</Link>
          )}
        </Button>
      ))}

      {/* Last page + ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-muted-foreground/40 text-xs select-none">...</span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-[13px]" asChild>
            <Link href={buildHref(basePath, totalPages, searchParams)}>
              {totalPages}
            </Link>
          </Button>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" asChild>
          <Link href={buildHref(basePath, currentPage + 1, searchParams)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
