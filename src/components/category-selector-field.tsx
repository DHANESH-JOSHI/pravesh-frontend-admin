import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CategorySelector } from '@/components/category-selector';
import { useEffect, useState } from 'react';
import { brandService } from '@/services/brand.service';
import { Brand, Category } from '@/types';
import { useWatch } from 'react-hook-form';

export function CategorySelectorField({ form }: { form:any }) {
  const brandId = useWatch({ control: form.control, name: 'brandId' });
  const [brand,setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const loadRoot = async () => {
      if (!brandId) {
        setBrand(null);
        form.setValue('categoryId', '');
        return;
      }
      const res = await brandService.getById(brandId);
      const data = res.data;
      setBrand(data!)
      form.setValue('categoryId', '');
    };
    loadRoot();
  }, [brandId, form]);
  const category = brand ? brand.category as Category : null;
  return (
    <FormField
      control={form.control}
      name="categoryId"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Category *</FormLabel>
          <CategorySelector
            value={category?.title}
            onChange={field.onChange}
            initialCategoryId={category?._id ?? null}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
