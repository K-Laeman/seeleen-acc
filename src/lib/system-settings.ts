import { prisma } from "@/lib/prisma";
import { defaultExpenseCategoryLabels } from "@/lib/validations/admin-settings";

export interface SystemSettings {
  grabFoodFeeRate: number;
  lineManFeeRate: number;
  expenseCategoryLabels: Record<string, string>;
}

const defaultSettings: SystemSettings = {
  grabFoodFeeRate: 30,
  lineManFeeRate: 30,
  expenseCategoryLabels: defaultExpenseCategoryLabels,
};

// Server-side function to get system settings
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "system-settings" },
    });

    if (!settings) {
      return defaultSettings;
    }

    return {
      grabFoodFeeRate: settings.grabFoodFeeRate,
      lineManFeeRate: settings.lineManFeeRate,
      expenseCategoryLabels: {
        ...defaultExpenseCategoryLabels,
        ...(settings.expenseCategoryLabels as Record<string, string>),
      },
    };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return defaultSettings;
  }
}

// Get expense category label (for use in components)
export function getExpenseCategoryLabel(
  category: string,
  labels: Record<string, string>
): string {
  return labels[category] || defaultExpenseCategoryLabels[category] || category;
}
