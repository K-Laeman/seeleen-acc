"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Tags, RotateCcw } from "lucide-react";
import { defaultExpenseCategoryLabels, expenseCategoryKeys } from "@/lib/validations/admin-settings";

export default function ExpenseCategoriesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [labels, setLabels] = useState<Record<string, string>>(defaultExpenseCategoryLabels);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.expenseCategoryLabels) {
        setLabels(data.expenseCategoryLabels);
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
          expenseCategoryLabels: labels,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("บันทึกหมวดหมู่เรียบร้อยแล้ว");
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

  function handleReset() {
    setLabels(defaultExpenseCategoryLabels);
  }

  function updateLabel(key: string, value: string) {
    setLabels((prev) => ({ ...prev, [key]: value }));
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              หมวดหมู่รายจ่าย
            </CardTitle>
            <CardDescription>
              กำหนดชื่อแสดงผลสำหรับแต่ละหมวดหมู่รายจ่าย
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            รีเซ็ตค่าเริ่มต้น
          </Button>
        </div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            {expenseCategoryKeys.map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-xs text-muted-foreground">
                  {key}
                </Label>
                <Input
                  id={key}
                  value={labels[key] || ""}
                  onChange={(e) => updateLabel(key, e.target.value)}
                  placeholder={defaultExpenseCategoryLabels[key]}
                  disabled={saving}
                  maxLength={50}
                />
              </div>
            ))}
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
