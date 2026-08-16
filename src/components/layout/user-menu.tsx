import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { signOut } from "@/app/(dashboard)/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/lib/auth/get-current-profile";

function initials(name: string | null, email: string | null) {
  const source = name?.trim() || email || "?";
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const displayName = user.profile?.full_name || user.email || "مستخدم";
  const isAdmin = user.profile?.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            aria-label="قائمة المستخدم"
          />
        }
      >
        <Avatar className="avatar-ring size-8">
          <AvatarFallback>
            {initials(user.profile?.full_name ?? null, user.email)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {isAdmin ? (
              <ShieldCheck className="size-3.5 text-primary" />
            ) : (
              <UserIcon className="size-3.5 text-muted-foreground" />
            )}
            {displayName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {isAdmin ? "مسؤول" : "عضو فريق"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut />
            تسجيل الخروج
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
