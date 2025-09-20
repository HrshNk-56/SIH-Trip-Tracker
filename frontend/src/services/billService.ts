export interface ProcessedExpense {
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

const ML_API = (import.meta as any).env?.VITE_IMAGE_API || (import.meta as any).env?.VITE_ML_API || 'http://localhost:5000';

export const billService = {
  async process_bill(file: File): Promise<ProcessedExpense[]> {
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${ML_API}/image_process/process-bill`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('process bill failed');
      const data = await res.json();
      return data.items || [];
    } catch (e) {
      // Fallback: return empty array so UI can show manual modal
      return [];
    }
  }
};
