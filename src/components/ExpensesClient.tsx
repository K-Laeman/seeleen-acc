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
  expenseCategoryLabels,
} from "@/lib/utils";
import {
  Plus,
  Wallet,
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

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  attachments?: Attachment[];
}

interface ExpensesClientProps {
  initialExpenses: Expense[];
  currentCategory: string;
}

const categories = [
  { value: "INGREDIENTS", label: "วัตถุดิบ" },
  { value: "RENT", label: "ค่าเช่า" },
  { value: "UTILITIES", label: "ค่าน้ำ/ไฟ" },
  { value: "STAFF_WAGES", label: "ค่าแรงพนักงาน" },
  { value: "PACKAGING", label: "บรรจุภัณฑ์" },
  { value: "DELIVERY_FEES", label: "ค่าจัดส่ง" },
  { value: "MARKETING", label: "การตลาด" },
  { value: "EQUIPMENT", label: "อุปกรณ์" },
  { value: "MAINTENANCE", label: "ซ่อมบำรุง" },
  { value: "OTHER", label: "อื่นๆ" },
];

const categoryVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  INGREDIENTS: "destructive",
  RENT: "secondary",
  UTILITIES: "secondary",
  STAFF_WAGES: "default",
  PACKAGING: "outline",
  DELIVERY_FEES: "outline",
  MARKETING: "secondary",
  EQUIPMENT: "outline",
  MAINTENANCE: "secondary",
  OTHER: "secondary",
};

export default function ExpensesClient({
  initialExpenses,
  currentCategory,
}: ExpensesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    category: "INGREDIENTS",
    description: "",
    date: formatDateInput(new Date()),
  });

  const handleCategoryFilter = (newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory && newCategory !== "all") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    router.push(`/expenses?${params.toString()}`);
  };

  async function refreshData() {
    const params = new URLSearchParams();
    const category = searchParams.get("category");
    if (category) params.append("category", category);
    const res = await fetch(`/api/expenses?${params}`);
    const data = await res.json();
    setExpenses(data.data || data);
  }

  function openDialog(expense?: Expense) {
    if (expense) {
      setEditingExpense(expense);
      setCurrentAttachments(expense.attachments || []);
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description || "",
        date: formatDateInput(expense.date),
      });
    } else {
      setEditingExpense(null);
      setCurrentAttachments([]);
      setFormData({
        amount: "",
        category: "INGREDIENTS",
        description: "",
        date: formatDateInput(new Date()),
      });
    }
    setIsDialogOpen(true);
  }

  async function handleUploadAttachment(file: File) {
    if (!editingExpense?.id) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recordType", "expense");
    formData.append("recordId", editingExpense.id);

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
      category: formData.category,
      description: formData.description || undefined,
      date: formData.date,
    };

    try {
      if (editingExpense) {
        await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setIsDialogOpen(false);
      await refreshData();
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeleteClick(id: string) {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!expenseToDelete) return;

    try {
      await fetch(`/api/expenses/${expenseToDelete}`, { method: "DELETE" });
      await refreshData();
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category for summary
  const expensesByCategory = expenses.reduce(
    (acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = 0;
      acc[exp.category] += exp.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">รายจ่าย</h1>
          <p className="text-muted-foreground">
            จัดการค่าใช้จ่ายทั้งหมด ({expenses.length} รายการ)
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มรายจ่าย
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            รายจ่ายรวม
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
                >
                  <span className="text-muted-foreground">
                    {expenseCategoryLabels[category]}:
                  </span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">กรองตามหมวดหมู่:</span>
            </div>
            <Select
              value={currentCategory || "all"}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
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
              <TableHead>หมวดหมู่</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">ยังไม่มีรายการรายจ่าย</p>
                    <p className="text-xs">คลิก &quot;เพิ่มรายจ่าย&quot; เพื่อเริ่มต้นบันทึก</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryVariants[expense.category]}>
                      {expenseCategoryLabels[expense.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate">
                        {expense.description || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </span>
                      {expense.attachments && expense.attachments.length > 0 && (
                        <Badge variant="outline" className="flex-shrink-0">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {expense.attachments.length}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {formatCurrency(expense.amount)}
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
                        <DropdownMenuItem onClick={() => openDialog(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(expense.id)}
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
          {expenses.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  รวม ({expenses.length} รายการ)
                </TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
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
              {editingExpense ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่าย"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "แก้ไขข้อมูลรายจ่ายของคุณ"
                : "กรอกข้อมูลรายจ่ายใหม่"}
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
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  recordType="expense"
                  recordId={editingExpense?.id || null}
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
                  : editingExpense
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

