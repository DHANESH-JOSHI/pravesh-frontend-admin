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
    open: boolean;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: T) => void;
    initialData?: U;
}

export interface WrapperAnimationFCProps {
  children: React.ReactNode | React.ReactNode[];
  triggerOnce: boolean;
  className: string;
  index?: any;
  postData?: any;
}

export type ProductType = {
  id: number;
  name: string;
  thumb: string;
  price: string;
  count: number;
  color: string;
  size: string;
};

export type ProductStoreType = {
  id: number;
  name: string;
  thumb: string;
  price: number;
  count: number;
  color: string;
  size: string;
};

export enum TemplateEnum {
  THEME = "theme",
  TEMPLATE = "template",
}

export type ProductContentType<> = {
  url: string;
  postData?: any;
  WrapperAnimation?: React.FunctionComponent<WrapperAnimationFCProps>;
  // index?: any;
  wrapperClass?: any;
  containerTagName?: any;
  hasPaginate?: boolean;
  sortBy?: any;
  onSuccess?: (data: any) => void;
  onError?: (data: any) => void;
  view?: any;
  itemColClass?: any;
};

export interface Product {
  id: string;
  title: string;
  image: string;
  newPrice: number;
}

export interface Order {
  orderId: string;
  date: string;
  shippingMethod: string;
  totalItems: number;
  totalPrice: number;
  status: string;
  products: Product[];
}


// Re-export all types
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