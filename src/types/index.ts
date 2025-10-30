export type ApiResponse<T = unknown> = {
  data?: T;
  message: string;
  success: boolean;
};

export interface PaginatedData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FormDialogProps<T, U> {
  title?: string;
    open: boolean;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: T) => void;
    initialData?: U;
}

export * from './address';
export * from './auth';
export * from './banner';
export * from './blog';
export * from './brand';
export * from './cart';
export * from './category';
export * from './order';
export * from './product';
export * from './review';
export * from './user';
export * from './wallet';
export * from './wishlist';