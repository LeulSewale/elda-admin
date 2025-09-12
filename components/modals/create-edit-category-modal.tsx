import { GlobalModal } from "./global-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm as useReactHookForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import React from "react";
import { useToast } from "@/hooks/use-toast";
// import { categoriesApi } from "@/lib/api/categories";
import { simulateApiDelay } from "@/lib/dummy-data";

interface CreateEditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data?: any) => void;
  initialValues?: { name?: string; id?: string };
  editMode?: boolean;
  isLoading?: boolean;
  onSave?: (data: any) => void;
}

export function CreateEditCategoryModal({ open, onOpenChange, onSuccess, initialValues, editMode = false, isLoading = false, onSave }: CreateEditCategoryModalProps) {
  const { toast } = useToast();
  const form = useReactHookForm({
    defaultValues: {
      name: initialValues?.name || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ name: initialValues?.name || "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues?.name]);

  const isSubmitting = isLoading;

  const onSubmit = async (value: any) => {
    if (editMode && onSave) {
      onSave(value);
      return;
    }
    try {
      // DUMMY DATA: Simulate API call
      await simulateApiDelay();
      const newCategory = {
        id: `cat_${Date.now()}`,
        name: value.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      toast({
        title: "Category Created",
        description: `The category '${value.name}' was created successfully!`,
        variant: "default",
      });
      onOpenChange(false);
      form.reset();
      onSuccess(newCategory);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title={editMode ? "Edit Category" : "Create New Category"}
      actions={
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-category-form"
            className="bg-[#A4D65E] hover:bg-[#95C653] w-1/2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                {editMode ? "Saving..." : "Creating..."}
              </span>
            ) : (
              editMode ? "Save Changes" : "Create Category"
            )}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="create-category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-sm mx-auto space-y-2 px-0"
        >
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="e.g. Digital" autoFocus />
                </FormControl>
                <FormDescription>Category name must be unique and descriptive.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </GlobalModal>
  );
} 