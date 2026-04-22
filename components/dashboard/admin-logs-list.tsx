"use client";

import { AdminSelectableList } from "@/components/dashboard/admin-selectable-list";
import { AdminLogRow } from "@/components/dashboard/admin-log-row";
import { deleteLogsAction } from "@/lib/actions/admin";
import type { AdminLog } from "@/lib/queries/admin";
import type { ComponentProps } from "react";

type RowTranslations = ComponentProps<typeof AdminLogRow>["t"];

type AdminLogsListProps = {
  logs: AdminLog[];
  locale: string;
  rowT: RowTranslations;
  bulkT: {
    selectAll: string;
    deleteSelected: string;
    cancel: string;
    confirmDelete: string;
  };
};

export function AdminLogsList({ logs, locale, rowT, bulkT }: AdminLogsListProps) {
  const items = logs.map((log, i) => ({
    id: log.id,
    node: (
      <div className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
        <AdminLogRow log={log} locale={locale} t={rowT} />
      </div>
    ),
  }));

  return (
    <AdminSelectableList
      items={items}
      onBulkDelete={deleteLogsAction}
      translations={bulkT}
    />
  );
}
