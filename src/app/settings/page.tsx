import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Lock, Settings } from "lucide-react";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";
import PreferencesForm from "@/components/settings/PreferencesForm";

function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  );
}

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/settings");
  }

  const params = await searchParams;
  const validTabs = ["profile", "security", "preferences"];
  const defaultTab = validTabs.includes(params.tab || "") ? params.tab : "profile";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการบัญชีและการตั้งค่าของคุณ
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">โปรไฟล์</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">ความปลอดภัย</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">การตั้งค่า</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Suspense fallback={<FormSkeleton />}>
            <ProfileForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="security">
          <Suspense fallback={<FormSkeleton />}>
            <PasswordForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="preferences">
          <Suspense fallback={<FormSkeleton />}>
            <PreferencesForm />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
