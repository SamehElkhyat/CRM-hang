"use client";

import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RawTextInput({
  value,
  onChange,
  onParse,
  isParsing,
}: {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  isParsing: boolean;
}) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>نص الحجز الخام</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="الصق تفاصيل الحجز باللغة العربية هنا..."
          className="min-h-48 resize-y"
          dir="rtl"
        />
        <Button onClick={onParse} disabled={isParsing || !value.trim()} className="self-start">
          {isParsing ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {isParsing ? "جاري التحليل..." : "تحليل النص"}
        </Button>
      </CardContent>
    </Card>
  );
}
