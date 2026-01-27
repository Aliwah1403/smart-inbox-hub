import { Document, User, Integration, DocumentSource, DocumentStatus } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Alex Johnson',
    avatar: undefined,
    role: 'admin',
  },
  {
    id: '2',
    email: 'staff@company.com',
    name: 'Sarah Miller',
    avatar: undefined,
    role: 'staff',
  },
];

const sources: DocumentSource[] = ['manual_upload', 'scan_to_email', 'gmail', 'outlook'];
const statuses: DocumentStatus[] = ['parsed', 'needs_review', 'processing'];
const categories = ['Invoice', 'Contract', 'Report', 'Receipt', 'Memo', 'Other'];
const allTags = ['urgent', 'finance', 'legal', 'hr', 'marketing', 'operations', 'pending', 'archived'];

const documentTitles = [
  'Q4 Financial Report 2024',
  'Vendor Agreement - Acme Corp',
  'Employee Handbook v3.2',
  'Marketing Budget Proposal',
  'IT Infrastructure Assessment',
  'Client Meeting Notes',
  'Office Lease Agreement',
  'Travel Expense Report',
  'Product Roadmap 2025',
  'Performance Review Template',
  'Insurance Policy Documents',
  'Board Meeting Minutes',
  'Supplier Invoice #INV-2024-0892',
  'NDA - Partner Company',
  'Quarterly Sales Analysis',
  'Equipment Purchase Order',
  'HR Policy Update Memo',
  'Project Timeline - Website Redesign',
  'Annual Compliance Report',
  'Customer Feedback Summary',
];

const uploaders = ['Alex Johnson', 'Sarah Miller', 'John Smith', 'Emily Davis', 'Michael Chen'];

export const mockDocuments: Document[] = Array.from({ length: 50 }, (_, i) => {
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomTags = allTags.filter(() => Math.random() > 0.7).slice(0, 3);
  const randomUploader = uploaders[Math.floor(Math.random() * uploaders.length)];
  const randomTitle = documentTitles[Math.floor(Math.random() * documentTitles.length)];
  const daysAgo = Math.floor(Math.random() * 60);
  
  return {
    id: `doc-${i + 1}`,
    filename: `${randomTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    title: randomTitle,
    uploadDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    uploader: randomUploader,
    uploaderId: randomUploader === 'Alex Johnson' ? '1' : '2',
    source: randomSource,
    status: randomStatus,
    tags: randomTags,
    category: randomCategory,
    fileSize: Math.floor(Math.random() * 5000000) + 100000,
    fileType: 'application/pdf',
    aiSummary: randomStatus === 'parsed' 
      ? `This document is a ${randomCategory.toLowerCase()} containing key information about ${randomTitle.toLowerCase()}. The AI has extracted relevant data points including dates, amounts, and key stakeholders. Primary topics include business operations and ${randomTags[0] || 'general'} matters.`
      : undefined,
    extractedFields: randomStatus === 'parsed' 
      ? {
          'Document Type': randomCategory,
          'Date': new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString(),
          'Reference Number': `REF-${Math.floor(Math.random() * 10000)}`,
          'Department': randomTags[0] ? randomTags[0].charAt(0).toUpperCase() + randomTags[0].slice(1) : 'General',
        }
      : undefined,
  };
});

export const mockIntegrations: Integration[] = [
  {
    id: 'scan-to-email',
    name: 'Scan-to-Email',
    type: 'scanner',
    status: 'connected',
    description: 'Receive documents from your office scanner via email',
    icon: 'Printer',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    type: 'email',
    status: 'not_connected',
    description: 'Import documents from your Gmail account',
    icon: 'Mail',
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    type: 'email',
    status: 'not_connected',
    description: 'Import documents from your Outlook account',
    icon: 'Mail',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    type: 'cloud_storage',
    status: 'not_connected',
    description: 'Sync documents from Google Drive',
    icon: 'Cloud',
  },
];

export const availableTags = allTags;
export const availableCategories = categories;
