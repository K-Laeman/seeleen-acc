"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle, Settings, Sun, Moon, Monitor, Languages } from "lucide-react";

interface Preferences {
  theme: "light" | "dark" | "system";
  language: "th" | "en";
}

export default function PreferencesForm() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    language: "th",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/user/preferences");
      const data = await res.json();
      if (res.ok) {
        setPreferences(data);
        // Sync theme with next-themes
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch {
      console.error("Error fetching preferences");
    } finally {
      setLoading(false);
    }
  }

  async function updatePreference(key: keyof Preferences, value: string) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();

      if (res.ok) {
        setPreferences(data.preferences);
        setSuccess("บันทึกการตั้งค่าเรียบร้อยแล้ว");

        // Apply theme change immediately
        if (key === "theme") {
          setTheme(value);
        }

        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(data.error || "ไม่สามารถบันทึกการตั้งค่าได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || loading) {
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
          <Settings className="h-5 w-5" />
          การตั้งค่าแอปพลิเคชัน
        </CardTitle>
        <CardDescription>
          ปรับแต่งการแสดงผลและภาษาตามที่คุณต้องการ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            ธีม
          </Label>
          <Select
            value={preferences.theme}
            onValueChange={(value) => updatePreference("theme", value)}
            disabled={saving}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="เลือกธีม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  ธีมสว่าง
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  ธีมมืด
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  ตามระบบ
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            เลือกธีมที่คุณต้องการใช้งาน
          </p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            ภาษา
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => updatePreference("language", value)}
            disabled={saving}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="เลือกภาษา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="th">ไทย</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            เลือกภาษาที่ใช้แสดงผลในแอปพลิเคชัน (เร็วๆ นี้)
          </p>
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังบันทึก...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
