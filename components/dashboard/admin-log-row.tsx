import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCog,
  ExternalLink,
  Building2,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import type { AdminLog } from "@/lib/queries/admin";

type LogTranslations = {
  by: string;
  posted: string;
  postedBy: string;
  deleted: string;
  becameVipAt: string;
  vipUntilWas: string;
  from: string;
  to: string;
  level: {
    gold: string;
    silver: string;
    normal: string;
  };
  source: {
    upgrade_vip: string;
    boost_purchased: string;
  };
  category: string;
  owner: string;
  status: Record<string, string>;
};

type Props = {
  log: AdminLog;
  locale: string;
  t: LogTranslations;
};

const ACTION_COLORS: Record<string, string> = {
  verify_company: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  approve_job: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  reject_job: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  delete_job: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  change_role: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  boost_purchased: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  upgrade_vip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  remove_vip: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
  create_external_job: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  verify_company: ShieldCheck,
  approve_job: CheckCircle2,
  reject_job: XCircle,
  delete_job: Trash2,
  change_role: UserCog,
  boost_purchased: Sparkles,
  upgrade_vip: Star,
  remove_vip: Star,
  create_external_job: ExternalLink,
};

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
  );
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

function localizedTitle(meta: Record<string, unknown>, locale: string): string | null {
  const ka = typeof meta.title_ka === "string" ? meta.title_ka : null;
  const en = typeof meta.title === "string" ? meta.title : null;
  return locale === "ka" ? (ka || en) : (en || ka);
}

function localizedCompany(meta: Record<string, unknown>, locale: string): string | null {
  const ka = typeof meta.company_name_ka === "string" ? meta.company_name_ka : null;
  const en = typeof meta.company_name === "string" ? meta.company_name : null;
  return locale === "ka" ? (ka || en) : (en || ka);
}

function localizedActor(meta: Record<string, unknown>, locale: string): string | null {
  const ka = typeof meta.actor_name_ka === "string" ? meta.actor_name_ka : null;
  const en = typeof meta.actor_name === "string" ? meta.actor_name : null;
  return locale === "ka" ? (ka || en) : (en || ka);
}

function localizedPoster(meta: Record<string, unknown>, locale: string): string | null {
  const ka = typeof meta.posted_by_name_ka === "string" ? meta.posted_by_name_ka : null;
  const en = typeof meta.posted_by_name === "string" ? meta.posted_by_name : null;
  return locale === "ka" ? (ka || en) : (en || ka);
}

