"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatCurrency,
  formatDate,
  formatDateInput,
  incomeSourceLabels,
} from "@/lib/utils";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Paperclip,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobUrl: string;
}

interface Income {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
  platformFee: number | null;
  platformFeeRate: number | null;
  netAmount: number | null;
  attachments?: Attachment[];
}

interface IncomeClientProps {
  initialIncomes: Income[];
  currentSource: string;
}

const sources = [
  { value: "OFFLINE_STORE", label: "หน้าร้าน", variant: "secondary" as const },
  { value: "GRAB_FOOD", label: "GrabFood", variant: "default" as const },
  { value: "LINE_MAN", label: "LINE MAN", variant: "outline" as const },
];

const sourceVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  OFFLINE_STORE: "secondary",
  GRAB_FOOD: "default",
  LINE_MAN: "outline",
};

export default function IncomeClient({
  initialIncomes,
  currentSource,
}: IncomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    source: "OFFLINE_STORE",
    description: "",
    date: formatDateInput(new Date()),
  });

  const handleSourceFilter = (newSource: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSource && newSource !== "all") {
      params.set("source", newSource);
    } else {
      params.delete("source");
    }
    router.push(`/income?${params.toString()}`);
  };

  async function refreshData() {
    const params = new URLSearchParams();
    const source = searchParams.get("source");
    if (source) params.append("source", source);
    const res = await fetch(`/api/income?${params}`);
    const data = await res.json();
    setIncomes(data.data || data);
  }

  function openDialog(income?: Income) {
    if (income) {
      setEditingIncome(income);
      setCurrentAttachments(income.attachments || []);
      setFormData({
        amount: income.amount.toString(),
        source: income.source,
        description: income.description || "",
        date: formatDateInput(income.date),
      });
    } else {
      setEditingIncome(null);
      setCurrentAttachments([]);
      setFormData({
        amount: "",
        source: "OFFLINE_STORE",
        description: "",
        date: formatDateInput(new Date()),
      });
    }
    setIsDialogOpen(true);
  }

  async function handleUploadAttachment(file: File) {
    if (!editingIncome?.id) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recordType", "income");
    formData.append("recordId", editingIncome.id);

    const res = await fetch("/api/attachments/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const attachment = await res.json();
      setCurrentAttachments((prev) => [...prev, attachment]);
      await refreshData();
    } else {
      const error = await res.json();
      toast.error(error.error || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
    }
  }

  async function handleDeleteAttachment(id: string) {
    const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCurrentAttachments((prev) => prev.filter((a) => a.id !== id));
      await refreshData();
    } else {
      const error = await res.json();
      toast.error(error.error || "เกิดข้อผิดพลาดในการลบไฟล์");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      amount: parseFloat(formData.amount),
      source: formData.source,
      description: formData.description || undefined,
      date: formData.date,
    };

    try {
      if (editingIncome) {
        await fetch(`/api/income/${editingIncome.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setIsDialogOpen(false);
      await refreshData();
    } catch (error) {
      console.error("Error saving income:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeleteClick(id: string) {
    setIncomeToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!incomeToDelete) return;

    try {
      await fetch(`/api/income/${incomeToDelete}`, { method: "DELETE" });
      await refreshData();
    } catch (error) {
      console.error("Error deleting income:", error);
    } finally {
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    }
  }

  const totalGross = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalNet = incomes.reduce(
    (sum, inc) => sum + (inc.netAmount || inc.amount),
    0
  );
  const totalFees = incomes.reduce(
    (sum, inc) => sum + (inc.platformFee || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">รายรับ</h1>
          <p className="text-muted-foreground">
            จัดการรายรับจากทุกช่องทาง ({incomes.length} รายการ)
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มรายรับ
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายรับรวม
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGross)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ค่าธรรมเนียม
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              -{formatCurrency(totalFees)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายรับสุทธิ
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalNet)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">กรองตามช่องทาง:</span>
            </div>
            <Select
              value={currentSource || "all"}
              onValueChange={handleSourceFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="เลือกช่องทาง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>ช่องทาง</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="text-right">ค่าธรรมเนียม</TableHead>
              <TableHead className="text-right">สุทธิ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">ยังไม่มีรายการรายรับ</p>
                    <p className="text-xs">คลิก &quot;เพิ่มรายรับ&quot; เพื่อเริ่มต้นบันทึก</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">
                    {formatDate(income.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sourceVariants[income.source]}>
                      {incomeSourceLabels[income.source]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate">
                        {income.description || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </span>
                      {income.attachments && income.attachments.length > 0 && (
                        <Badge variant="outline" className="flex-shrink-0">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {income.attachments.length}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(income.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {income.platformFee ? (
                      <span className="text-orange-600 font-medium">
                        -{formatCurrency(income.platformFee)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(income.netAmount || income.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">เปิดเมนู</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(income)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(income.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {incomes.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  รวม ({incomes.length} รายการ)
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totalGross)}
                </TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  -{formatCurrency(totalFees)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatCurrency(totalNet)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? "แก้ไขรายรับ" : "เพิ่มรายรับ"}
            </DialogTitle>
            <DialogDescription>
              {editingIncome
                ? "แก้ไขข้อมูลรายรับของคุณ"
                : "กรอกข้อมูลรายรับใหม่"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">ช่องทาง</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) =>
                    setFormData({ ...formData, source: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่องทาง" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.source === "GRAB_FOOD" ||
                  formData.source === "LINE_MAN") && (
                    <p className="text-xs text-orange-600">
                      * ค่าธรรมเนียม 30% จะถูกคำนวณอัตโนมัติ
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียด (ไม่บังคับ)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="หมายเหตุ..."
                />
              </div>

              <div className="space-y-2">
                <Label>ไฟล์แนบ</Label>
                <FileUpload
                  recordType="income"
                  recordId={editingIncome?.id || null}
                  attachments={currentAttachments}
                  onUpload={handleUploadAttachment}
                  onDelete={handleDeleteAttachment}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? "กำลังบันทึก..."
                  : editingIncome
                    ? "บันทึก"
                    : "เพิ่ม"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

