"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { settingService } from "@/services/setting.service";
import { Setting, UpdateSetting, updateSettingSchema } from "@/types/setting";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { invalidateSettingQueries } from "@/lib/invalidate-queries";

// Helper function to safely convert string or array to array, filtering out empty values
const normalizeArrayField = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value];
  }
  return [];
};

export function SettingsForm() {
  const logoRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => await settingService.get(),
  });

  const setting = data?.data as Setting | undefined;

  const form = useForm<UpdateSetting>({
    resolver: zodResolver(updateSettingSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      address: "",
      mapAddress: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        youtube: "",
        twitter: "",
        linkedin: "",
      },
      aboutTitle: "",
      aboutDescription: "",
      yearsOfExperience: "",
      happyCustomers: "",
      productsAvailable: "",
      citiesServed: "",
      workingHours: "",
      whyChooseUs: "",
        privacyPolicy: {
          introduction: "",
          informationWeCollect: [],
          howWeUseInformation: [],
          informationSharing: [],
          dataSecurity: "",
          userRights: [],
          cookies: "",
          thirdPartyServices: [],
          changesToPolicy: "",
        },
        returnsRefunds: {
          introduction: "",
          returnEligibility: [],
          returnTimeframe: "",
          returnProcess: [],
          refundPolicy: "",
          nonRefundableItems: [],
          exchangePolicy: "",
          returnShipping: "",
          refundProcessingTime: "",
        },
    },
  });

  useEffect(() => {
    if (setting) {
      form.reset({
        businessName: setting.businessName || "",
        email: setting.email || "",
        phone: setting.phone || "",
        address: setting.address || "",
        mapAddress: setting.mapAddress || "",
        logo: setting.logo || undefined,
        socialLinks: {
          facebook: setting.socialLinks?.facebook || "",
          instagram: setting.socialLinks?.instagram || "",
          youtube: setting.socialLinks?.youtube || "",
          twitter: setting.socialLinks?.twitter || "",
          linkedin: setting.socialLinks?.linkedin || "",
        },
        aboutTitle: setting.aboutTitle || "",
        aboutDescription: setting.aboutDescription || "",
        yearsOfExperience: setting.yearsOfExperience || "",
        happyCustomers: setting.happyCustomers || "",
        productsAvailable: setting.productsAvailable || "",
        citiesServed: setting.citiesServed || "",
        workingHours: setting.workingHours || "",
        whyChooseUs: setting.whyChooseUs || "",
        privacyPolicy: {
          introduction: setting.privacyPolicy?.introduction || "",
          informationWeCollect: normalizeArrayField(setting.privacyPolicy?.informationWeCollect),
          howWeUseInformation: normalizeArrayField(setting.privacyPolicy?.howWeUseInformation),
          informationSharing: normalizeArrayField(setting.privacyPolicy?.informationSharing),
          dataSecurity: setting.privacyPolicy?.dataSecurity || "",
          userRights: normalizeArrayField(setting.privacyPolicy?.userRights),
          cookies: setting.privacyPolicy?.cookies || "",
          thirdPartyServices: normalizeArrayField(setting.privacyPolicy?.thirdPartyServices),
          changesToPolicy: setting.privacyPolicy?.changesToPolicy || "",
        },
        returnsRefunds: {
          introduction: setting.returnsRefunds?.introduction || "",
          returnEligibility: normalizeArrayField(setting.returnsRefunds?.returnEligibility),
          returnTimeframe: setting.returnsRefunds?.returnTimeframe || "",
          returnProcess: normalizeArrayField(setting.returnsRefunds?.returnProcess),
          refundPolicy: setting.returnsRefunds?.refundPolicy || "",
          nonRefundableItems: normalizeArrayField(setting.returnsRefunds?.nonRefundableItems),
          exchangePolicy: setting.returnsRefunds?.exchangePolicy || "",
          returnShipping: setting.returnsRefunds?.returnShipping || "",
          refundProcessingTime: setting.returnsRefunds?.refundProcessingTime || "",
        },
      });
      setLogoPreview(setting.logo || null);
    }
  }, [setting, form]);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:"))
        URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const updateMutation = useMutation({
    mutationFn: settingService.update,
    onSuccess: ({ message }) => {
      toast.success(message ?? "Settings updated successfully");
      invalidateSettingQueries(queryClient);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update settings. Please try again.");
    },
  });

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }
    }
    
    form.setValue("logo", file, { shouldDirty: true });
    if (logoPreview?.startsWith("blob:"))
      URL.revokeObjectURL(logoPreview);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(setting?.logo || null);
    }
  };

  const onSubmit = (data: UpdateSetting) => {
    const logoValue = form.getValues("logo");
    const submitData: UpdateSetting = {
      ...data,
      logo: logoValue instanceof File ? logoValue : undefined,
    };
    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load settings. Please try again.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business name..." {...field} autoComplete="organization" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email..." {...field} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number..." {...field} type="tel" autoComplete="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address..." {...field} autoComplete="street-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="mapAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Map Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter address for map (e.g., Street, City, State, Country). This will be used to display the location on Google Maps." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    This address will be used specifically for the map display on the Contact page. Leave empty to use the regular address.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {logoPreview && (
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => logoRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {logoPreview ? "Change Logo" : "Upload Logo"}
                        </Button>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              handleFileChange(undefined);
                              form.setValue("logo", undefined, { shouldDirty: true });
                              if (logoRef.current) logoRef.current.value = "";
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        <input
                          ref={logoRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleFileChange(file);
                            field.onChange(file);
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://facebook.com/..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://instagram.com/..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://youtube.com/..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://twitter.com/..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://linkedin.com/..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="aboutTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter about title..." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aboutDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter about description..."
                      rows={4}
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10+" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="happyCustomers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Happy Customers</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1000+" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productsAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Products Available</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500+" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="citiesServed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cities Served</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 50+" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Hours</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mon-Fri: 9AM-6PM" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whyChooseUs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why Choose Us</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter why choose us description..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in the sections below to create your privacy policy page. All fields are optional.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Tip: Use the "Add Point" button to add bullet points for list fields.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="privacyPolicy.introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter introduction to your privacy policy..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="privacyPolicy.informationWeCollect"
              label="Information We Collect"
              placeholder="e.g., Name and contact information"
            />
            <ArrayFieldInput
              form={form}
              name="privacyPolicy.howWeUseInformation"
              label="How We Use Information"
              placeholder="e.g., Process and fulfill your orders"
            />
            <ArrayFieldInput
              form={form}
              name="privacyPolicy.informationSharing"
              label="Information Sharing"
              placeholder="e.g., Shipping partners to fulfill your orders"
            />
            <FormField
              control={form.control}
              name="privacyPolicy.dataSecurity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Security</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your data security measures..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="privacyPolicy.userRights"
              label="User Rights"
              placeholder="e.g., Access your personal information"
            />
            <FormField
              control={form.control}
              name="privacyPolicy.cookies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cookies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your cookie policy..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="privacyPolicy.thirdPartyServices"
              label="Third Party Services"
              placeholder="e.g., Payment processors (Stripe, PayPal)"
            />
            <FormField
              control={form.control}
              name="privacyPolicy.changesToPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Changes to Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain how you will notify users of policy changes..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Returns & Refunds */}
        <Card>
          <CardHeader>
            <CardTitle>Returns & Refunds</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in the sections below to create your returns and refunds policy page. All fields are optional.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Tip: Use the "Add Point" button to add bullet points for list fields.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="returnsRefunds.introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter introduction to your returns and refunds policy..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="returnsRefunds.returnEligibility"
              label="Return Eligibility"
              placeholder="e.g., Items must be unused and in original packaging"
            />
            <FormField
              control={form.control}
              name="returnsRefunds.returnTimeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Timeframe</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify the time period within which returns are accepted (e.g., 7 days, 30 days)..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="returnsRefunds.returnProcess"
              label="Return Process"
              placeholder="e.g., Contact our customer service team to initiate a return"
            />
            <FormField
              control={form.control}
              name="returnsRefunds.refundPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your refund policy, including refund methods and conditions..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrayFieldInput
              form={form}
              name="returnsRefunds.nonRefundableItems"
              label="Non-Refundable Items"
              placeholder="e.g., Custom-made or personalized items"
            />
            <FormField
              control={form.control}
              name="returnsRefunds.exchangePolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your exchange policy, if applicable..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnsRefunds.returnShipping"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Shipping</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain who pays for return shipping and how to ship items back..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnsRefunds.refundProcessingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Processing Time</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify how long it takes to process refunds (e.g., 5-7 business days)..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setLogoPreview(setting?.logo || null);
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper component for array fields with add/remove functionality
function ArrayFieldInput({
  form,
  name,
  label,
  placeholder,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: name as any,
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="mt-0"
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append("")}
        >
          <Plus className="h-4 w-4" />
          Add Point
        </Button>
      </div>
    </FormItem>
  );
}
