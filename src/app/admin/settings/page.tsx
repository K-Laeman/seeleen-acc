import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Percent, Tags } from "lucide-react";
import PlatformFeesForm from "@/components/admin/PlatformFeesForm";
import ExpenseCategoriesForm from "@/components/admin/ExpenseCategoriesForm";

function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  );
}

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/admin/settings");
  }

  // Check admin role
  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">
          การตั้งค่าสำหรับผู้ดูแลระบบ
        </p>
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            <span className="hidden sm:inline">ค่าธรรมเนียม</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            <span className="hidden sm:inline">หมวดหมู่รายจ่าย</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <Suspense fallback={<FormSkeleton />}>
            <PlatformFeesForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="categories">
          <Suspense fallback={<FormSkeleton />}>
            <ExpenseCategoriesForm />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
