export interface Document {
  id: string;
  type: string;
  doctorName: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedDate: string;
}
