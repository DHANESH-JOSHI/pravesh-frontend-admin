"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
    },
  });

  useEffect(() => {
    if (setting) {
      form.reset({
        businessName: setting.businessName || "",
        email: setting.email || "",
        phone: setting.phone || "",
        address: setting.address || "",
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
                      <Input placeholder="Enter business name..." {...field} />
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
                      <Input type="email" placeholder="Enter email..." {...field} />
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
                      <Input placeholder="Enter phone number..." {...field} />
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
                      <Input placeholder="Enter address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      <Input type="url" placeholder="https://facebook.com/..." {...field} />
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
                      <Input type="url" placeholder="https://instagram.com/..." {...field} />
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
                      <Input type="url" placeholder="https://youtube.com/..." {...field} />
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
                      <Input type="url" placeholder="https://twitter.com/..." {...field} />
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
                      <Input type="url" placeholder="https://linkedin.com/..." {...field} />
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
                    <Input placeholder="Enter about title..." {...field} />
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
                      <Input placeholder="e.g., 10+" {...field} />
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
                      <Input placeholder="e.g., 1000+" {...field} />
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
                      <Input placeholder="e.g., 500+" {...field} />
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
                      <Input placeholder="e.g., 50+" {...field} />
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
                    <Input placeholder="e.g., Mon-Fri: 9AM-6PM" {...field} />
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