export function AdminLogRow({ log, locale, t }: Props) {
  const meta = log.metadata as Record<string, unknown>;
  const Icon = ACTION_ICONS[log.action] ?? Calendar;
  const actor = localizedActor(meta, locale);
  const colorClass = ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground";

  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-soft">
      {/* Icon badge */}
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row: action + actor + timestamp */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className={cn("text-[10px] shrink-0", colorClass)}>
              {log.action.replace(/_/g, " ")}
            </Badge>
            {actor && (
              <span className="text-[11px] text-muted-foreground/80 truncate">
                {t.by} <span className="font-medium text-foreground/80">{actor}</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/40 tabular-nums shrink-0">
            {formatDateTime(log.created_at, locale)}
          </span>
        </div>

        {/* Action-specific body */}
        <div className="mt-2 text-[12px] leading-relaxed">
          {renderBody(log, meta, locale, t)}
        </div>
      </div>
    </div>
  );
}

function renderBody(
  log: AdminLog,
  meta: Record<string, unknown>,
  locale: string,
  t: LogTranslations,
): React.ReactNode {
  const title = localizedTitle(meta, locale);
  const company = localizedCompany(meta, locale);
  const poster = localizedPoster(meta, locale);

  switch (log.action) {
    case "delete_job":
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={company} />
          {(!!poster || typeof meta.job_created_at === "string") && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
              {poster && (
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3 opacity-50" />
                  {t.postedBy} {poster}
                </span>
              )}
              {typeof meta.job_created_at === "string" && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 opacity-50" />
                  {t.posted} {formatDate(meta.job_created_at, locale)}
                </span>
              )}
              {typeof meta.status_at_delete === "string" && (
                <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0">
                  {t.status[meta.status_at_delete] ?? meta.status_at_delete}
                </Badge>
              )}
              {meta.bulk === true && (
                <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 border-red-300/40 text-red-600 dark:border-red-500/30 dark:text-red-400">
                  bulk
                </Badge>
              )}
            </div>
          )}
        </div>
      );

    case "approve_job":
    case "reject_job":
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={company} />
          {(!!poster || typeof meta.job_created_at === "string") && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
              {poster && (
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3 opacity-50" />
                  {t.postedBy} {poster}
                </span>
              )}
              {typeof meta.job_created_at === "string" && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 opacity-50" />
                  {t.posted} {formatDate(meta.job_created_at, locale)}
                </span>
              )}
            </div>
          )}
        </div>
      );

    case "upgrade_vip": {
      const level = String(meta.level ?? "");
      const previous = String(meta.previous_level ?? "normal");
      const days = typeof meta.days === "number" ? meta.days : null;
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={company} />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              {previous !== "normal" ? `${vipLabel(previous, t)} → ` : ""}{vipLabel(level, t)}
            </span>
            {days && <span>· {days}d</span>}
            {typeof meta.vip_until === "string" && (
              <span>· {t.to} {formatDate(meta.vip_until, locale)}</span>
            )}
          </div>
        </div>
      );
    }

    case "remove_vip": {
      const previous = String(meta.previous_level ?? "normal");
      const source = typeof meta.vip_source === "string" ? meta.vip_source : null;
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={company} />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              {vipLabel(previous, t)} → {t.level.normal}
            </span>
            {typeof meta.vip_became_active_at === "string" && (
              <span>· {t.becameVipAt} {formatDate(meta.vip_became_active_at, locale)}</span>
            )}
            {typeof meta.vip_until_at_removal === "string" && (
              <span>· {t.vipUntilWas} {formatDate(meta.vip_until_at_removal, locale)}</span>
            )}
            {source && (
              <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0">
                {t.source[source as keyof typeof t.source] ?? source}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    case "boost_purchased": {
      const level = String(meta.level ?? "");
      const days = typeof meta.days === "number" ? meta.days : null;
      const amount = typeof meta.total_amount === "string" ? meta.total_amount : null;
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={company} />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
            <span className="font-medium text-amber-700 dark:text-amber-400">
              {vipLabel(level, t)}
            </span>
            {days && <span>· {days}d</span>}
            {amount && <span className="font-semibold text-foreground/80">· {amount}</span>}
            {typeof meta.order_id === "string" && meta.order_id && (
              <span className="font-mono text-[10px] text-muted-foreground/50">· #{meta.order_id}</span>
            )}
          </div>
        </div>
      );
    }

    case "verify_company": {
      const owner = typeof meta.owner_name === "string" ? meta.owner_name : null;
      const ownerKa = typeof meta.owner_name_ka === "string" ? meta.owner_name_ka : null;
      const ownerDisplay = locale === "ka" ? (ownerKa || owner) : (owner || ownerKa);
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 opacity-50 shrink-0" />
            <span className="font-medium text-foreground/90 truncate">{company ?? "—"}</span>
          </div>
          {ownerDisplay && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <UserIcon className="h-3 w-3 opacity-50" />
              {t.owner} {ownerDisplay}
            </span>
          )}
        </div>
      );
    }

    case "change_role": {
      const oldRole = String(meta.old_role ?? "");
      const newRole = String(meta.new_role ?? "");
      const userName = typeof meta.title === "string" ? meta.title : null;
      const userNameKa = typeof meta.title_ka === "string" ? meta.title_ka : null;
      const display = locale === "ka" ? (userNameKa || userName) : (userName || userNameKa);
      return (
        <div className="flex flex-col gap-1">
          {display && (
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-3 w-3 opacity-50 shrink-0" />
              <span className="font-medium text-foreground/90 truncate">{display}</span>
            </div>
          )}
          <span className="text-[11px] text-muted-foreground/70">
            <span className="line-through">{oldRole}</span> → <span className="font-medium text-foreground/80">{newRole}</span>
          </span>
        </div>
      );
    }

    case "create_external_job": {
      const source = typeof meta.source === "string" ? meta.source : null;
      const url = typeof meta.url === "string" ? meta.url : null;
      const catKa = typeof meta.category_name_ka === "string" ? meta.category_name_ka : null;
      const catEn = typeof meta.category_name === "string" ? meta.category_name : null;
      const category = locale === "ka" ? (catKa || catEn) : (catEn || catKa);
      return (
        <div className="flex flex-col gap-1">
          <JobTitleLine title={title} company={null} />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 flex-wrap">
            {source && (
              <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0">
                {source}
              </Badge>
            )}
            {category && <span>{t.category}: {category}</span>}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary/80 hover:text-primary transition-colors truncate max-w-[240px]"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>
      );
    }

    default:
      return (
        <span className="text-[11px] text-muted-foreground/50">
          {log.target_type} · <span className="font-mono">{log.target_id.slice(0, 8)}</span>
        </span>
      );
  }
}

function JobTitleLine({ title, company }: { title: string | null; company: string | null }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {title ? (
        <span className="font-medium text-foreground/90 truncate">{title}</span>
      ) : (
        <span className="text-muted-foreground/40">—</span>
      )}
      {company && (
        <>
          <span className="text-muted-foreground/30">—</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground/70">
            <Building2 className="h-3 w-3 opacity-50" />
            {company}
          </span>
        </>
      )}
    </div>
  );
}

function vipLabel(level: string, t: LogTranslations): string {
  if (level === "gold") return `🥇 ${t.level.gold}`;
  if (level === "silver") return `🥈 ${t.level.silver}`;
  return t.level.normal;
}
