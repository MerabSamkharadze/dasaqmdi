"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRoleAction } from "@/lib/actions/admin";
import { USER_ROLES } from "@/lib/types/enums";
import { useTransition } from "react";

type AdminRoleSelectProps = {
  userId: string;
  currentRole: string;
};

export function AdminRoleSelect({ userId, currentRole }: AdminRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      await updateUserRoleAction(userId, value as "seeker" | "employer" | "admin");
    });
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[110px] h-8 text-[12px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLES.map((role) => (
          <SelectItem key={role} value={role} className="text-[12px]">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
