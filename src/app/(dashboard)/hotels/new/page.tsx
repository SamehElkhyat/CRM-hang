import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HotelForm } from "@/components/hotels/hotel-form";
import { getCurrentUser } from "@/lib/auth/get-current-profile";

export default async function NewHotelPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "admin") {
    redirect("/hotels");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">إضافة فندق جديد</h1>
        <p className="text-sm text-muted-foreground">
          بيانات التواصل، فئات الغرف، وسياسة الأطفال
        </p>
      </div>
      <Card className="glass-panel max-w-3xl">
        <CardHeader>
          <CardTitle>بيانات الفندق</CardTitle>
        </CardHeader>
        <CardContent>
          <HotelForm />
        </CardContent>
      </Card>
    </div>
  );
}
