import { create } from 'zustand';

export type ReportStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface SupportReport {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  status: ReportStatus;
  orderId?: string;
  complaintType?: string;
}

interface SupportState {
  reports: SupportReport[];
  addReport: (report: Omit<SupportReport, 'id' | 'date' | 'status'>) => void;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  clearReports: () => void;
}

// Helper to generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to format current date
const formatDate = () => {
  const date = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return `${months[date.getMonth()]} ${day}${suffix}, ${date.getFullYear()}`;
};

export const useSupportStore = create<SupportState>((set) => ({
  reports: [],
  
  addReport: (report) =>
    set((state) => ({
      reports: [
        {
          ...report,
          id: generateId(),
          date: formatDate(),
          status: 'Pending',
        },
        ...state.reports,
      ],
    })),
    
  updateReportStatus: (id, status) =>
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id ? { ...report, status } : report
      ),
    })),
    
  clearReports: () => set({ reports: [] }),
}));
