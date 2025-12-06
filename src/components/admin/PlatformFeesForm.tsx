"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Percent } from "lucide-react";

interface PlatformFeesFormProps {
  initialGrabFoodRate?: number;
  initialLineManRate?: number;
}

export default function PlatformFeesForm({
  initialGrabFoodRate = 30,
  initialLineManRate = 30,
}: PlatformFeesFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [grabFoodRate, setGrabFoodRate] = useState(initialGrabFoodRate);
  const [lineManRate, setLineManRate] = useState(initialLineManRate);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        setGrabFoodRate(data.grabFoodFeeRate);
        setLineManRate(data.lineManFeeRate);
      }
    } catch {
      console.error("Error fetching settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grabFoodFeeRate: grabFoodRate,
          lineManFeeRate: lineManRate,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("บันทึกค่าธรรมเนียมเรียบร้อยแล้ว");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          ค่าธรรมเนียมแพลตฟอร์ม
        </CardTitle>
        <CardDescription>
          กำหนดอัตรา GP สำหรับแต่ละแพลตฟอร์มการสั่งซื้อ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <Alert className="border-primary bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grabFoodRate">
                อัตรา GP ของ GrabFood
              </Label>
              <div className="relative">
                <Input
                  id="grabFoodRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={grabFoodRate}
                  onChange={(e) => setGrabFoodRate(parseFloat(e.target.value) || 0)}
                  disabled={saving}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ค่าธรรมเนียมที่ GrabFood หักจากยอดขาย
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineManRate">
                อัตรา GP ของ LINE MAN
              </Label>
              <div className="relative">
                <Input
                  id="lineManRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={lineManRate}
                  onChange={(e) => setLineManRate(parseFloat(e.target.value) || 0)}
                  disabled={saving}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ค่าธรรมเนียมที่ LINE MAN หักจากยอดขาย
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
